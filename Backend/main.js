var options = {
    settingsFolder: 'settings',
    cacheFolder: 'cache',
    traceFile: 'trace.txt', //default is empty,
    appkeyFile: 'spotify_appkey.key' //required
}

var spotify = require('../Spotify/spotify')(options);

var ready = function()  {
    if(!spotify.sessionUser.starredPlaylist.isLoaded){
      setTimeout(ready,100);
    }else{
      console.log(spotify.sessionUser.starredPlaylist);
      var starredPlaylist = spotify.sessionUser.starredPlaylist;
      spotify.player.play(starredPlaylist.getTrack(0));
    }

};

var play = function(uri){


};


spotify.on({
    ready: ready
});

spotify.login('we4sz', 'john1991', false, false);
