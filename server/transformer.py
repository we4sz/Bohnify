import spotify
from cache import Cache
from bohnifyqueue import BohnifyQueue

class Transformer(object):

  def playlistContainer(self, con,callback, listener = None, listen = False, starred = None):

    def loaded(plcon):
      if not listen:
        con.off(spotify.PlaylistContainerEvent.CONTAINER_LOADED)
      callback(browse(plcon,0))

    def browse(plcon, index):
      plcon.load()
      arr = []
      i = index
      if starred != None:
        pl = self.playlist(starred, True, listener)
        arr.append(pl)

      while i < len(con):
        playlist = con[i]
        if isinstance(playlist, spotify.Playlist):
          arr.append(self.playlist(playlist, True, listener))
        elif isinstance(playlist, spotify.PlaylistFolder):
          if playlist.type == spotify.PlaylistType.START_FOLDER:
            pls = browse(con,(i+1))
            arr.append({"name" : playlist.name, "playlists" : pls["playlists"]})
            i = pls["index"]
          else:
            return {"playlists" : arr, "index" : i}
        i = i+1
      return arr

    if con.num_listeners(spotify.PlaylistContainerEvent.CONTAINER_LOADED) == 0:
      con.on(spotify.PlaylistContainerEvent.CONTAINER_LOADED ,loaded)


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

  def user(self, user, callback):
    user.load()
    u = Cache.Instance().getUser(user.link.uri, True)
    if u != None:
      return u

    def playlistscallback(playlists):
      u = {
        "nick" : user.display_name,
        "name" :user.canonical_name,
        "uri" : user.link.uri,
        "playlists" : playlists
      }
      Cache.Instance().addUser(u, True)
      return u

    self.playlistContainer(user.published_playlists, playlistscallback, None, False, user.starred)

  def search_playlists(self,pls):
    arr = []
    for pl in pls:
      arr.append(self.playlist(pl.playlist))
      if len(arr) == 3:
        return arr
    return arr

  def search_playlist(self,pl):
    playlist = Cache.Instance().getPlaylist(pl.uri,True)
    if playlist != None:
      return playlist
    else:
      playlist = {
        "name" : pl.name,
        "uri" : pl.uri,
        "image" : pl.image_uri
      }
      return playlist

  def playlist(self,pl, tracks = True, listener=None):
    pl.load()
    playlist = Cache.Instance().getPlaylist(pl.link.uri)
    if playlist != None:
      return playlist
    else:
      playlist = {
        "name" : "Starred" if "starred" in pl.link.uri else pl.name,
        "uri" : pl.link.uri,
        "author" : self.author(pl.owner),
        "collaborative" : pl.collaborative,
        "description": pl.description
      }
      img = pl.image()
      if img != None:
        img.load()
        playlist["image"] = img.link.uri
      if tracks:
        tracks = pl.tracks[::-1] if "starred" in pl.link.uri else pl.tracks
        playlist["tracks"] =  self.tracks(tracks,pl.link.uri)
        Cache.Instance().addPlaylist(playlist)

      if listener != None and pl.num_listeners(spotify.PlaylistEvent.PLAYLIST_UPDATE_IN_PROGRESS) == 0:
        #pl.on(spotify.PlaylistEvent.TRACKS_ADDED, listener)
        #pl.on(spotify.PlaylistEvent.TRACKS_REMOVED, listener)
        #pl.on(spotify.PlaylistEvent.TRACKS_MOVED, listener)
        #pl.on(spotify.PlaylistEvent.PLAYLIST_RENAMED, listener)
        #pl.on(spotify.PlaylistEvent.PLAYLIST_STATE_CHANGED, listener)
        #pl.on(spotify.PlaylistEvent.PLAYLIST_METADATA_UPDATED, listener)
        #pl.on(spotify.PlaylistEvent.DESCRIPTION_CHANGED, listener)
        pl.on(spotify.PlaylistEvent.PLAYLIST_UPDATE_IN_PROGRESS, listener)
      return playlist


  def tracks(self, tracks, context):
    arr = []
    for tindex in range(len(tracks)):
      track = self.track(tracks[tindex],context)
      if(track != None):
        track = track.copy()
        track["origindex"] = tindex
        arr.append(track)
    return arr


  def track(self,track,context):
    track.load()
    t = Cache.Instance().getTrack(track.link.uri)
    if t != None:
      BohnifyQueue.Instance().setVoteToTrack(t)
      t["context"] = "spotify:"+context
      return t
    else:
      t = BohnifyQueue.Instance().getTrackIfIsAnyQueue(track.link.uri)
      if t != None:
        BohnifyQueue.Instance().setVoteToTrack(t)
        t["context"] = "spotify:"+context
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
          t["context"] = "spotify:"+context
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
        "artist" : self.artist(album.artist),
        "cover" : cover
      }
      Cache.Instance().addAlbum(a)
      return a

  def albums(self,albums):
    arr = []
    for album in albums:
      arr.append(self.album(album))
    return arr

  def albums_b(self,albums, callback, artist):
    arr = []
    tmp = []
    def albumLoaded(album):
      tmp.append(album)
      if album != None:
        arr.append(album)
      if(len(tmp) == len(albums)):
        callback(arr)
    for album in albums:
      self.album_b(album,albumLoaded,artist,arr)

  def arrayContainsAlbum(self, arr, album):
    for a in arr:
      if a["title"] == album:
        return True
    return False

  def album_b(self,album, callback, artist = None, arr = None):
    a = Cache.Instance().getAlbum(album.link.uri, True)
    if arr != None:
      self.album(album)
      if self.arrayContainsAlbum(arr, album.name):
        return callback(None)
      elif album.type > 1:
        return callback(None)
      elif artist != None and artist != album.artist.link.uri:
        return callback(None)
    if a != None:
      return callback(a)
    else:
      def albumBrowsed(album):
        album.load()
        album.album.load()
        if arr != None:
          if self.arrayContainsAlbum(arr, album.album.name):
            return callback(None)
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
          "artist" : self.artist(album.artist),
          "year" : album.album.year
        }
        if artist == None or artist == album.artist.link.uri:
          a["tracks"] = self.tracks(album.tracks,album.album.link.uri)
          Cache.Instance().addAlbum(a, True)
        else:
          a["type"] = 4
        if arr != None:
          if ("tracks" in a and len(a["tracks"]) == 0) or self.arrayContainsAlbum(arr, album.album.name):
            return callback(None)
        return callback(a)
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
          "toptracks" : self.tracks(artist.tophit_tracks,artist.artist.link.uri),
          "similar" : self.artists(artist.similar_artists)
        }
        def albumsBrowsed(albums):
          a["albums"] = albums
          Cache.Instance().addArtist(a, True)
          callback(a)
        self.albums_b(artist.albums,albumsBrowsed,artist.artist.link.uri)
      artist = artist.browse(spotify.ArtistBrowserType.NO_TRACKS,artistBrowsed)
