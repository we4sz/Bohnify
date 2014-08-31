from singelton import Singleton
from bohnifyqueue import BohnifyQueue

@Singleton
class Cache(object):

  tracks = {}
  artists = {}
  albums = {}
  playlists = {}
  users = {}

  def addTrack(self,track):
    self.tracks[track["uri"]] = track

  def addPlaylist(self,playlist,search = False):
    self.playlists[playlist["uri"] + "_s" if search else ""] = playlist

  def addUser(self,user, browse = False):
    self.users[user["uri"] + "_b" if browse else ""] = user

  def addAlbum(self, album, browse = False):
    self.albums[album["uri"] + "_b" if browse else ""] = album

  def addArtist(self, artist, browse = False):
    self.artists[artist["uri"] + "_b" if browse else ""] = artist

  def getTrack(self, uri):
    return self.tracks[uri] if uri in self.tracks else None

  def getPlaylist(self, uri, search = False):
    uri = uri+"_s" if search else uri
    pl = self.playlists[uri] if uri in self.playlists else None
    if pl != None and not search:
      for track in pl["tracks"]:
        BohnifyQueue.Instance().setVoteToTrack(track)
    return pl

  def getUser(self, uri, browse = False):
    uri = uri+"_b" if browse else uri
    user = self.users[uri] if uri in self.users else None
    if browse and user != None:
      for playlist in user["playlists"]:
        for track in playlist["tracks"]:
          BohnifyQueue.Instance().setVoteToTrack(track)
    return user

  def getAlbum(self, uri, browse = False):
    uri = uri+"_b" if browse else uri
    album = self.albums[uri] if uri in self.albums else None
    if browse and album != None:
      for track in album["tracks"]:
        BohnifyQueue.Instance().setVoteToTrack(track)
    return album

  def getArtist(self, uri, browse = False):
    uri = uri+"_b" if browse else uri
    artist = self.artists[uri] if uri in self.artists else None
    if browse and artist != None:
      for track in artist["toptracks"]:
        BohnifyQueue.Instance().setVoteToTrack(track)
      for album in artist["albums"]:
        if "tracks" in album:
          for track in album["tracks"]:
            BohnifyQueue.Instance().setVoteToTrack(track)
    return artist

  def removeTrack(self,uri):
    if uri in self.tracks :
      del self.tracks[uri]

  def removePlaylist(self,uri, search = False):
    uri = uri+"_s" if search else uri
    if uri in self.playlists:
      del self.playlists[uri]

  def removeUser(self,uri, browse = False):
    uri = uri+"_b" if browse else uri
    if uri in self.users:
      del self.users[uri]

  def removeAlbum(self, uri, browse = False):
    uri = uri+"_b" if browse else uri
    if uri in self.albums:
      del self.albums[uri]

  def removeArtist(self, uri, browse = False):
    uri = uri+"_b" if browse else uri
    if uri in self.artists:
      del self.artists[uri]
