import spotify
from cache import Cache
from bohnifyqueue import BohnifyQueue

class Transformer(object):

  def playlistContainer(self,con, index=0):
    con.load()
    arr = []
    i = index
    while i < len(con):
      playlist = con[i]
      if isinstance(playlist, spotify.Playlist):
        arr.append(self.playlist(playlist))
      elif isinstance(playlist, spotify.PlaylistFolder):
        if playlist.type == spotify.PlaylistType.START_FOLDER:
          pls = self.playlistContainer(con,(i+1))
          arr.append({"name" : playlist.name, "playlists" : pls["playlists"]})
          i = pls["index"]
        else:
          return {"playlists" : arr, "index" : i}
      i = i+1
    return arr

  def author(self,user):
    u = Cache.Instance().getUser(user.link.uri)
    if u != None:
      return u
    user.load()
    u = {
      "nick" : user.display_name,
      "name" :user.canonical_name,
      "uri" : user.link.uri
    }
    Cache.Instance().addUser(u)
    return u

  def user(self, user):
    u = Cache.Instance().getUser(user.link.uri, True)
    if u != None:
      return u
    user.load()
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

  def playlist(self,pl):
    playlist = Cache.Instance().getPlaylist(pl.link.uri)
    if playlist != None:
      return playlist
    else:
      pl.load()
      playlist = {
        "name" : pl.name,
        "tracks" : self.tracks(pl.tracks),
        "uri" : pl.link.uri,
        "author" : self.author(pl.owner),
        "collaborative" : pl.collaborative,
        "description": pl.description
      }
      Cache.Instance().addPlaylist(playlist)
      return playlist

  def tracks(self, tracks):
    arr = []
    for t in tracks:
      arr.append(self.track(t))
    return arr


  def track(self,track):
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
        track.load()
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

  def album(self,album):
    a = Cache.Instance().getAlbum(album.link.uri)
    if a != None:
      return a
    else:
      album.load()
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
    a = Cache.Instance().getArtist(artist.link.uri)
    if a != None:
      return a
    else:
      artist.load()
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
