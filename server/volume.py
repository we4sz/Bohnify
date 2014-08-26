import subprocess
import math
from threading import Timer
import time
from singelton import Singleton

@Singleton
class Volume(object):

    def __init__(self):
      self.volume = 0
      self.mindB = None
      self.listener = None
      self.maxdB = 0.0
      self.getMindB()
      self.fetchVolume()
      self.running = True
      Timer(0.2, self.startFetching, ()).start()

    def setListener(self, listener):
      self.listener = listener

    def getMindB(self):
      outout = subprocess.Popen(["amixer", "contents"], stdout=subprocess.PIPE).communicate()[0]
      lines = outout.split("\n")
      found = False
      for line in lines:
        if "Master" in line:
          found = True
        elif found and "dBscale-min" in line:
          self.mindB = float(line.split("dBscale-min=")[1].split("dB,")[0])
          break

    def stop(self):
      self.running = False

    def startFetching(self):
      while self.running:
        self.fetchVolume()
        time.sleep(1)

    def fetchVolume(self):
      outout = subprocess.Popen(["amixer", "sget", "Master"], stdout=subprocess.PIPE).communicate()[0]
      lines = outout.split("\n")
      for line in lines:
        if "dB" in line:
          db = float(line.split("[")[2].split("dB")[0])
          v = self.dbToPercent(db)
          if v != self.volume:
            self.volume = v
            if self.listener != None:
              self.listener.volumeChange(self.volume)
          break

    def percentTodB(self, volume):
      ampGain = min(0.5*self.maxdB, 0) - self.mindB
      cste = math.log(10.0)/float(20)
      return self.mindB + (1/cste)* math.log(1+(math.exp(cste*ampGain)-1)*(volume/float(100)))

    def dbToPercent(self,dB):
      ampGain = min(0.5*self.maxdB, 0) - self.mindB
      cste = math.log(10.0)/float(20)
      return (math.exp((dB - self.mindB) / (1/cste))-1)/(math.exp(cste*ampGain)-1)*100


    def getVolume(self):
      return self.volume

    def setVolume(self, volume):
      valueDB = self.percentTodB(volume)
      subprocess.Popen(["amixer", "sset", "Master", "0dB"], stdout=subprocess.PIPE).communicate()[0]
      if valueDB < 0:
        value = valueDB * -1
        subprocess.Popen(["amixer", "sset", "Master", str(value)+"dB-"], stdout=subprocess.PIPE).communicate()[0]
      self.fetchVolume()
