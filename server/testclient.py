from ws4py.client.threadedclient import WebSocketClient
import time

from threading import *
from singelton import Singleton
import sys
from array import *
@Singleton
class BohnifyAlsaSink(object):

    def __init__(self):
      print "init"
      self._card = 'default'
      import alsaaudio  # Crash early if not available
      self._alsaaudio = alsaaudio
      self._device = None
      self._device = self._alsaaudio.PCM(mode=self._alsaaudio.PCM_NONBLOCK, card=self._card)
      if sys.byteorder == 'little':
        self._device.setformat(self._alsaaudio.PCM_FORMAT_S16_LE)
      else:
        self._device.setformat(self._alsaaudio.PCM_FORMAT_S16_BE)
      self._device.setrate(44100)
      self._device.setchannels(2)
      self._device.setperiodsize(2048 * 4)
      self.run = True
      self.paused = False       
      self.buffer = []
      self.lock = Lock() 
      Timer(0.1, self.start_this, ()).start()

    def music_delivery(self,frames):
      if frames == "new":
        self.new_track()
      elif frames == "pause":
        self.pause()
      elif frames == "resume":
        self.resume()
      elif len(frames) % 8192 == 0:
        arr = array('c')
        arr.fromstring(frames)
        self.lock.acquire()
        self.buffer.append(arr)
        self.lock.release()


    def close(self):
      if self._device is not None:
        self._device.close()
        self._device = None

    def stop(self):
      self.run = False

    def pause(self):
      self.paused = True
      self._device.pause(1)

    def resume(self):
      self.paused = False
      self._device.pause(0)

    def new_track(self):
      self.lock.acquire()
      self.buffer = []
      self.lock.release()


    def start_this(self):
      while(self.run):
        self.lock.acquire()
        if(not self.paused and len(self.buffer) > 0):
          frames = self.buffer.pop(0)
          i = self._device.write(frames.tostring())
          if i == 0:
            self.buffer.insert(0,frames)
          self.lock.release()
          time.sleep(i/44100)
	else:
          self.lock.release()
          time.sleep(0.01)




class DummyClient(WebSocketClient):
    def opened(self):
      print "open"
      self.audio = BohnifyAlsaSink.Instance()

    def closed(self, code, reason=None):
      print "close"
      print reason
      self.audio.close()

    def received_message(self, m):
      self.audio.music_delivery(m.data)

if __name__ == '__main__':
    BohnifyAlsaSink.Instance()
    try:
      ws = DummyClient('ws://johanssonjohn.com:1650/audio', protocols=['http-only', 'chat'])
      ws.connect()
      ws.run_forever()
    except KeyboardInterrupt:
      ws.close()
