from ws4py.client.threadedclient import WebSocketClient
from __future__ import unicode_literals

import sys
class DummyClient(WebSocketClient):
    def opened(self):
      self._device = None
      self._session = session
      self._card = card
      self._listener = listener
      import alsaaudio  # Crash early if not available
      self._alsaaudio = alsaaudio
      self._device = self._alsaaudio.PCM(
          mode=self._alsaaudio.PCM_NONBLOCK, card=self._card)
      if sys.byteorder == 'little':
          self._device.setformat(self._alsaaudio.PCM_FORMAT_S16_LE)
      else:
          self._device.setformat(self._alsaaudio.PCM_FORMAT_S16_BE)
      self._device.setrate(44100)
      self._device.setchannels(2)
      self._device.setperiodsize(2048 * 4)

    def closed(self, code, reason=None):
      print "Closed down"
      if self._device is not None:
          self._device.close()
          self._device = None

    def received_message(self, m):
      self._device.write(frames)

if __name__ == '__main__':
    try:
      ws = DummyClient('ws://localhost:1650/audio', protocols=['http-only', 'chat'])
      ws.connect()
      ws.run_forever()
    except KeyboardInterrupt:
      ws.close()
