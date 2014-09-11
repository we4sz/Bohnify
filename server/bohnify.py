#from __future__ import unicode_literals
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
import bohnifysink
from array import *

@Singleton
class Bohnify(object):

  _instance = None
  time = 0
  position = 0
  loginstatus = {
    "login" : False,
    "logingin" : False,
    "user" : None,
    "playlists" : None
  };

  context = ""

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
  frames = array('c')

  def musiclistener(self,audio_format, frames, num_frames):
    for lisener in self.listeners:
      lisener.got_music(frames)

  def addtime(self, frames):
    self.position = self.position + ((frames*1000)/44100)

  def endprogram(self):
    self.audio_driver.stop()


  def startlisten(self,listener):
    self.listeners.append(listener)

  def stoplisten(self,listener):
    try:
      self.listeners.remove(listener)
    except:
      pass

  def __init__(self):
    print("init bohnify")
    self.listeners = []
    self.session = spotify.Session()
    self.session.on(spotify.SessionEvent.CONNECTION_STATE_UPDATED, self.on_connection_state_changed)
    self.session.on(spotify.SessionEvent.PLAY_TOKEN_LOST, self.on_play_token_lost)
    self.session.preferred_bitrate(spotify.Bitrate.BITRATE_160k)
    try:
      self.audio_driver = bohnifysink.BohnifyAlsaSink(self.session,self)
    except ImportError:
      print ('No audio sink found; audio playback unavailable.')

    self.event_loop = spotify.EventLoop(self.session)
    self.event_loop.start()
    self.volumeController = Volume.Instance()
    self.volumeController.setListener(self)
    self.status["volume"] = self.volumeController.getVolume()



  def on_connection_state_changed(self, session):
    if session.connection.state is spotify.ConnectionState.LOGGED_IN:
      self.getPlaylists()
    elif session.connection.state is spotify.ConnectionState.LOGGED_OUT:
      self.loginstatus["logingin"] = False
      self.loginstatus["login"] = False
      cherrypy.engine.publish('websocket-broadcast', json.dumps({"loginstatus" : {"loginerror": "Bad username or password!"}}))

  def end_of_track(self):
    self.session.player.pause()
    self.status["paused"] = True
    self.status["track"] = None
    self.updateStatus()
    self.time = 0
    self.position = 0
    self.next()

  def on_play_token_lost(self, session):
    self.audio_driver.pause()
    self.session.player.pause()
    self.status["paused"] = True
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"playtoken" : True}))
    self.updateStatus()

  def updatePlaylist(self,con,new_pl):
    for pl in con:
      if "playlists" in pl:
        if self.updatePlaylist(pl["playlists"],new_pl):
          break
      elif pl["uri"] == new_pl["uri"]:
        pl["name"] = new_pl["name"]
        pl["author"] = new_pl["author"]
        pl["collaborative"] = new_pl["collaborative"]
        pl["description"] = new_pl["description"]
        pl["tracks"] = new_pl["tracks"]
        return True
    return False


  def playlistChanged(self, pl, done):
    if done:
      Cache.Instance().removePlaylist(pl.link.uri)
      playlist = Transformer().playlist(pl, True, self.playlistChanged)
      playlist["name"] = "Starred" if "starred" in playlist["uri"] else playlist["name"]
      if self.cache_playlists != None:
        self.updatePlaylist(self.cache_playlists,playlist)
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

  def get_position(self):
    return (self.position + self.time)

  def updateStatus(self):
    self.status["position"] = self.get_position()
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"status" : self.status }))

  def togglePause(self):
    self.status["paused"] = not self.status["paused"]
    if self.status["paused"]:
      self.session.player.pause()
      self.audio_driver.pause()
    else:
      self.session.player.play()
      self.audio_driver.resume()
    self.updateStatus()

  def volumeChange(self,volume):
    self.status["volume"] = volume
    self.updateStatus()

  def toggleRandom(self):
    self.status["random"] = not self.status["random"]

    def getTracks(tracks):
      if self.status["random"]:
        if self.status["track"]["context"] == self.context:
          tracks[self.status["track"]["origindex"]]["index"] = self.getMaxIndex()+10000
      else:
        for ht in reversed(BohnifyQueue.Instance().history):
          if "isstandard" in ht:
            if ht["context"] ==  self.context:
              index = ht["origindex"]
              for st in tracks:
                if st["origindex"] >= index:
                  st["index"] = self.getMaxIndex()+10000
            break

      BohnifyQueue.Instance().standardqueue = tracks
      self.updateStatus()
      self.updatequeue()

    self.getContextTracks(self.context,getTracks)

  def toggleRepeat(self):
    self.status["repeat"] = not self.status["repeat"]
    if self.status["repeat"]:
      if self.status["track"] != None and "isstandard" in self.status["track"] and self.status["track"]["context"] == self.context:
        t = self.status["track"]
        t["index"] = self.getMaxIndex() + 10000
        BohnifyQueue.Instance().standardqueue.append(t)
        while BohnifyQueue.Instance().removedstandard.count(t["origindex"]) > 0:
          BohnifyQueue.Instance().removedstandard.remove(t["origindex"])
    else:
      maxindex = self.getMaxOrigIndex()
      i = len(BohnifyQueue.Instance().standardqueue) - 1
      while i >= 0:
        t = BohnifyQueue.Instance().standardqueue[i]
        if t["index"] > maxindex:
          BohnifyQueue.Instance().removedstandard.append(t["origindex"])
          BohnifyQueue.Instance().standardqueue.pop(i)
        i = i - 1

    self.updatequeue()
    self.updateStatus()

  def toggleParty(self):
    self.status["party"] = not self.status["party"]
    self.updateStatus()



  def next(self):
    track = None
    if self.status["party"] and len(BohnifyQueue.Instance().votequeue) > 0:
      track = BohnifyQueue.Instance().votequeue.pop(0)
      if track != None:
        track["vote"] = 0
        self.voteChange(track["uri"],track["vote"])
    elif len(BohnifyQueue.Instance().manualqueue) > 0:
      track = BohnifyQueue.Instance().manualqueue.pop(0)
    elif len(BohnifyQueue.Instance().standardqueue) > 0:
      track = BohnifyQueue.Instance().standardqueue.pop(0)
    if track != None:
      self.play(track)

  def prev(self):
    if self.get_position() > 3000:
      self.seek(0)
    else:
      track = None
      if len(BohnifyQueue.Instance().standardqueue) > 0:
        playtrack = self.status["track"]
        if playtrack != None and "isstandard" in playtrack:
          playtrack["index"] = self.getMinIndex()-1

        self.sortQueue()
        track = BohnifyQueue.Instance().standardqueue.pop(len(BohnifyQueue.Instance().standardqueue)-1)
      if track != None:
        self.play(track)

  def sortQueue(self):
    list.sort(BohnifyQueue.Instance().standardqueue, key=lambda track:track["index"])

  def playContent(self, uri, track = None, start = False):
    def setTracks(tracks):
      BohnifyQueue.Instance().standardqueue = tracks
      if track != None:
        for t in tracks:
          if t["origindex"] == track:
            BohnifyQueue.Instance().standardqueue.remove(t)
            self.play(t)
            break
      elif start:
        t = BohnifyQueue.Instance().standardqueue.pop(0)
        self.play(t)
      self.updatequeue()

    BohnifyQueue.Instance().removedstandard = []

    if uri.find("spotify:get:queue:manual") == 0 and track != None:
      for t in BohnifyQueue.Instance().manualqueue:
        if t["origindex"] == track:
          self.play(t)
          BohnifyQueue.Instance().manualqueue.remove(t)
          self.updatequeue()
          break
    elif uri.find("spotify:get:queue:vote") == 0 and track != None:
      for t in BohnifyQueue.Instance().votequeue:
        if t["origindex"] == track:
          t["vote"] = t["vote"] + 1
          self.voteChange(t["uri"],t["vote"])
          self.updatequeue()
          break
    elif uri.find("spotify:get:queue:standard") == 0 and track != None:
      while len(BohnifyQueue.Instance().standardqueue) > 0:
        t = BohnifyQueue.Instance().standardqueue.pop(0)
        if t["origindex"] == track:
          self.play(t)
          break
        else:
          BohnifyQueue.Instance().removedstandard.append(t["origindex"])
      self.updatequeue()
    else:
      self.context = uri
      self.getContextTracks(self.context,setTracks)

  def getContextTracks(self,context,cb, dofilter = True):
    def filterTracks(tracks, skiprandom = False):
      if dofilter:
        i = len(tracks)-1
        while i >= 0:
          if BohnifyQueue.Instance().removedstandard.count(i) > 0:
            tracks.remove(tracks[i])
          else:
            tracks[i]["index"] = i
            tracks[i]["context"] = context
            tracks[i]["isstandard"] = True
          i = i - 1

        if self.status["random"] and not skiprandom:
          shuffle(tracks)
          for index in range(len(tracks)):
            tracks[index]["index"] = index
      cb(tracks)

    def artistDone(artist):
      filterTracks(artist["toptracks"])

    def albumDone(album):
      filterTracks(album["tracks"])

    def searchDone(tracks):
      filterTracks(tracks)

    def trackDone(album):
      filterTracks(album["tracks"])

    def playlistDone(playlist):
      filterTracks(playlist["tracks"])

    if context.find("spotify:") == 0:
      search = context[8:]
      if search.find("spotify:") == 0:
        link = self.session.get_link(search)
        if link.type == spotify.LinkType.ARTIST:
          self.browseArtist(link,artistDone)
        elif link.type == spotify.LinkType.ALBUM:
          self.browseAlbum(link,albumDone)
        elif link.type == spotify.LinkType.TRACK:
          self.browseTrack(link,trackDone)
        elif link.type == spotify.LinkType.PLAYLIST:
          self.browsePlaylist(link,playlistDone)
        elif link.type == spotify.LinkType.STARRED:
          playlistDone(Transformer().playlist(self.session.get_starred()))
      elif search.find("get:toplist") == 0:
        self.toplist(searchDone)
      elif search.find("get:history") == 0:
        filterTracks(BohnifyQueue.Instance().history[:], True)
      elif search.find("get:search:") == 0:
        search = search[11:]
        self.search(search,searchDone)
      elif search.find("get:suggest:") == 0:
        search = search[12:]
        self.track_suggest(search,searchDone)
      elif search.find("get:queue:manual") == 0:
        cb(BohnifyQueue.Instance().manualqueue)
      elif search.find("get:queue:standard") == 0:
        cb(BohnifyQueue.Instance().standardqueue)
      elif search.find("get:queue:vote") == 0:
        cb(BohnifyQueue.Instance().votequeue)



  def play(self, track):
    t = self.session.get_link(track["uri"]).as_track().load()
    if self.get_position() < 3000 and len(BohnifyQueue.Instance().history) > 0:
      BohnifyQueue.Instance().history.pop(0)
    self.session.player.unload()
    try:
      self.time = 0
      self.position = 0
      self.audio_driver.new_track()
      self.session.player.load(t)
      self.session.player.play()

      if "isstandard" in track and self.status["repeat"]:
        track["index"] = (self.getMaxIndex()+10000)
        BohnifyQueue.Instance().standardqueue.append(track)


      self.updatequeue()
      self.status["track"] = track
      self.status["paused"] = False
      self.updateStatus()
      BohnifyQueue.Instance().history.insert(0,self.status["track"].copy())
      self.updatehistory()
    except StandardError as e:
      print e
      print("next pga can't play")
      self.next()

  def getMaxIndex(self):
    maxindex = -1000000
    for t in BohnifyQueue.Instance().standardqueue:
      if t["index"] > maxindex:
        maxindex = t["index"]
    return maxindex

  def getMaxOrigIndex(self):
    maxindex = -1000000
    for t in BohnifyQueue.Instance().standardqueue:
      if t["origindex"] > maxindex:
        maxindex = t["origindex"]
    return maxindex

  def getMinIndex(self):
    minindex = 1000000
    for t in BohnifyQueue.Instance().standardqueue:
      if t["index"] <  minindex:
        minindex = t["index"]
    return minindex

  def seek(self,pos):
    self.session.player.seek(int(pos))
    self.audio_driver.new_track()
    self.time = int(pos)
    self.position = 0
    self.updateStatus()

  def volume(self,value):
    self.volumeController.setVolume(int(value))

  def login(self,username,password):
    if not self.loginstatus["logingin"] and not self.loginstatus["login"]:
      self.session.login(username, password, remember_me=True)
      self.loginstatus["logingin"] = True
      cherrypy.engine.publish('websocket-broadcast', json.dumps({"loginstatus" : self.loginstatus}))


  def getPlaylists(self):
    def callback(pl):
      if self.loginstatus["login"] == False:
        self.loginstatus["logingin"] = False
        self.loginstatus["login"] = True
        self.updateStatus()
      self.loginstatus["playlists"] = pl
      cherrypy.engine.publish('websocket-broadcast', json.dumps({"loginstatus" : self.loginstatus}))
    container = self.session.playlist_container
    Transformer().playlistContainer(container,callback, self.playlistChanged,self.containerChanged, self.session.get_starred())

  def browseTrack(self, link,  cb):
    track = Transformer().track(link.as_track(),"")
    Transformer().album_b(self.session.get_link(track["album"]["uri"]).as_album(),cb)

  def browseAlbum(self, link,  cb):
    Transformer().album_b(link.as_album(),cb)


  def browseArtist(self, link,  cb):
    Transformer().artist_b(link.as_artist(),cb)

  def browsePlaylist(self, link,  cb):
    playlist = Transformer().playlist(link.as_playlist())
    cb(playlist)

  def browseUser(self, link,  cb):
    pass
    #author = Transformer().author(link.as_user())
    #def callback(pls = None):
    #  ws.send(json.dumps({"search" : {"type" : "user", "data" :author, "search":link.uri}}))
    #callback();
    #Transformer().playlistContainer(self.session.get_published_playlists(author["name"]),callback)


  def search(self, query,  cb):
    result = self.session.search(query, track_count = 100,album_count=0,artist_count=0,playlist_count=0)
    result.load()
    tracks = Transformer().tracks(result.tracks,"get:search:"+query)
    cb(tracks)

  def suggest(self, query,  cb):
    result = self.session.search(query, track_count = 3,album_count=3,artist_count=3,playlist_count=3,search_type=spotify.SearchType.SUGGEST)
    result.load()
    data = {}
    data["tracks"] = Transformer().tracks(result.tracks,"get:suggest:"+query)
    data["albums"] = Transformer().albums(result.albums)
    data["artists"] = Transformer().artists(result.artists)
    data["playlists"] = Transformer().search_playlists(result.playlists)
    cb(data)

  def track_suggest(self, query,  cb):
    result = self.session.search(query, track_count = 100,album_count=0,artist_count=0,playlist_count=0,search_type=spotify.SearchType.SUGGEST)
    result.load()
    cb(Transformer().tracks(result.tracks,"get:suggest:"+query))


  def toplist(self,cb):
    toplist = self.session.get_toplist(type=spotify.ToplistType.TRACKS, region = "SE")
    toplist.load()
    tracks = Transformer().tracks(toplist.tracks,"get:toplist")
    cb(tracks)

  def addToManual(self, context, indices):
    def gotTracks(tracks):
      for index in indices:
        for track in tracks:
          if track["origindex"] == index:
            if self.status["party"]:
              voteUp(track)
            else:
              BohnifyQueue.Instance().manualqueue.append(track.copy())
        self.updatequeue()
    self.getContextTracks(context,gotTracks,False)



  def removeFromQueue(self,removetracks):
    for track in removetracks:
        if track["context"] == "spotify:get:queue:manual":
          for t in BohnifyQueue.Instance().manualqueue:
            if t["origindex"] == track["index"]:
              BohnifyQueue.Instance().manualqueue.remove(t)
              break
        elif track["context"] == "spotify:get:queue:standard":
          for t in BohnifyQueue.Instance().standardqueue:
            if t["origindex"] == track["index"]:
              BohnifyQueue.Instance().standardqueue.remove(t)
              break
        elif track["context"] == "spotify:get:queue:vote":
          for t in BohnifyQueue.Instance().votequeue:
            if t["origindex"] == track["index"]:
              self.voteDown(t["uri"])
              break

    self.updatequeue()


  def voteUp(self,context,uri):
    if self.status["track"] == None:
      self.play(uri)
    else:
      track = self.getUriFromList(BohnifyQueue.Instance().votequeue, uri)
      if track != None:
        track["vote"] = track["vote"] + 1
      else:
        track = Transformer().track(self.session.get_link(uri).as_track(),context)
        track["vote"] = 1
        BohnifyQueue.Instance().votequeue.append(track)
      self.voteChange(track["uri"],track["vote"])
      self.updatequeue()

  def voteChange(self, uri, vote):
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"votechange" : {"uri": uri, "vote":vote}}))

  def voteDown(self,uri):
    track = self.getUriFromList(BohnifyQueue.Instance().votequeue, uri)
    if track != None:
      track["vote"] = track["vote"] - 1
      self.voteChange(track["uri"],track["vote"])
      if track["vote"] == 0:
        BohnifyQueue.Instance().votequeue.remove(track)
    self.updatequeue()

  def getUriFromList(self, list, uri):
    for item in list:
      if item["uri"] == uri:
        return item
    return None

  def updatequeue(self):
    self.sortQueue()
    for tindex in range(len(BohnifyQueue.Instance().manualqueue)):
      BohnifyQueue.Instance().manualqueue[tindex]["origindex"] = tindex
      BohnifyQueue.Instance().manualqueue[tindex]["index"] = tindex
    list.sort(BohnifyQueue.Instance().manualqueue, key=lambda track:track["index"])
    list.sort(BohnifyQueue.Instance().votequeue, key=lambda track: (track["vote"]*-1))
    for tindex in range(len(BohnifyQueue.Instance().votequeue)):
      BohnifyQueue.Instance().votequeue[tindex]["origindex"] = tindex
      BohnifyQueue.Instance().votequeue[tindex]["index"] = tindex

    cherrypy.engine.publish('websocket-broadcast', json.dumps({"queueupdated" : True}))

  def updatehistory(self):
    for tindex in range(len(BohnifyQueue.Instance().history)):
      BohnifyQueue.Instance().history[tindex]["origindex"] = tindex
      BohnifyQueue.Instance().history[tindex]["index"] = tindex
    list.sort(BohnifyQueue.Instance().history, key=lambda track:track["index"])
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"historyupdated" : True}))
