from __future__ import unicode_literals

import cmd
import logging
import threading
from singelton import Singleton
import spotify

@Singleton
class Bohnify(object):

  _instance = None

  loginstatus = {
    "login" : False,
    "logingin" : False,
    "user" : None
  };

  def __init__(self):
    print("init bohnify")

    self.session = spotify.Session()
    self.session.on(spotify.SessionEvent.CONNECTION_STATE_UPDATED, self.on_connection_state_changed)
    self.session.on(spotify.SessionEvent.END_OF_TRACK, self.on_end_of_track)

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
    elif session.connection.state is spotify.ConnectionState.LOGGED_OUT:
      self.loginstatus["logingin"] = False
      self.loginstatus["login"] = False

  def on_end_of_track(self, session):
    self.session.player.play(False)

  def login(self,username,password):
    if not self.loginstatus["logingin"] and not self.loginstatus["login"]:
      self.session.login(username, password, remember_me=True)
      self.loginstatus["logingin"] = True
