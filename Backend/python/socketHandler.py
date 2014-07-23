
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage
from bohnify import Bohnify
import json
import time
from threading import Timer

class SocketHandler(WebSocket):

    def opened(self):
        Timer(0.2, self.sendWelcome, ()).start()

    def sendWelcome(self):
        self.send(json.dumps({"loginstatus" : Bohnify.Instance().loginstatus}))
        if Bohnify.Instance().loginstatus["login"]:
          self.send(json.dumps({"status" : Bohnify.Instance().status}))


    def received_message(self, m):
        cmd = json.loads(m.data)
        print(cmd)
        if "login" in cmd:
          Bohnify.Instance().login(cmd["login"]["username"],cmd["login"]["password"])
        elif "search" in cmd:
          if cmd["search"].find("spotify:track:") == 0:
            Bohnify.Instance().browseTrack(cmd["search"],self)
          elif cmd["search"].find("spotify:artist:") == 0:
            Bohnify.Instance().browseArtist(cmd["search"],self)
          elif cmd["search"].find("spotify:album:") == 0:
            Bohnify.Instance().browseAlbum(cmd["search"],self)
          elif cmd["search"].find(":playlist:") != -1:
            Bohnify.Instance().browsePlaylist(cmd["search"],self)
          elif cmd["search"].find("spotify:user:") == 0:
            Bohnify.Instance().browseUser(cmd["search"],self)
          else:
            Bohnify.Instance().search(cmd["search"],self)
        else:
          print("else")

        #cherrypy.engine.publish('websocket-broadcast', m)

    def closed(self, code, reason="A client left the room without a proper explanation."):
        print("asd")
      #cherrypy.engine.publish('websocket-broadcast', TextMessage(reason))
