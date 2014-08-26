
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage
from bohnify import Bohnify
from bohnifyqueue import BohnifyQueue
import json
import spotify
import time
from threading import Timer

class SocketHandler(WebSocket):

    def opened(self):
        Timer(0.2, self.sendWelcome, ()).start()

    def sendWelcome(self):
        self.send(json.dumps({"loginstatus" : Bohnify.Instance().loginstatus}))
        if Bohnify.Instance().loginstatus["login"]:
          self.send(json.dumps({"status" : Bohnify.Instance().status}))
          if Bohnify.Instance().cache_playlists != None:
            self.send(json.dumps({"playlists" : Bohnify.Instance().cache_playlists}))


    def received_message(self, m):
        cmd = json.loads(m.data)
        print(cmd)
        if "login" in cmd:
          Bohnify.Instance().login(cmd["login"]["username"],cmd["login"]["password"])
        elif "search" in cmd:
          if cmd["search"].find("spotify:") == 0:
            link = Bohnify.Instance().session.get_link(cmd["search"])
            if link.type == spotify.LinkType.ARTIST:
              Bohnify.Instance().browseArtist(link,self)
            elif link.type == spotify.LinkType.ALBUM:
              Bohnify.Instance().browseAlbum(link,self)
            elif link.type == spotify.LinkType.TRACK:
              Bohnify.Instance().browseTrack(link,self)
            elif link.type == spotify.LinkType.PLAYLIST:
              Bohnify.Instance().browsePlaylist(link,self)
            elif link.type == spotify.LinkType.PROFILE:
              Bohnify.Instance().browseUser(link,self)
          else:
            Bohnify.Instance().search(cmd["search"],self)
        elif "gettoplist" in cmd:
          Bohnify.Instance().toplist(self)
        elif "getqueue" in cmd:
          if Bohnify.Instance().status["party"]:
            self.send(json.dumps({"queues" : [
              {"type" : "vote", "queue" : BohnifyQueue.Instance().votequeue},
              {"type" : "standard", "queue" : BohnifyQueue.Instance().standardqueue}
            ]}))
          else:
            self.send(json.dumps({"queues" : [
              {"type" : "manual", "queue" : BohnifyQueue.Instance().manualqueue},
              {"type" : "standard", "queue" : BohnifyQueue.Instance().standardqueue}
            ]}))
        elif "gethistory" in cmd:
          self.send(json.dumps({"history":BohnifyQueue.Instance().history}))
        elif "prev" in cmd:
          if not Bohnify.Instance().status["party"]:
            Bohnify.Instance().prev()
        elif "next" in cmd:
          if not Bohnify.Instance().status["party"]:
            Bohnify.Instance().next()
        elif "play" in cmd:
            Bohnify.Instance().playFromUri(cmd["play"]["track"],cmd["play"]["queue"])
        elif "party" in cmd:
          Bohnify.Instance().toggleParty()
        elif "random" in cmd:
          Bohnify.Instance().toggleRandom()
        elif "repeat" in cmd:
          Bohnify.Instance().toggleRepeat()
        elif "manualqueue" in cmd:
          Bohnify.Instance().addToManual(cmd["manualqueue"])
        elif "removemanualqueue" in cmd:
          Bohnify.Instance().removeFromManual(cmd["removemanualqueue"])
        elif "standardqueue" in cmd:
          Bohnify.Instance().setStandard(cmd["standardqueue"])
        elif "startqueue" in cmd:
          Bohnify.Instance().startQueue(cmd["startqueue"])
        elif "removestandardqueue" in cmd:
          Bohnify.Instance().removeFromStandard(cmd["removestandardqueue"])
        elif "seek" in cmd:
          Bohnify.Instance().seek(cmd["seek"])
        elif "volume" in cmd:
          Bohnify.Instance().volume(cmd["volume"])
        elif "pause" in cmd:
          Bohnify.Instance().togglePause()
        elif "increasevolume" in cmd:
          Bohnify.Instance().increaseVolume()
        elif "decreasevolume" in cmd:
          Bohnify.Instance().decreaseVolume()
        else:
          print("else")

        #cherrypy.engine.publish('websocket-broadcast', m)

    def closed(self, code, reason="A client left the room without a proper explanation."):
        print("asd")
      #cherrypy.engine.publish('websocket-broadcast', TextMessage(reason))