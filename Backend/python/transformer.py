import spotify
from cache import Cache
from bohnifyqueue import BohnifyQueue

class Transformer(object):

  def playlistContainer(self, con, index=0, listener = None, conlistener = None):
    con.load()
    arr = []
    i = index
    while i < len(con):
      playlist = con[i]
      if isinstance(playlist, spotify.Playlist):
        arr.append(self.playlist(playlist, True, listener))
      elif isinstance(playlist, spotify.PlaylistFolder):
        if playlist.type == spotify.PlaylistType.START_FOLDER:
          pls = self.playlistContainer(con,(i+1),listener)
          print playlist.name
          arr.append({"name" : playlist.name, "playlists" : pls["playlists"]})
          i = pls["index"]
        else:
          return {"playlists" : arr, "index" : i}
      i = i+1

    if conlistener != None and con.num_listeners(spotify.PlaylistContainerEvent.PLAYLIST_ADDED) == 0:
      con.on(spotify.PlaylistContainerEvent.PLAYLIST_ADDED ,conlistener)
      con.on(spotify.PlaylistContainerEvent.PLAYLIST_REMOVED ,conlistener)
      con.on(spotify.PlaylistContainerEvent.PLAYLIST_MOVED ,conlistener)

    return arr

  def author(self,user):
    user.load()
    u = Cache.Instance().getUser(user.link.uri)
    if u != None:
      return u
    u = {
      "nick" : user.display_name,
      "name" :user.canonical_name,
      "uri" : user.link.uri
    }
    Cache.Instance().addUser(u)
    return u

  def user(self, user):
    user.load()
    u = Cache.Instance().getUser(user.link.uri, True)
    if u != None:
      return u
    starred = self.playlist(user.starred)
    starred["name"] =  "Starred"
    playlists = self.playlistContainer(user.published_playlists)
    u = {
      "nick" : user.display_name,
      "name" :user.canonical_name,
      "uri" : user.link.uri,
      "playlists" : playlists
    }
    Cache.Instance().addUser(u, True)
    return u

  def playlist(self,pl, tracks = True, listener=None):
    pl.load()
    playlist = Cache.Instance().getPlaylist(pl.link.uri)
    if playlist != None:
      return playlist
    else:
      playlist = {
        "name" : pl.name,
        "uri" : pl.link.uri,
        "author" : self.author(pl.owner),
        "collaborative" : pl.collaborative,
        "description": pl.description
      }
      if tracks:
        playlist["tracks"] =  self.tracks(pl.tracks)
        Cache.Instance().addPlaylist(playlist)

      if listener != None and pl.num_listeners(spotify.PlaylistEvent.TRACKS_ADDED) == 0:
        pl.on(spotify.PlaylistEvent.TRACKS_ADDED, listener)
        pl.on(spotify.PlaylistEvent.TRACKS_REMOVED, listener)
        pl.on(spotify.PlaylistEvent.TRACKS_MOVED, listener)
        pl.on(spotify.PlaylistEvent.PLAYLIST_RENAMED, listener)
        #pl.on(spotify.PlaylistEvent.PLAYLIST_STATE_CHANGED, listener)
        #pl.on(spotify.PlaylistEvent.PLAYLIST_METADATA_UPDATED, listener)
        pl.on(spotify.PlaylistEvent.DESCRIPTION_CHANGED, listener)
        pl.on(spotify.PlaylistEvent.IMAGE_CHANGED, listener)
      return playlist


  def tracks(self, tracks):
    arr = []
    for t in tracks:
      track = self.track(t)
      if(track != None):
        arr.append(track)
    return arr


  def track(self,track):
    track.load()
    t = Cache.Instance().getTrack(track.link.uri)
    if t != None:
      BohnifyQueue.Instance().setVoteToTrack(t)
      return t
    else:
      t = BohnifyQueue.Instance().getTrackIfIsAnyQueue(track.link.uri)
      if t != None:
        BohnifyQueue.Instance().setVoteToTrack(t)
        return t
      else:
        if track.availability == spotify.TrackAvailability.AVAILABLE:
          t = {
            "title" : track.name,
            "popularity": track.popularity,
            "duration" : track.duration,
            "uri" : track.link.uri,
            "album" : self.album(track.album),
            "artists" : self.artists(track.artists)
          }
          Cache.Instance().addTrack(t)
          BohnifyQueue.Instance().setVoteToTrack(t)
          return t
        else:
          return None

  def album(self,album):
    album.load()
    a = Cache.Instance().getAlbum(album.link.uri)
    if a != None:
      return a
    else:
      cover = None
      try:
        cover = album.cover_link().uri
      except:
        pass
      a = {
        "uri" : album.link.uri,
        "title" : album.name,
        "cover" : cover
      }
      Cache.Instance().addAlbum(a)
      return a

  def albums_b(self,albums, callback):
    arr = []
    def albumLoaded(album):
      arr.append(album)
      if(len(arr) == len(albums)):
        callback(arr)
    for album in albums:
      self.album_b(album,albumLoaded)


  def album_b(self,album, callback):
    a = Cache.Instance().getAlbum(album.link.uri, True)
    if a != None:
      callback(a)
    else:
      def albumBrowsed(album):
        cover = None
        try:
          cover = album.album.cover_link().uri
        except:
          pass
        a = {
          "uri" : album.album.link.uri,
          "title" : album.album.name,
          "cover" : cover,
          "type" : album.album.type,
          "tracks" : self.tracks(album.tracks),
          "artists" : [self.artist(album.artist)],
          "year" : album.album.year
        }
        Cache.Instance().addAlbum(a, True)
        callback(a)
      album = album.browse(albumBrowsed)

  def artists(self,artists):
    a = []
    for artist in artists:
      a.append(self.artist(artist))
    return a

  def artist(self, artist):
    artist.load()
    a = Cache.Instance().getArtist(artist.link.uri)
    if a != None:
      return a
    else:
      por = None
      try:
        por = artist.portrait_link().uri
      except:
        pass
      a = {
        "name" : artist.name,
        "uri" : artist.link.uri,
        "portrait" : por
      }
      Cache.Instance().addArtist(a)
      return a

  def artist_b(self, artist, callback):
    a = Cache.Instance().getArtist(artist.link.uri, True)
    if a != None:
      callback(a)
    else:
      def artistBrowsed(artist):
        por = None
        try:
          por = artist.artist.portrait_link().uri
        except:
          pass
        a = {
          "name" : artist.artist.name,
          "uri" : artist.artist.link.uri,
          "portrait" : por,
          "bio" : artist.biography,
          "topTracks" : self.tracks(artist.tophit_tracks),
          "similar" : self.artists(artist.similar_artists)
        }
        def albumsBrowsed(albums):
          a["albums"] = albums
          Cache.Instance().addArtist(a, True)
          callback(a)
        self.albums_b(artist.albums,albumsBrowsed)
      artist = artist.browse(spotify.ArtistBrowserType.NO_TRACKS,artistBrowsed)
