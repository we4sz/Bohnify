from __future__ import unicode_literals
import cherrypy
import cmd
import logging
import threading
from singelton import Singleton
import spotify
import json
from transformer import Transformer
from threading import Timer
from random import shuffle
from random import randint
from volume import Volume

@Singleton
class Bohnify(object):

  _instance = None

  loginstatus = {
    "login" : False,
    "logingin" : False,
    "user" : None
  };

  standardqueue = [];
  manualqueue = [];
  orginalqueue = [];
  votequeue = [];
  history = [];
  cache_playlists = None;


  status = {
    "random" : True,
    "repeat" : True,
    "paused" : True,
    "position" : 0,
    "track" : None,
    "volume" : 33,
    "party": False
  }



  def __init__(self):
    print("init bohnify")

    self.session = spotify.Session()
    self.session.on(spotify.SessionEvent.CONNECTION_STATE_UPDATED, self.on_connection_state_changed)
    self.session.on(spotify.SessionEvent.END_OF_TRACK, self.on_end_of_track)
    self.session.preferred_bitrate(spotify.Bitrate.BITRATE_160k)
    try:
      self.audio_driver = spotify.AlsaSink(self.session)
    except ImportError:
      self.logger.warning('No audio sink found; audio playback unavailable.')

    self.event_loop = spotify.EventLoop(self.session)
    self.event_loop.start()
    self.volumeController = Volume.Instance()
    self.volumeController.setListener(self)
    self.status["volume"] = self.volumeController.getVolume()


  def on_connection_state_changed(self, session):
    if session.connection.state is spotify.ConnectionState.LOGGED_IN:
      self.loginstatus["logingin"] = False
      self.loginstatus["login"] = True
      cherrypy.engine.publish('websocket-broadcast', json.dumps({"loginstatus" : self.loginstatus}))
      self.updateStatus()
      Timer(0, self.getPlaylists, ()).start()
    elif session.connection.state is spotify.ConnectionState.LOGGED_OUT:
      self.loginstatus["logingin"] = False
      self.loginstatus["login"] = False
      cherrypy.engine.publish('websocket-broadcast', json.dumps({"loginstatus" : {"loginerror": "Bad username or password!"}}))

  def on_end_of_track(self, session):
    self.session.player.pause()
    self.status["paused"] = True
    self.updateStatus()
    self.next()

  def updateStatus(self):
    self.status["position"] = self.session.player.get_position()
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"status" : self.status }))

  def togglePause(self):
    self.status["paused"] = not self.status["paused"]
    if self.status["paused"]:
      self.session.player.pause()
    else:
      self.session.player.play()
    self.updateStatus()

  def volumeChange(self,volume):
    self.status["volume"] = volume
    self.updateStatus()

  def toggleRandom(self):
    self.status["random"] = not self.status["random"]
    self.updateStatus()

  def toggleRepeat(self):
    self.status["repeat"] = not self.status["repeat"]
    self.updateStatus()

  def toggleParty(self):
    self.status["party"] = not self.status["party"]
    self.updateStatus()

  def next(self):
    track = None
    if self.status["party"] and len(self.votequeue) > 0:
      track = self.votequeue.pop(0)
    elif len(self.manualqueue) > 0:
      track = self.manualqueue.pop(0)
    if track == None and len(self.standardqueue) > 0:
      track = self.standardqueue.pop(0)
    if track != None:
      self.play(track)
      self.updatequeue()

  def prev(self):
    track = None
    if len(self.history) > 0:
      track = self.history.pop(0)
    if track != None:
      self.play(track)
      self.updatehistory()

  def playFromUri(self, track, queue=None):
    if queue != None:
      self.setStandard(queue)
    self.play({"uri" : track})

  def play(self, track):
    if self.status["track"] != None:
      self.history.append(self.status["track"])
      self.updatehistory()
    t = self.session.get_link(track["uri"]).as_track()
    self.status["track"] = Transformer().track(t)
    self.session.player.unload()
    self.session.player.load(t)
    self.session.player.play()
    self.status["paused"] = False
    self.updateStatus()

  def seek(self,pos):
    self.session.player.seek(int(pos))
    self.updateStatus()

  def volume(self,value):
    self.volumeController.setVolume(int(value))

  def login(self,username,password):
    if not self.loginstatus["logingin"] and not self.loginstatus["login"]:
      self.session.login(username, password, remember_me=True)
      self.loginstatus["logingin"] = True
      cherrypy.engine.publish('websocket-broadcast', json.dumps({"loginstatus" : self.loginstatus}))


  def getPlaylists(self):
    container = self.session.playlist_container
    if container.is_loaded:
      self.cache_playlists = Transformer().playlistContainer(container)
    else:
      container.load()
      self.cache_playlists = Transformer().playlistContainer(container)
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"playlists" : self.cache_playlists}))

  def browseTrack(self, link,  ws):
    track = Transformer().track(link.as_track())
    album = Transformer().album_b(self.session.get_link(track["album"]["uri"]).as_album())
    ws.send(json.dumps({"search" : {"type" : "track", "data" :album, "search":link.uri}}))


  def browseAlbum(self, link,  ws):
    album = Transformer().album_b(link.as_album())
    ws.send(json.dumps({"search" : {"type" : "album", "data" :album, "search":link.uri}}))

  def browseArtist(self, link,  ws):
    artist = Transformer().artist_b(link.as_artist())
    ws.send(json.dumps({"search" : {"type" : "artist", "data" :artist, "search":link.uri}}))

  def browsePlaylist(self, link,  ws):
    playlist = Transformer().playlist(link.as_playlist())
    ws.send(json.dumps({"search" : {"type" : "playlist", "data" :playlist, "search":link.uri}}))

  def browseUser(self, link,  ws):
    print("bu")

  def search(self, query,  ws):
    result = self.session.search(query, track_count = 100,album_count=0,artist_count=0,playlist_count=0)
    result.load()
    tracks = Transformer().tracks(result.tracks)
    ws.send(json.dumps({"search" : {"type" : "search", "data" :tracks, "search":query, "suggestion" : result.did_you_mean}}))

  def toplist(self,ws):
    toplist = self.session.get_toplist(type=spotify.ToplistType.TRACKS, region = "SE")
    toplist.load()
    tracks = Transformer().tracks(toplist.tracks)
    ws.send(json.dumps({"toplist" : tracks }))

  def addToManual(self, tracks):
    for track in tracks:
      if self.status["party"]:
        voteUp(track)
      else:
        self.manualqueue.append(Transformer().track(self.session.get_link(track).as_track()))
    self.updatequeue()


  def removeFromManual(self,tracks):
    for track in tracks:
      if self.status["party"]:
        voteDown(track)
      else:
        t = getUriFromList(self.manualqueue, track)
        if t != None:
          self.manualqueue.remove(t)
    self.updatequeue()


  def voteUp(self,track):
    track = getUriFromList(self.votequeue, track)
    if track != None:
      track["vote"] = track["vote"] + 1
    else:
      track = Transformer().track(self.session.get_link(track).as_track())
      track["vote"] = 1
      self.votequeue.append(track)
    self.updatequeue()


  def voteDown(self,track):
    track = getUriFromList(self.votequeue, track)
    if track != None:
      track["vote"] = track["vote"] - 1
      if track["vote"] == 0:
        self.votequeue.remove(track)
    self.updatequeue()

  def startQueue(self, queue):
    t = None
    if self.status["random"]:
      t = queue.pop(randint(0,len(queue)-1))
    else:
      t = queue.pop(0)
    self.playFromUri(t,queue)


  def setStandard(self, tracks):
    self.standardqueue = []
    self.orginalqueue = []
    for track in tracks:
      t = Transformer().track(self.session.get_link(track).as_track())
      self.standardqueue.append(t)
      self.orginalqueue.append(t)
    if self.status["random"]:
      shuffle(self.standardqueue)
    self.updatequeue()


  def removeFromStandard(self, tracks):
    for track in tracks:
      t = getUriFromList(self.standardqueue, track)
      if t != None:
        self.standardqueue.remove(t)
    self.updatequeue()

  def getUriFromList(self, list, uri):
    for item in list:
      if item["uri"] == uri:
        return item
    return None

  def updatequeue(self):
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"queueupdated" : True}))

  def updatehistory(self):
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"historyupdated" : True}))
