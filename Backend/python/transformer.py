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
    return {
      "uri" : album.link.uri,
      "title" : album.name,
      "cover" : ""#album.cover_link().uri
    }

  def artists(self,artists):
    a = []
    for artist in artists:
      artist.load()
      a.append({
        "name" : artist.name,
        "uri" : artist.link.uri,
        "portrait" : ""#artist.portrait_link().uri
      })
    return a
