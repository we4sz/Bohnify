
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
      try:
        cmd = json.loads(m.data)
        print(cmd)
        if "login" in cmd:
          Bohnify.Instance().login(cmd["login"]["username"],cmd["login"]["password"])
        elif "search" in cmd:
          if cmd["search"].find("spotify:") == 0:
            search = cmd["search"][8:]
            print search
            if search.find("spotify:") == 0:
              link = Bohnify.Instance().session.get_link(search)
              if link.type == spotify.LinkType.ARTIST:
                def artistBrowsed(artist):
                  self.send(json.dumps({"search" : {"type" : "artist", "data" :artist, "search":link.uri}}))
                Bohnify.Instance().browseArtist(link,artistBrowsed)
              elif link.type == spotify.LinkType.ALBUM:
                def albumBrowsed(album):
                  self.send(json.dumps({"search" : {"type" : "album", "data" :album, "search":link.uri}}))
                Bohnify.Instance().browseAlbum(link,albumBrowsed)
              elif link.type == spotify.LinkType.TRACK:
                def trackBrowsed(album):
                  self.send(json.dumps({"search" : {"type" : "track", "data" :album, "search":link.uri}}))
                Bohnify.Instance().browseTrack(link,trackBrowsed)
              elif link.type == spotify.LinkType.PLAYLIST:
                def playlistBrowsed(playlist):
                  self.send(json.dumps({"search" : {"type" : "playlist", "data" :playlist, "search":link.uri}}))
                Bohnify.Instance().browsePlaylist(link,playlistBrowsed)
              elif link.type == spotify.LinkType.PROFILE:
                pass
                #Bohnify.Instance().browseUser(link,self)
            else:
              def searchDone(tracks):
                self.send(json.dumps({"search" : {"type" : "search", "data" :tracks, "search":search}}))
              Bohnify.Instance().search(search,searchDone)
        elif "suggest" in cmd:
          if cmd["suggest"].find("spotify:") == 0:
            def suggestDone(data):
              self.send(json.dumps({"suggest" : {"data" :data, "suggest":suggest}}))
            suggest = cmd["suggest"][8:]
            Bohnify.Instance().suggest(suggest,suggestDone)
        elif "gettoplist" in cmd:
          def toplistDone(tracks):
            self.send(json.dumps({"toplist" : tracks }))
          Bohnify.Instance().toplist(toplistDone)
        elif "getqueue" in cmd:
          for t in BohnifyQueue.Instance().votequeue:
            track = t.copy()
            track["context"] = "spotify:get:queue:vote"
            vote.append(track)

          for t in BohnifyQueue.Instance().manualqueue:
            track = t.copy()
            track["context"] = "spotify:get:queue:manual"
            manual.append(track)

          for t in BohnifyQueue.Instance().standardqueue:
            track = t.copy()
            track["context"] = "spotify:get:queue:standard"
            standard.append(track)

          if Bohnify.Instance().status["party"]:
            self.send(json.dumps({"queues" : [
              {"type" : "vote", "queue" : vote},
              {"type" : "standard", "queue" : standard}
            ]}))
          else:
            self.send(json.dumps({"queues" : [
              {"type" : "manual", "queue" : manual},
              {"type" : "standard", "queue" : standard}
            ]}))
        elif "gethistory" in cmd:
          history = BohnifyQueue.Instance().history[:]

          for t in history:
            t["context"] = "spotify:get:history"

          self.send(json.dumps({"history":history}))
        elif "prev" in cmd:
          if not Bohnify.Instance().status["party"]:
            Bohnify.Instance().prev()
        elif "next" in cmd:
          if not Bohnify.Instance().status["party"]:
            Bohnify.Instance().next()
        elif "play" in cmd:
            track = cmd["play"]["track"] if "track" in cmd["play"] else None
            start = cmd["play"]["start"] if "start" in cmd["play"] else False
            Bohnify.Instance().playContent(cmd["play"]["uri"],track ,start)
        elif "party" in cmd:
          Bohnify.Instance().toggleParty()
        elif "random" in cmd:
          Bohnify.Instance().toggleRandom()
        elif "repeat" in cmd:
          Bohnify.Instance().toggleRepeat()
        elif "manualqueue" in cmd:
          Bohnify.Instance().addToManual(cmd["manualqueue"]["context"],cmd["manualqueue"]["indices"])
        elif "removefromqueue" in cmd:
          Bohnify.Instance().removeFromQueue(cmd["tracks"])
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
      except StandardError as e:
        print e


    def closed(self, code, reason="A client left the room without a proper explanation."):
      pass
