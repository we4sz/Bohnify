
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage
from bohnify import Bohnify
import json
import spotify
import time
from threading import Timer

class SocketAudioHandler(WebSocket):

    def opened(self):
      self.open = True
      print "open"
      Timer(1, self.start_this, ()).start()

    def start_this(self):
      if self.open:
        Bohnify.Instance().startlisten(self)

    def got_music(self,frames):
      try:
        self.send(frames,True)
      except:
       pass

    def received_message(self, m):
      print "msg"
      try:
        pass
      except:
        print "error"


    def closed(self, code, reason="A client left the room without a proper explanation."):
      self.open = False
      print reason
      Bohnify.Instance().stoplisten(self)
