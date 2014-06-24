var HashMap = require('hashmap').HashMap;
var albummap = new HashMap();
var trackmap = new HashMap();
var artistmap = new HashMap();

var fs = require('fs-extra');
fs.remove("./cache");
fs.remove("./settings");
var request = require('request');
var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express();

app.use(express.static(__dirname +"/../Frontend"));

var server = http.createServer(app);
server.listen(1650);

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
  ws.send(JSON.stringify({loginstatus : loginstatus}));
  if(cache_playlists){
    ws.send(JSON.stringify({playlists:cache_playlists}));
  }
  update(ws);
  ws.on('message', function(message) {
    var msg = JSON.parse(message);

    if(msg.login){
      login(msg.login.username,msg.login.password,ws);
    }else if(msg.search){
      search(msg.search,ws);
    }else if(msg.play){
      if(status.party){
        voteUp([msg.play.track]);
      }else{
        playuri(msg.play.track);
      }
      setStandardQueue(msg.play.queue,msg.play.track);
    }else if(msg.manualqueue){
      if(status.party){
        voteUp(msg.manualqueue);
      }else{
        addToManualQueue(msg.manualqueue);
      }
    }else if(msg.removemanualqueue){
      if(status.party){
        voteDown(msg.removemanualqueue);
      }else{
        removeFromToManualQueue(msg.removemanualqueue);
      }
    }else if(msg.standardqueue){
      setStandardQueue(msg.standardqueue);
    }else if(msg.startqueue){
      if(status.party){
        voteUp(msg.startqueue);
      }else{
        var split = 0;
        if(status.random){
          split =  Math.floor(Math.random() * msg.startqueue.length);
        }
        var a = msg.startqueue.splice(split,1)[0];
        playuri(a);
        setStandardQueue(msg.startqueue);
      }
    }else if(msg.removestandardqueue){
      removeFromStandardQueue(msg.removestandardqueue);
    }else if(msg.random){
      status.random = !status.random;
      if(status.random){
        standardqueue = shuffle(orginalqueue.slice());
      }else{
        standardqueue = orginalqueue.slice();
      }
      update();
    }else if(msg.repeat){
      status.repeat = !status.repeat;
      update();
    }else if(msg.seek){
      spotify.player.seek(parseInt(msg.seek));
      var done = function(){
        if(spotify.player.currentSecond == parseInt(msg.seek)+1){
          update();
        }else{
          setTimeout(done,100);
        }
      }
      done();
    }else if(msg.volume){
      status.volume = msg.volume;
      update();
    }else if(msg.pause){
      status.paused = !status.paused;
      if(status.paused){
        spotify.player.pause();
      }else if(status.track){
        spotify.player.resume();
      }
      update();
    }else if(msg.getqueue){
      if(status.party){
        ws.send(JSON.stringify({queues: [{type: "vote" , queue : votequeue}]}));
      }else{
        ws.send(JSON.stringify({queues : [{type:manualqueue,queue:manualqueue},{type:"standard",queue:standardqueue}]}));
      }
    }else if(msg.gethistory){
      ws.send(JSON.stringify({history:history}))
    }else if(msg.next){
      if(!status.party){
        next();
      }
    }else if(msg.prev){
      if(!status.party){
        prev();
      }
    }else if(msg.party){
      status.party = !status.party;
      update();
      updateQueue();
    }
  });

  ws.on('close', function() {

  });
});

