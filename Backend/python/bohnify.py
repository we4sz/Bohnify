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
    self.session.preferred_bitrate(spotify.Bitrate.BITRATE_320k)
    try:
      self.audio_driver = spotify.AlsaSink(self.session)
    except ImportError:
      self.logger.warning('No audio sink found; audio playback unavailable.')

    self.event_loop = spotify.EventLoop(self.session)
    self.event_loop.start()

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
    self.session.player.play(False)

  def updateStatus(self):
    cherrypy.engine.publish('websocket-broadcast', json.dumps({"status" : self.status }))

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

  def browseTrack(self, uri,  ws):
    print("bt")

  def browseAlbum(self, uri,  ws):
    print("balbum")

  def browseArtist(self, uri,  ws):
    print("bartist")

  def browsePlaylist(self, uri,  ws):
    print("bp")

  def browseUser(self, uri,  ws):
    print("bu")

  def search(self, query,  ws):
    print("s")
