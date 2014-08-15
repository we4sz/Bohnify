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
from bohnifyqueue import BohnifyQueue
from cache import Cache

@Singleton
class Bohnify(object):

  _instance = None

  loginstatus = {
    "login" : False,
    "logingin" : False,
    "user" : None
  };

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
    self.session.on(spotify.SessionEvent.PLAY_TOKEN_LOST, self.on_play_token_lost)
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
	
  def on_play_token_lost(self, session):
    self.session.player.pause()
    self.status["paused"] = True
	cherrypy.engine.publish('websocket-broadcast', json.dumps({"playtoken" : True}))
    self.updateStatus()

  def updatePlaylist(self,con,playlist):
    for pl in con:
      if "playlists" in pl:
        if self.updatePlaylist(pl["playlists"],playlist):
          break
      elif pl["uri"] == playlist.link.uri:
        new_pl = Transformer().playlist(playlist)
        pl["name"] = "Starred" if "starred" in new_pl["uri"] else new_pl["name"]
        pl["author"] = new_pl["author"]
        pl["collaborative"] = new_pl["collaborative"]
        pl["description"] = new_pl["description"]
        pl["tracks"] = new_pl["tracks"]
        return True
    return False


  def playlistChanged(self, pl, *args):
    Cache.Instance().removePlaylist(pl.link.uri)
    if self.cache_playlists != None:
      self.updatePlaylist(self.cache_playlists,pl)
    playlist = Transformer().playlist(pl, True, self.playlistChanged)
    playlist["name"] = "Starred" if "starred" in playlist["uri"] else playlist["name"]
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"playlistchanged" : playlist}))

  def containerChanged(self, con, *args):
    self.getPlaylists();

  def increaseVolume(self):
    v = (self.volumeController.getVolume() + 10)
    self.volumeController.setVolume(v if v <= 100 else 100)
    self.volumeChange(self.volumeController.getVolume())

  def decreaseVolume(self):
    v = (self.volumeController.getVolume() - 10)
    self.volumeController.setVolume(v if v >= 0 else 0)
    self.volumeChange(self.volumeController.getVolume())

  def updateStatus(self):
    self.status["position"] = 0 #self.session.player.get_position()
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
        BohnifyQueue.Instance().standardqueue.append(t)
    else:
      i = 0
      while i < len(BohnifyQueue.Instance().standardqueue):
        if BohnifyQueue.Instance().standardqueue[i]["addedbyrepeat"]:
          BohnifyQueue.Instance().standardqueue.pop(i)
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
    map(clear, BohnifyQueue.Instance().standardqueue)

  def next(self):
    track = None
    add = False
    if self.status["party"] and len(BohnifyQueue.Instance().votequeue) > 0:
      track = BohnifyQueue.Instance().votequeue.pop(0)
      if track != None:
        track["vote"] = 0
        self.voteChange(track["uri"],track["vote"])
    elif len(BohnifyQueue.Instance().manualqueue) > 0:
      track = BohnifyQueue.Instance().manualqueue.pop(0)
    elif len(BohnifyQueue.Instance().standardqueue) > self.getMinimumStandard():
      if BohnifyQueue.Instance().standardqueue[0]["playing"]:
        self.giveTrackHighestSort(BohnifyQueue.Instance().standardqueue[0])
        track = BohnifyQueue.Instance().standardqueue.pop(1)
      else:
        track = BohnifyQueue.Instance().standardqueue.pop(0)
      add = True
    if track != None:
      self.play(track, add)
      if not add or not self.status["repeat"]:
        self.updatequeue()

  def prev(self):
    if False:#self.session.player.get_position() > 3000:
      self.seek(0)
    else:
      track = None
      if len(BohnifyQueue.Instance().standardqueue) > self.getMinimumStandard():
        self.giveTrackLowestSort(BohnifyQueue.Instance().standardqueue[len(BohnifyQueue.Instance().standardqueue)-1])
        if BohnifyQueue.Instance().standardqueue[len(BohnifyQueue.Instance().standardqueue)-1]["playing"]:
          track = BohnifyQueue.Instance().standardqueue[len(BohnifyQueue.Instance().standardqueue)-2]
          self.giveTrackLowestSort(BohnifyQueue.Instance().standardqueue[len(BohnifyQueue.Instance().standardqueue)-2])
        else:
          track = BohnifyQueue.Instance().standardqueue[len(BohnifyQueue.Instance().standardqueue)-1]
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
      minr = min(BohnifyQueue.Instance().standardqueue, key=lambda track: (track["shuffleround"]*100000+track["shuffle"]))
      minv = min(BohnifyQueue.Instance().standardqueue, key=lambda track: track["orig"])
    except:
      pass
    finally:
      track["orig"] = minv["orig"] - 1
      track["shuffle"] = (minr["shuffle"] - 1) if minr["shuffle"] > 0 else (len(BohnifyQueue.Instance().standardqueue) - 1)
      track["shuffleround"] = minr["shuffleround"] if minr["shuffle"] > 0 else (minr["shuffleround"] - 1)

  def giveTrackHighestSort(self, track):
    minr = {"orig" : 0, "shuffle" : 0, "shuffleround" : 0}
    minv = {"orig" : 0, "shuffle" : 0, "shuffleround" : 0}
    try:
      minv = max(BohnifyQueue.Instance().standardqueue, key=lambda track:track["orig"])
      minr = max(BohnifyQueue.Instance().standardqueue, key=lambda track: (track["shuffleround"]*100000+track["shuffle"]))
    except:
      pass
    finally:
      track["orig"] = minv["orig"] + 1
      shuffleround = minr["shuffleround"]
      shuffle = minr["shuffle"] + 1
      def filtertFunc(t):
        return t["shuffleround"] == shuffleround

      filterShuffle = filter(filtertFunc,BohnifyQueue.Instance().standardqueue)
      if len(filterShuffle) == len(BohnifyQueue.Instance().standardqueue):
        shuffleround = shuffleround + 1
        shuffle = 0

      track["shuffle"] = shuffle
      track["shuffleround"] = shuffleround


  def giveNewQueueSpot(self, track):
    self.giveTrackHighestSort(track)
    shuffleround = 0
    try:
      shuffleround = max(BohnifyQueue.Instance().standardqueue, key=lambda track:track["shuffleround"])["shuffleround"]
    except:
      pass
    finally:
      def filtertFunc(t):
        return t["shuffleround"] == shuffleround

      filterShuffle = filter(filtertFunc,BohnifyQueue.Instance().standardqueue)
      if len(filterShuffle) == len(BohnifyQueue.Instance().standardqueue):
        shuffleround = shuffleround + 1

      free = self.getFreeIndicesInRound(shuffleround)
      track["shuffle"] = free[randint(0,len(free)-1)]
      track["shuffleround"] = shuffleround


  def getFreeIndicesInRound(self, round):
    indices = range(len(BohnifyQueue.Instance().standardqueue))
    for track in BohnifyQueue.Instance().standardqueue:
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
      if False: #self.session.player.get_position() < 3000 and len(BohnifyQueue.Instance().history) > 0:
        BohnifyQueue.Instance().history.pop(0)
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
        BohnifyQueue.Instance().history.insert(0, self.status["track"])
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
    BohnifyQueue.Instance().standardqueue.append(t)
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
    self.cache_playlists = Transformer().playlistContainer(container,0, self.playlistChanged,self.containerChanged, self.session.get_starred())
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

