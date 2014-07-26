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
  votequeue = [];
  history = [];
  cache_playlists = None;
  lastprev = False

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
    self.status["track"] = None
    self.updateStatus()
    self.next()

  def increaseVolume(self):
    v = (self.volumeController.getVolume() + 10)
    self.volumeController.setVolume(v if v <= 100 else 100)
    self.volumeChange(self.volumeController.getVolume())

  def decreaseVolume(self):
    v = (self.volumeController.getVolume() - 10)
    self.volumeController.setVolume(v if v >= 0 else 0)
    self.volumeChange(self.volumeController.getVolume())

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
    self.sortStandardQueue()
    self.updateStatus()
    self.updatequeue()

  def toggleRepeat(self):
    self.status["repeat"] = not self.status["repeat"]
    if self.status["repeat"]:
      if self.status["track"] != None:
        t = self.status["track"]
        t["addedbyrepeat"] = True
        self.giveNewQueueSpot(t)
        self.standardqueue.append(t)
    else:
      i = 0
      while i < len(self.standardqueue):
        if self.standardqueue[i]["addedbyrepeat"]:
          self.standardqueue.pop(i)
        else:
          i = i + 1

    self.sortStandardQueue()
    self.updatequeue()
    self.updateStatus()

  def toggleParty(self):
    self.status["party"] = not self.status["party"]
    self.updateStatus()

  def getMinimumStandard(self):
    return 1 if self.status["repeat"] else 0

  def clearPlaying(self):
    def clear(track):
      track["playing"] = False
    map(clear, self.standardqueue)

  def indexOfPlaying(self):
    print("--------------------")
    print("len: "+str(len(self.standardqueue)))
    for i,t in enumerate(self.standardqueue):
      if t["playing"]:
        print(i)
    print("-----------------------")

  def next(self):
    print("next")
    track = None
    add = False
    if self.status["party"] and len(self.votequeue) > 0:
      track = self.votequeue.pop(0)
    elif len(self.manualqueue) > 0:
      track = self.manualqueue.pop(0)
    if track == None and len(self.standardqueue) > self.getMinimumStandard():
      self.indexOfPlaying()
      if self.standardqueue[0]["playing"]:
        self.giveTrackHighestSort(self.standardqueue[0])
        track = self.standardqueue.pop(1)
      else:
        track = self.standardqueue.pop(0)
      add = True
    if track != None:
      self.play(track, add)
      if not add or not self.status["repeat"]:
        self.updatequeue()

  def prev(self):
    if self.session.player.get_position() > 3000:
      self.seek(0)
    else:
      track = None
      if len(self.standardqueue) > self.getMinimumStandard():
        self.giveTrackLowestSort(self.standardqueue[len(self.standardqueue)-1])
        if self.standardqueue[len(self.standardqueue)-1]["playing"]:
          track = self.standardqueue[len(self.standardqueue)-2]
          self.giveTrackLowestSort(self.standardqueue[len(self.standardqueue)-2])
        else:
          track = self.standardqueue[len(self.standardqueue)-1]
      self.sortStandardQueue()
      if track != None:
        self.clearPlaying()
        track["playing"] = True
        self.updatequeue()
        self.play(track, False)

  def giveTrackLowestSort(self,track):
    minr = {"orig" : 0, "shuffle" : 0, "shuffleround" : 0}
    minv = {"orig" : 0, "shuffle" : 0, "shuffleround" : 0}
    try:
      minr = min(self.standardqueue, key=lambda track: (track["shuffleround"]*100000+track["shuffle"]))
      minv = min(self.standardqueue, key=lambda track: track["orig"])
    except:
      pass
    finally:
      track["orig"] = minv["orig"] - 1
      track["shuffle"] = (minr["shuffle"] - 1) if minr["shuffle"] > 0 else (len(self.standardqueue) - 1)
      track["shuffleround"] = minr["shuffleround"] if minr["shuffle"] > 0 else (minr["shuffleround"] - 1)

  def giveTrackHighestSort(self, track):
    minr = {"orig" : 0, "shuffle" : 0, "shuffleround" : 0}
    minv = {"orig" : 0, "shuffle" : 0, "shuffleround" : 0}
    try:
      minv = max(self.standardqueue, key=lambda track:track["orig"])
      minr = max(self.standardqueue, key=lambda track: (track["shuffleround"]*100000+track["shuffle"]))
    except:
      pass
    finally:
      track["orig"] = minv["orig"] + 1
      shuffleround = minr["shuffleround"]
      shuffle = minr["shuffle"] + 1
      def filtertFunc(t):
        return t["shuffleround"] == shuffleround

      filterShuffle = filter(filtertFunc,self.standardqueue)
      if len(filterShuffle) == len(self.standardqueue):
        shuffleround = shuffleround + 1
        shuffle = 0

      track["shuffle"] = shuffle
      track["shuffleround"] = shuffleround


  def giveNewQueueSpot(self, track):
    self.giveTrackHighestSort(track)
    shuffleround = 0
    try:
      shuffleround = max(self.standardqueue, key=lambda track:track["shuffleround"])["shuffleround"]
    except:
      pass
    finally:
      def filtertFunc(t):
        return t["shuffleround"] == shuffleround

      filterShuffle = filter(filtertFunc,self.standardqueue)
      if len(filterShuffle) == len(self.standardqueue):
        shuffleround = shuffleround + 1

      free = self.getFreeIndicesInRound(shuffleround)
      track["shuffle"] = free[randint(0,len(free)-1)]
      track["shuffleround"] = shuffleround


  def getFreeIndicesInRound(self, round):
    indices = range(len(self.standardqueue))
    for track in self.standardqueue:
      if track["shuffleround"] == round:
        indices.remove(track["shuffle"])
    return indices

  def playFromUri(self, track, queue=None):
    if queue != None:
      self.setStandard(queue)
    if self.status["party"]:
      self.voteUp(track)
    else:
      self.play(track)

  def play(self, track, add=True):
    def startTrack(t):
      if self.session.player.get_position() < 3000 and len(self.history) > 0:
        self.history.pop(0)
      self.session.player.unload()
      try:
        self.session.player.load(t)
        self.session.player.play()
        self.status["track"] = Transformer().track(t)
        if self.status["repeat"] and add:
          self.addTrackRepeat(self.status["track"])
        elif add and not self.status["repeat"]:
          self.clearPlaying()
        self.status["paused"] = False
        self.updateStatus()
        self.history.insert(0, self.status["track"])
        self.updatehistory()
      except:
        print(t)
        print("next pga can't play")
        self.next()
    if isinstance(track, spotify.Track):
      startTrack(track.load())
    elif isinstance(track, dict):
      startTrack(self.session.get_link(track["uri"]).as_track().load())
    elif isinstance(track, basestring):
      startTrack(self.session.get_link(track).as_track().load())



  def addTrackRepeat(self,track):
    t = self.status["track"]
    t["addedbyrepeat"] = True
    self.clearPlaying()
    t["playing"] = True
    self.giveNewQueueSpot(t)
    self.standardqueue.append(t)
    self.sortStandardQueue()
    self.updatequeue()

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
    def trackBrowsed(album):
      ws.send(json.dumps({"search" : {"type" : "track", "data" :album, "search":link.uri}}))
    track = Transformer().track(link.as_track())
    Transformer().album_b(self.session.get_link(track["album"]["uri"]).as_album(),trackBrowsed)

  def browseAlbum(self, link,  ws):
    def albumBrowsed(album):
      ws.send(json.dumps({"search" : {"type" : "album", "data" :album, "search":link.uri}}))
    Transformer().album_b(link.as_album(),albumBrowsed)


  def browseArtist(self, link,  ws):
    def artistBrowsed(artist):
      ws.send(json.dumps({"search" : {"type" : "artist", "data" :artist, "search":link.uri}}))
    Transformer().artist_b(link.as_artist(),artistBrowsed)

  def browsePlaylist(self, link,  ws):
    playlist = Transformer().playlist(link.as_playlist())
    ws.send(json.dumps({"search" : {"type" : "playlist", "data" :playlist, "search":link.uri}}))

  def browseUser(self, link,  ws):
    user = Transformer().user(link.as_user())
    ws.send(json.dumps({"search" : {"type" : "user", "data" :user, "search":link.uri}}))

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

  def starred(self,ws):
    pl = Transformer().playlist(self.session.get_starred())
    pl["name"] = "Starred"
    ws.send(json.dumps({"starred" : pl }))

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
        t = self.getUriFromList(self.manualqueue, track)
        if t != None:
          self.manualqueue.remove(t)
    self.updatequeue()


  def voteUp(self,uri):
    if self.status["track"] == None:
      self.play(uri)
    else:
      track = self.getUriFromList(self.votequeue, uri)
      if track != None:
        track["vote"] = track["vote"] + 1
      else:
        track = Transformer().track(self.session.get_link(uri).as_track())
        track["vote"] = 1
        self.votequeue.append(track)
      self.updatequeue()



  def voteDown(self,uri):
    track = self.getUriFromList(self.votequeue, uri)
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
    for index, track in enumerate(tracks):
      t = Transformer().track(self.session.get_link(track).as_track())
      t["orig"] = index
      t["shuffle"] = index
      t["shuffleround"] = 0
      t["addedbyrepeat"] = False
      self.standardqueue.append(t)
    if self.status["random"]:
      self.shuffleStandardQueue()
    self.clearPlaying()
    self.updatequeue()

  def shuffleStandardQueue(self):
    shuffle(self.standardqueue)
    for index, track in enumerate(self.standardqueue):
      track["shuffle"] = index
      track["shuffleround"] = 0

  def clearAddedByRepeat(self):
    def clear(track):
      track["addedbyrepeat"] = False
    map(clear, self.standardqueue)

  def sortStandardQueue(self):
    self.clearAddedByRepeat()
    if self.status["random"]:
      list.sort(self.standardqueue, key=lambda track: (track["shuffleround"]*100000+track["shuffle"]))
    else:
      list.sort(self.standardqueue, key=lambda track:track["orig"])

  def removeFromStandard(self, tracks):
    for track in tracks:
      t = self.getUriFromList(self.standardqueue, track)
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
