from singelton import Singleton

@Singleton
class BohnifyQueue(object):

  standardqueue = [];
  manualqueue = [];
  votequeue = [];
  history = [];

  def getTrackIfIsAnyQueue(self, uri):
    for track in self.standardqueue:
      if track["uri"] == uri:
        return track
    for track in self.manualqueue:
      if track["uri"] == uri:
        return track
    for track in self.votequeue:
      if track["uri"] == uri:
        return track
    for track in self.history:
      if track["uri"] == uri:
        return track
    return None

  def setVoteToTrack(self, track):
    for t in self.votequeue:
      if t["uri"] == track["uri"]:
        track["vote"] = t["vote"]
        return
    track["vote"] = 0
