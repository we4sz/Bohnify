import spotify

class Transformer(object):


  def playlistContainer(self,con, index=0):
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
    user.load();
    return {
      "nick" : user.display_name,
      "name" :user.canonical_name,
      "uri" : user.link.uri
    }

  def playlist(self,pl):
    pl.load()
    return {
      "name" : pl.name,
      "tracks" : self.tracks(pl.tracks),
      "uri" : pl.link.uri,
      "author" : self.author(pl.owner),
      "collaborative" : pl.collaborative,
      "description": pl.description
    }

  def tracks(self, tracks):
    arr = []
    for t in tracks:
      arr.append(self.track(t))
    return arr

  def track(self,track):
    track.load()
    return {
      "title" : track.name,
      "popularity": track.popularity,
      "duration" : track.duration,
      "uri" : track.link.uri,
      "album" : self.album(track.album),
      "artists" : self.artists(track.artists)
    }

  def album(self,album):
    album.load()
    cover = None
    try:
      cover = album.cover_link().uri
    except:
      pass
    return {
      "uri" : album.link.uri,
      "title" : album.name,
      "cover" : cover
    }

  def albums_b(self,albums):
    arr = []
    for album in albums:
      arr.append(self.album_b(album))
    return arr

  def album_b(self,album):
    album = album.browse().load()
    cover = None
    try:
      cover = album.album.cover_link().uri
    except:
      pass
    return {
      "uri" : album.album.link.uri,
      "title" : album.album.name,
      "cover" : cover,
      "type" : album.album.type,
      "tracks" : self.tracks(album.tracks),
      "artists" : [self.artist(album.artist)],
      "year" : album.album.year
    }

  def artists(self,artists):
    a = []
    for artist in artists:
      a.append(self.artist(artist))
    return a

  def artist(self, artist):
    artist.load()
    por = None
    try:
      por = artist.portrait_link().uri
    except:
      pass
    return {
      "name" : artist.name,
      "uri" : artist.link.uri,
      "portrait" : por
    }

  def artist_b(self, artist):
    artist = artist.browse(spotify.ArtistBrowserType.NO_TRACKS).load()
    por = None
    try:
      por = artist.artist.portrait_link().uri
    except:
      pass
    return {
      "name" : artist.artist.name,
      "uri" : artist.artist.link.uri,
      "portrait" : por,
      "bio" : artist.biography,
      "topTracks" : self.tracks(artist.tophit_tracks),
      "similar" : self.artists(artist.similar_artists),
      "albums" : self.albums_b(artist.albums)
    }