#  def starred(self,ws):
#    pl = Transformer().playlist(self.session.get_starred())
#    pl["name"] = "Starred"
#    ws.send(json.dumps({"starred" : pl }))

  def addToManual(self, tracks):
    for track in tracks:
      if self.status["party"]:
        voteUp(track)
      else:
        BohnifyQueue.Instance().manualqueue.append(Transformer().track(self.session.get_link(track).as_track()))
        self.updatequeue()


  def removeFromManual(self,tracks):
    for track in tracks:
      if self.status["party"]:
        self.voteDown(track)
      else:
        t = self.getUriFromList(BohnifyQueue.Instance().manualqueue, track)
        if t != None:
          BohnifyQueue.Instance().manualqueue.remove(t)
    self.updatequeue()


  def voteUp(self,uri):
    if self.status["track"] == None:
      self.play(uri)
    else:
      track = self.getUriFromList(BohnifyQueue.Instance().votequeue, uri)
      if track != None:
        track["vote"] = track["vote"] + 1
      else:
        track = Transformer().track(self.session.get_link(uri).as_track())
        track["vote"] = 1
        BohnifyQueue.Instance().votequeue.append(track)
      self.voteChange(track["uri"],track["vote"])
      self.updatequeue()

  def voteChange(self, uri, vote):
    list.sort(BohnifyQueue.Instance().votequeue, key=lambda track: (track["vote"]*-1))
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"votechange" : {"uri": uri, "vote":vote}}))

  def voteDown(self,uri):
    track = self.getUriFromList(BohnifyQueue.Instance().votequeue, uri)
    if track != None:
      track["vote"] = track["vote"] - 1
      self.voteChange(track["uri"],track["vote"])
      if track["vote"] == 0:
        BohnifyQueue.Instance().votequeue.remove(track)
    self.updatequeue()

  def startQueue(self, queue):
    t = None
    if self.status["random"]:
      t = queue.pop(randint(0,len(queue)-1))
    else:
      t = queue.pop(0)
    self.playFromUri(t,queue)


  def setStandard(self, tracks):
    BohnifyQueue.Instance().standardqueue = []
    for index, track in enumerate(tracks):
      t = Transformer().track(self.session.get_link(track).as_track())
      t["orig"] = index
      t["shuffle"] = index
      t["shuffleround"] = 0
      t["addedbyrepeat"] = False
      BohnifyQueue.Instance().standardqueue.append(t)
    if self.status["random"]:
      self.shuffleStandardQueue()
    self.clearPlaying()
    self.updatequeue()

  def shuffleStandardQueue(self):
    shuffle(BohnifyQueue.Instance().standardqueue)
    for index, track in enumerate(BohnifyQueue.Instance().standardqueue):
      track["shuffle"] = index
      track["shuffleround"] = 0

  def clearAddedByRepeat(self):
    def clear(track):
      track["addedbyrepeat"] = False
    map(clear, BohnifyQueue.Instance().standardqueue)

  def sortStandardQueue(self):
    self.clearAddedByRepeat()
    if self.status["random"]:
      list.sort(BohnifyQueue.Instance().standardqueue, key=lambda track: (track["shuffleround"]*100000+track["shuffle"]))
    else:
      list.sort(BohnifyQueue.Instance().standardqueue, key=lambda track:track["orig"])

  def removeFromStandard(self, tracks):
    for track in tracks:
      t = self.getUriFromList(BohnifyQueue.Instance().standardqueue, track)
      if t != None:
        BohnifyQueue.Instance().standardqueue.remove(t)
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
