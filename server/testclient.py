from __future__ import unicode_literals
from ws4py.client.threadedclient import WebSocketClient
import time

from singelton import Singleton
import sys

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


    def music_delivery(self,frames):
      self._device.write(frames)

    def close(self):
        if self._device is not None:
            self._device.close()
            self._device = None







class DummyClient(WebSocketClient):
    def opened(self):
      print "open"
      self.audio = BohnifyAlsaSink.Instance()

    def closed(self, code, reason=None):
      print "close"
      print reason
      self.audio.close()

    def received_message(self, m):
      if len(m.data) % 8192 == 0:
        self.audio.music_delivery(m.data)

if __name__ == '__main__':
    BohnifyAlsaSink.Instance()
    try:
      ws = DummyClient('ws://johanssonjohn.com:1650/audio', protocols=['http-only', 'chat'])
      ws.connect()
      ws.run_forever()
    except KeyboardInterrupt:
      ws.close()
