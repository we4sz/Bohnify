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

  ws.on('message', function(message) {
    var msg = JSON.parse(message);

    if(msg.login){
      login(msg.login.username,msg.login.password,ws);
    }
  });

  ws.on('close', function() {

  });
});

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
var orginalqueue = [];
var history = [];

var status= {
  random : true,
  repeat : true,
  paused : true,
  position : 0,
  track : undefined
}


var toTracks = function(ts,ca){
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

var toTrack = function(t,ca,i){
  i = typeof i !== 'undefined' ? i : -1;
  var track = {};
  track.title =  t.name;
  track.popularity = t.popularity;
  track.duration = t.duration;
  track.uri = t.link;
  toAlbum(t.album, function(album){
    track.album = album;
    if(track.artists){
      ca(track,i);
    }
  },false);
  toArtists(t.artists, function(artists){
    track.artists = artists;
    if(track.album){
      ca(track,i);
    }
  },false);
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


var toArtist = function(a,ca, browse,i){
  i = typeof i !== 'undefined' ? i : -1;
  var artist = {};
  artist.name = a.name;
  artist.uri = a.link;
  if(browse){
    artist.bio = a.biography;
    toTracks(a.tracks,function(tracks){
      artist.tracks = tracks;
      if(artist.topTracks && artist.albums){
        return ca(artist,i);
      }
    });
    toTracks(a.tophitTracks,function(tracks){
      artist.topTracks = tracks;
      if(artist.albums && artist.tracks){
        return ca(artist,i);
      }
    });
    browseAlbums(a.albums,function(albums){
      artist.albums = albums;
      if(artist.topTracks && artist.tracks){
        return ca(artist,i);
      }
    });
  }else{
      return ca(artist,i);
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
    toArtist(album,fun,browse,index);
  });
};


var toAlbum = function(a,ca, browse,i){
  i = typeof i !== 'undefined' ? i : -1;
  var album = {};
  album.uri = a.link;
  album.title = a.name;
  if(browse){
    toTracks(a.tracks,function(tracks){
      album.tracks = tracks;
      if(album.artists){
        return ca(album,i);
      }
    });
    if(a.artists){
      toArtists(a.artists,function(artists){
          album.artists = artists;
          if(album.tracks){
            return ca(album,i);
          }
      },false);
    }else{
      toArtist(a.artist,function(artist){
          album.artists = [artist];
          if(album.tracks){
            return ca(album,i);
          }
      },false);
    }
  }else{
    return ca(album,i);
  }
}

var toPlaylist = function(pl,ca,i){
  i = typeof i !== 'undefined' ? i : -1;
  var playlist = {};
  playlist.name = pl.name;
  playlist.uri = pl.link;
  playlist.collaborative = pl.collaborative;
  playlist.description = pl.description;
  toTracks(pl.getTracks(),function(ts){
    playlist.tracks = ts;
    ca(playlist);
  });
}

var search = function(query){
    if(query.indexOf("spotify:track")==0){
      var track = spotify.createFromLink(query);
      toTrack(track,function(track){


      });
    }else if(query.indexOf("spotify:album")==0){
      var album = spotify.createFromLink(query);
        album.browse(function(err, ba){
          toAlbum(ba,function(ta){


          },true);
        });
    }else if(query.indexOf("spotify:artist")==0){
      var artist = spotify.createFromLink(query);
      artist.browse( spotify.constants.ARTISTBROWSE_FULL,function(err, ba){
        toArtist(ba,function(ta){



        },true);
      });
    }else if(query.indexOf(":playlist:")!=-1){
        var playlist = spotify.createFromLink(query);
        toPlaylist(playlist,function(pl){


        });
    }else if(query.indexOf("spotify:user")==0){

    }else{
      var search = new spotify.Search(query,0,100);
      search.albumLimit = 0;
      search.artistLimit = 0;
      search.playlistLimit = 0;
      search.execute( function(err, searchResult) {
        toTracks(searchResult.tracks,function(tracks){


        });
      });
    }
}


var ready = function(){
  loginstatus.logingin = false;
  loginstatus.login = true;
  loginstatus.user = {uri : spotify.sessionUser.link, name: spotify.sessionUser.displayName};
  wss.broadcast(JSON.stringify({loginstatus: loginstatus}));
  search("spotify:album:59c6n3KjcLWLKqESPFtfHd");
}



var play = function(uri){
  spotify.player.play(starredPlaylist.getTrack(0));
};


spotify.on({
    ready: function(){
      loginsocket = undefined;
      setTimeout(ready,2000);
    },logout :function(){
      if(loginstatus.logingin && loginsocket){
        loginsocket.send(JSON.stringify({loginstatus : {loginerror: "Bad username or password!"}}));
      }
      loginstatus.logingin = false;
      loginstatus.login = false;
      loginstatus.user = undefined;
      wss.broadcast(JSON.stringify({loginstatus : loginstatus}),loginsocket);
      loginsocket = undefined;
    }
});

var login = function(username, password, ws){
  loginsocket = ws;
  loginstatus.logingin = true;
  wss.broadcast(JSON.stringify({loginstatus : loginstatus}));
  spotify.login(username, password, false, false);
}
