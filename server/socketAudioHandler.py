
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage
from bohnify import Bohnify
import json
import spotify
import time
from threading import Timer

class SocketAudioHandler(WebSocket):

    def opened(self):
      print "open"
      Timer(1, self.start_this, ()).start()

    def start_this(self):
      Bohnify.Instance().startlisten(self)

    def got_music(self,audio_format, frames, num_frames):
      self.send(frames,True)

    def received_message(self, m):
      print "msg"
      try:
        pass
      except Error, e:
        print "error"


    def closed(self, code, reason="A client left the room without a proper explanation."):
      Bohnify.Instance().stoplisten(self)
