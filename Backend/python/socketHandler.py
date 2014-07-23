
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage
from bohnify import Bohnify
import json

class SocketHandler(WebSocket):

    def opened(self):
        self.send("gxgx")
        self.send("gxgx")
        print("gfgj")


    def received_message(self, m):
        print("ye")
        #cherrypy.engine.publish('websocket-broadcast', m)

    def closed(self, code, reason="A client left the room without a proper explanation."):
        print("asd")
      #cherrypy.engine.publish('websocket-broadcast', TextMessage(reason))