var shuffle = function(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var removeAllWithUriFrom = function(tracks,removes){
  removes.forEach(function(remove){
    for(var i = 0;i<tracks.length;i++){
      if(tracks.uri == remove){
        tracks.splice(i,1);
        i--;
      }
    }
  });
}


var voteUp = function(uris){
  if(uris){
    uris.forEach(function(uri){
      var found = false;
      for(var i = 0;i<votequeue.length;i++){
        if(votequeue.uri == uri){
          votequeue[i].rank = votequeue[i].rank+1;
          found = true;
          break;
        }
      }
      if(!found){
        var track = trackmap.get(uri);
        if(track){
          track.rank = 1;
          votequeue.push(track);
        }
      }
    });
    updateQueue();
  }
}

var voteDown = function(uris){
  if(uris){
    uris.forEach(function(uri){
      for(var i = 0;i<votequeue.length;i++){
        if(votequeue.uri == uri){
          votequeue[i].rank = votequeue[i].rank-1;
          break;
        }
      }
    });
    updateQueue();
  }
}

var updateQueue = function(){


}

var setStandardQueue = function(uris,uri){
  if(uris){
    urisToTracks(uris,function(tracks){
      orginalqueue = tracks;
      if(status.random){
        standardqueue = shuffle(tracks);
      }else{
        standardqueue = tracks;
      }
    });
  }else{
    orginalqueue = [];
    standardqueue = [];
  }
}

var removeFromStandardQueue = function(uris){
  removeAllWithUriFrom(standardqueue,uris);
}

var addToManualQueue = function(tracks){
  urisToTracks(uris,function(tracks){
    tracks.forEach(function(track){
      manualqueue.push(track);
    })
  });
}

var removeFromToManualQueue = function(tracks){
  removeAllWithUriFrom(manualqueue,uris);
}

wss.broadcast = function(data,miss) {
    for(var i in this.clients){
      if(!miss || miss!=this.clients[i]){
        this.clients[i].send(data);
      }
    }
};


var loginstatus = {
  login : false,
  logingin : false,
  user : undefined
};

var loginsocket = undefined;

var options = {
    settingsFolder: 'settings',
    cacheFolder: 'cache',
    traceFile: 'trace.txt', //default is empty,
    appkeyFile: 'spotify_appkey.key' //required
}

var spotify = require('../Spotify/spotify')(options);

var standardqueue = [];
var manualqueue = [];
var votequeue = [];
var orginalqueue = [];
var history = [];
var cache_playlists = undefined;


var status= {
  random : true,
  repeat : true,
  paused : true,
  position : 0,
  track : undefined,
  volume : 0,
  party: false
}

var urisToTracks = function(uris,ca){
  if(uris.length == 0){
    ca([]);
  }else{
    var tracks = [];
    var fun = function(track, i){
      tracks.push({track:track,index:i});
      if(uris.length == tracks.length){
        tracks.sort(function(a,b){
          return a.index - b.index;
        });
        tracks = tracks.map(function(t){
          return t.track;
        });
        ca(tracks);
      }
    }
    uris.forEach(function(uri,index){
      uriToTrack(uri,fun,index);
    });
  }
}

var uriToTrack = function(uri,ca,i){
  i = typeof i !== 'undefined' ? i : -1;
  var track = trackmap.get(uri);
  if(track){
    ca(track,i);
  }else{
    toTrack(spotify.createFromLink(uri),ca);
  }
}


var toTracks = function(ts,ca){
  if(ts.length == 0){
    ca([]);
  }else{
    var tracks = [];
    var fun = function(track, i){
      tracks.push({track:track,index:i});
      if(ts.length == tracks.length){
        tracks.sort(function(a,b){
          return a.index - b.index;
        });
        tracks = tracks.map(function(t){
          return t.track;
        });
        ca(tracks);
      }
    }
    ts.forEach(function(track,index){
      toTrack(track,fun,index);
    });
  }
}

var toTrack = function(t,ca,i){
  i = typeof i !== 'undefined' ? i : -1;
  var track = trackmap.get(t.link);
  if(track){
    ca(track,i);
  }else{
    track = {};
    track.title =  t.name;
    track.popularity = t.popularity;
    track.duration = t.duration;
    track.uri = t.link;
    toAlbum(t.album, function(album){
      track.album = album;
      if(track.artists){
        trackmap.set(track.uri,track);
        ca(track,i);
      }
    },false);
    toArtists(t.artists, function(artists){
      track.artists = artists;
      if(track.album){
        trackmap.set(track.uri,track);
        ca(track,i);
      }
    },false);
  }
}

var toArtists = function(a,ca,browse){
  var artists = [];
  var fun = function(artist, i){
      artists.push({artist:artist,index:i});

      if(artists.length == a.length){
        artists.sort(function(a,b){
          return a.index - b.index;
        })
        artists = artists.map(function(artist){
          return artist.artist;
        })
        return ca(artists);
      }
  }

  a.forEach(function(artist,index){
    toArtist(artist,fun,browse,index);
  });
};

var uriToOpen = function(uri){
  var open = "http://open.spotify.com/";
  var uri = uri.substring(8);
  uri = uri.replace(":","/");
  return open+uri;
}


var toArtist = function(a,ca, browse,i){
  i = typeof i !== 'undefined' ? i : -1;
  var artist = artistmap.get(a.link+(browse?"_b":""));
  if(artist){
    ca(artist,i);
  }else{
    artist = {};
    artist.name = a.name;
    artist.uri = a.link;
    if(a.portrait == "undefined"){
      artist.portrait = undefined;
    }else{
      artist.portrait = a.portrait;
    }
    if(browse){
      artist.portraits = a.portraits;
      artist.bio = a.biography;
      toTracks(a.tophitTracks,function(tracks){
        artist.topTracks = tracks;
        if(artist.albums && artist.similar){
          artistmap.set(artist.uri+"_b",artist);
          return ca(artist,i);
        }
      });

      toArtists(a.similarArtists,function(similar){
        artist.similar = similar;
        if(artist.topTracks && artist.albums){
          artistmap.set(artist.uri+"_b",artist);
          return ca(artist,i);
        }
      });

      var aa = a.albums.slice()
      for(var j = 0 ;j<aa.length;j++){
        for(var k = (j+1);k<aa.length;k++){
          if(aa[k].name==aa[j].name){
            aa.splice(j,1);
            j--;
            break;
          }
        }
      }

      browseAlbums(aa,function(albums){
        artist.albums = albums;
        if(artist.topTracks && artist.similar){
          artistmap.set(artist.uri+"_b",artist);
          return ca(artist,i);
        }
      });
    }else{
        artistmap.set(artist.uri,artist);
        return ca(artist,i);
    }
  }
};

var browseAlbums = function(a, ca){
  var albums = [];

  var fun = function(album, i){
      albums.push({album:album,index:i});
      if(albums.length == a.length){
        albums.sort(function(a,b){
          return a.index - b.index;
        })
        albums = albums.map(function(album){
          return album.album;
        })
        return ca(albums);
      }
  }

  a.forEach(function(al,index){
    browseAlbum(al,fun,index)
  });
};

var browseAlbum = function(album,ca,i){
  i = typeof i !== 'undefined' ? i : -1;
  album.browse(function(err,album){
    toAlbum(album,function(al,index){
      ca(al,i);
    },true,i);
  });
};

var toAlbums = function(a,ca,browse){
  var albums = [];
  var fun = function(album, i){
      albums.push({album:album,index:i});
      if(albums.length == a.length){
        albums.sort(function(a,b){
          return a.index - b.index;
        })
        albums = albums.map(function(album){
          return album.album;
        })
        return ca(albums);
      }
  }

  a.forEach(function(album,index){
    toAlbum(album,fun,browse,index);
  });
};


var toAlbum = function(a,ca, browse,i){
  i = typeof i !== 'undefined' ? i : -1;
  var album = albummap.get(a.link+(browse ? "_b" : ""));
  if(album){
    ca(album,i);
  }else{
    album = {};
    album.uri = a.link;
    album.title = a.name;
    album.cover = a.cover;
    if(a.cover == "undefined"){
      album.cover = undefined;
    }else{
      album.cover = a.cover;
    }
    if(browse){
      album.type = a.type;
      album.year = a.year;
      toTracks(a.tracks,function(tracks){
        album.tracks = tracks;
        if(album.artists){
          albummap.set(album.uri+"_b",album);
          return ca(album,i);
        }
      });
      if(a.artists){
        toArtists(a.artists,function(artists){
            album.artists = artists;
            if(album.tracks){
              albummap.set(album.uri+"_b",album);
              return ca(album,i);
            }
        },false);
      }else{
        toArtist(a.artist,function(artist){
            album.artists = [artist];
            if(album.tracks){
              albummap.set(album.uri+"_b",album);
              return ca(album,i);
            }
        },false);
      }
    }else{
      albummap.set(album.uri,album);
      return ca(album,i);
    }
  }
}

var toPlaylists = function(a,ca){
  var playlists = [];
  var temp = [];
  a.forEach(function(pl,index){
    temp.push({pl:pl,index:index});
  });

  var fun = function(playlist, i){
      playlists.push({playlist:playlist,index:i});
      for(var k = 0;k<temp.length;k++){
        if(temp[k].index == i){
          temp.splice(k,1);
        }
      }
      if(playlists.length == a.length){
        playlists.sort(function(a,b){
          return a.index - b.index;
        })

        playlists = playlists.map(function(playlist){
          return playlist.playlist;
        })
        return ca(playlists);
      }
  }

  a.forEach(function(playlist,index){
      toPlaylist(playlist,fun,index);
  });
};



var toPlaylist = function(pl,ca,i){
  i = typeof i !== 'undefined' ? i : -1;
  var playlist = {};
  playlist.name = pl.name;
  playlist.uri = pl.link;
  playlist.collaborative = pl.collaborative;
  playlist.description = pl.description;
  var tracks = pl.getTracks();
  if(tracks.length>0){
    var j = 0;
    spotify.waitForLoaded(tracks,function(a){
      j++;
      if(j == tracks.length){
        toTracks(tracks,function(ts){
          playlist.tracks = ts;
          ca(playlist,i);
        });
      }
    });
  }else{
    playlist.tracks = [];
    ca(playlist,i);
  }
}

var search = function(query,ws){
    if(query.indexOf("spotify:track")==0){
      var track = spotify.createFromLink(query);
      toTrack(track,function(track){
        ws.send(JSON.stringify({search : {type : "track", data :track}}));
      });
    }else if(query.indexOf("spotify:album")==0){
      var album = spotify.createFromLink(query);
        album.browse(function(err, ba){
          toAlbum(ba,function(ta){
            ws.send(JSON.stringify({search : {type : "album", data :ta}}));
          },true);
        });
    }else if(query.indexOf("spotify:artist")==0){
      var artist = spotify.createFromLink(query);
      artist.browse( spotify.constants.ARTISTBROWSE_FULL,function(err, ba){
        toArtist(ba,function(ta){
          ws.send(JSON.stringify({search : {type : "artist", data :ta}}));
        },true);
      });
    }else if(query.indexOf(":playlist:")!=-1){
        var playlist = spotify.createFromLink(query);
        toPlaylist(playlist,function(pl){
          ws.send(JSON.stringify({search : {type : "playlist", data :pl}}));
        });
    }else if(query.indexOf("spotify:user")==0){

    }else{
      var search = new spotify.Search(query,0,100);
      search.albumLimit = 0;
      search.artistLimit = 0;
      search.playlistLimit = 0;
      search.execute( function(err, searchResult) {
        toTracks(searchResult.tracks,function(tracks){
          ws.send(JSON.stringify({search : {type : "search", data :tracks}}));
        });
      });
    }
}

var fixPlaylists = function(){
  var con = spotify.playlistContainer;
  var pls = con.getPlaylists();
  var i = 0;
  var folders = [];
  pls.forEach(function(pl,index){
    spotify.waitForLoaded([pl],function(){
      for(var j = 0;j<pls.length;j++){
        if(pls[j].type==1||pls[j].type==2){
          if(pls[j].type==1){
            folders.push({start: j,name:pls[j].name});
          }else{
            folders[folders.length-1].end = j;
          }
          pls.splice(j,1);
        }
      }
      i++;
      if(i == pls.length){
        toPlaylists(pls, function(tp){
          for(var k = folders.length-1;k>=0;k--){
            var start = folders[k].start;
            var end = folders[k].end;
            var f = tp.splice(start,end-start);
            tp.splice(start,0,{name: folders[k].name, playlists : f});
          }
          cache_playlists = tp;

          wss.broadcast(JSON.stringify({playlists : tp}));
        });
      }

    });
  });
}


var ready = function(){
  loginstatus.logingin = false;
  loginstatus.login = true;
  loginstatus.user = {uri : spotify.sessionUser.link, name: spotify.sessionUser.displayName};
  wss.broadcast(JSON.stringify({loginstatus: loginstatus}));
  fixPlaylists();
}

var next = function(){
  var track = manualqueue.shift();
  if(track){
    playuri(track.uri);
  }else{
    track = standardqueue.shift();
    if(track){
      playuri(track.uri);
    }else{
      status.paused = true;
      update();
    }
  }
}

var prev = function(){
  if(spotify.player.currentSecond < 3 || !status.track){
    var track = history.pop();
    if(track){
      playuri(track.uri,true);
    }
  }else{
    var done = function(){
      if(spotify.player.currentSecond == 1){
        update();
      }else{
        setTimeout(done,100);
      }
    }
    spotify.player.seek(0);
    done();
  }
}


var playuri = function(uri,avoidHistory){
  var track = spotify.createFromLink(uri);
  play(track,avoidHistory);
}

var play = function(track,avoidHistory){
  try{
    spotify.player.play(track);
    status.paused = false;
    var done = function(){
      if(spotify.player.currentSecond == 1){
        update();
      }else{
        setTimeout(done,100);
      }
    }
    toTrack(track, function(t){
      status.track = t;
      if(avoidHistory) {
        history.unshift(track);
      }
      done();
    });
  }catch(e){
    wss.broadcast(JSON.stringify({statusfail : "Not availiable in your country!"}));
    next();
  }
};

var update = function(ws){
  status.position = spotify.player.currentSecond;
  if(ws){
    ws.send(JSON.stringify({status : status}));
  }else{
    wss.broadcast(JSON.stringify({status : status}));
  }
}


spotify.on({
    ready: function(){
      loginsocket = undefined;
      setTimeout(ready,2000);
    },startPlaysback : function() {

    },logout :function(){
      if(loginstatus.logingin && loginsocket){
        loginsocket.send(JSON.stringify({loginstatus : {loginerror: "Bad username or password!"}}));
      }
      loginstatus.logingin = false;
      loginstatus.login = false;
      loginstatus.user = undefined;
      wss.broadcast(JSON.stringify({loginstatus : loginstatus}),loginsocket);
      loginsocket = undefined;
    },endOfTrack : function() {
      next();
    },playTokenLost : function() {
      wss.broadcast(JSON.stringify({statusfail : "Spotify is playing somewhere else!"}));
      status.paused = true;
      update();
    }
});

var login = function(username, password, ws){
  loginsocket = ws;
  loginstatus.logingin = true;
  wss.broadcast(JSON.stringify({loginstatus : loginstatus}));
  spotify.login(username, password, false, false);
}
