import sys
from threading import *
import time
import spotify
from array import *
__all__ = [
    'BohnifyAlsaSink',
    'BohnifyPortAudioSink',
]


class BohnifySink(object):
    def on(self):
        """Turn on the audio sink.

        This is done automatically when the sink is instantiated, so you'll
        only need to call this method if you ever call :meth:`off` and want to
        turn the sink back on.
        """
        assert self._session.num_listeners(
            spotify.SessionEvent.MUSIC_DELIVERY) == 0
        self._session.on(
            spotify.SessionEvent.MUSIC_DELIVERY, self._on_music_delivery)

    def off(self):
        """Turn off the audio sink.

        This disconnects the sink from the relevant session events.
        """
        self._session.off(
            spotify.SessionEvent.MUSIC_DELIVERY, self._on_music_delivery)
        assert self._session.num_listeners(
            spotify.SessionEvent.MUSIC_DELIVERY) == 0
        self._close()

    def _on_music_delivery(self, session, audio_format, frames, num_frames):
        # This method is called from an internal libspotify thread and must
        # not block in any way.
        raise NotImplementedError

    def _close(self):
        pass


class BohnifyAlsaSink(BohnifySink):
    """Audio sink for systems using ALSA, e.g. most Linux systems.

    This audio sink requires `pyalsaaudio
    <https://pypi.python.org/pypi/pyalsaaudio>`_. pyalsaaudio is probably
    packaged in your Linux distribution.

    For example, on Debian/Ubuntu you can install it from APT::

        sudo apt-get install python-alsaaudio

    Or, if you want to install pyalsaaudio inside a virtualenv, install the
    ALSA development headers from APT, then pyalsaaudio::

        sudo apt-get install libasound2-dev
        pip install pyalsaaudio

    The ``card`` keyword argument is passed on to :class:`alsaaudio.PCM`.
    Please refer to the pyalsaaudio documentation for details.

    Example::

        >>> import spotify
        >>> session = spotify.Session()
        >>> audio = spotify.AlsaSink(session)
        >>> loop = spotify.EventLoop(session)
        >>> loop.start()
        # Login, etc...
        >>> track = session.get_track('spotify:track:3N2UhXZI4Gf64Ku3cCjz2g')
        >>> track.load()
        >>> session.player.load(track)
        >>> session.player.play()
        # Listen to music...

    .. warning::

        There is a known memory leak in pyalsaaudio 0.7 when used on Python
        3.x which makes :class:`AlsaSink` unfeasible for anything else than
        short demonstrations. This issue is not present on Python 2.7.

        For more details, see `pyspotify issue #127
        <https://github.com/mopidy/pyspotify/issues/127>`_ and `pyalsaaudio
        issue #16 <https://sourceforge.net/p/pyalsaaudio/bugs/16/>`_.
    """

    def __init__(self, session, listener, card='default'):
        self._session = session
        self._card = card
        self._listener = listener
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
        self._device.setperiodsize(2048*4)
        self.buffer = []
        self.run = True
        self.isend = False
        self.thread = Thread(target = self.start_this)
        self.lock = Lock()
        self.on()

    def stop(self):
      self.run = False
      while self.thread.is_alive():
        pass
      self._close()

    def pause(self):
      self.run = False
      Thread(target = self._listener.musiclistener, args = (None, "pause",0)).start()

    def resume(self):
      while self.thread.is_alive():
        pass
      self.run = True
      self.thread = Thread(target = self.start_this)
      self.thread.start()
      Thread(target = self._listener.musiclistener, args = (None, "resume",0)).start()

    def new_track(self):
      self.run = False
      self.lock.acquire()
      self.buffer = []
      Thread(target = self._listener.musiclistener, args = (None, "new",0)).start()
      while self.thread.is_alive():
        pass
      self.run = True
      self.thread = Thread(target = self.start_this)
      self.thread.start()
      self.lock.release()

    def start_this(self):
      while(self.run):
        self.lock.acquire()
        if(self.run and len(self.buffer) > 0):
          frames = self.buffer.pop(0)
          self.lock.release()
          if frames == "end":
            Thread(target = self._listener.end_of_track).start()
            self.run = False
          else:
            i = self._device.write(frames.tostring())
            self._listener.addtime(i)
            if i == 0:
              self.buffer.insert(0,frames)
            time.sleep(i/44100)
        else:
          self.lock.release()
          time.sleep(0.01)


    def _on_music_delivery(self, session, audio_format, frames, num_frames):
        arr = array('c')
        arr.fromstring(frames)
        self.lock.acquire()
        if num_frames == 22050 and not self.isend:
          self.isend = True
          self.buffer.append("end")
        elif num_frames > 0:
          self.isend = False
          self.buffer.append(arr)
          Thread(target = self._listener.musiclistener, args = (audio_format, frames, num_frames)).start()
        self.lock.release()
        return num_frames

    def _close(self):
      if self._device is not None:
        self._device.close()
        self._device = None


class BohnifyPortAudioSink(BohnifySink):
    """Audio sink for `PortAudio <http://www.portaudio.com/>`_.

    PortAudio is available for many platforms, including Linux, OS X, and
    Windows. This audio sink requires `PyAudio
    <https://pypi.python.org/pypi/pyaudio>`_.  PyAudio is probably packaged in
    your Linux distribution.

    On Debian/Ubuntu you can install PyAudio from APT::

        sudo apt-get install python-pyaudio

    Or, if you want to install PyAudio inside a virtualenv, install the
    PortAudio development headers from APT, then PyAudio::

        sudo apt-get install portaudio19-dev
        pip install --allow-unverified=pyaudio pyaudio

    On OS X you can install PortAudio using Homebrew::

        brew install portaudio
        pip install --allow-unverified=pyaudio pyaudio

    For an example of how to use this class, see the :class:`AlsaSink` example.
    Just replace ``AlsaSink`` with ``PortAudioSink``.
    """

    def __init__(self, session, listener = None):
      self._session = session
      self._listener = listener
      import pyaudio  # Crash early if not available
      self._pyaudio = pyaudio
      self._device = self._pyaudio.PyAudio()
      self._stream = self._device.open(
        format=self._pyaudio.paInt16, channels=2,
        rate=44100, output=True, frames_per_buffer=2048)
      self.buffer = []
      self.run = True
      self.lock = Lock()
      self.paused = False
      Timer(0.1, self.start_this, ()).start()
      self.on()

    def stop(self):
      self.run = False

    def pause(self):
      self.paused = True
      self._listener.musiclistener(None, "pause", 0)

    def resume(self):
      self.paused = False
      self._listener.musiclistener(None, "resume", 0)

    def new_track(self):
      self.lock.acquire()
      self.buffer = []
      self._listener.musiclistener(None, "new", 0)
      self.lock.release()


    def start_this(self):
      while(self.run):
        self.lock.acquire()
        if(not self.paused and len(self.buffer) > 0):
          frames = self.buffer.pop(0)
          self.lock.release()
          if frames == "end":
            print "hear"
            self._listener.end_of_track()
          else:
            self._stream.write(frames.tostring())
            self._listener.addtime(len(frames)/4)
            time.sleep(len(frames.tostring())/4/44100)
        else:
          self.lock.release()
          time.sleep(0.01)




    def _on_music_delivery(self, session, audio_format, frames, num_frames):
      arr = array('c')
      arr.fromstring(frames)
      self.lock.acquire()
      if num_frames == 22050:
        self.buffer.append("end")
      elif num_frames > 0:
        self.buffer.append(arr)
        self._listener.musiclistener(audio_format, frames, num_frames)
      print "got data"
      self.lock.release()
      return num_frames


    def _close(self):
      if self._stream is not None:
        self._stream.close()
        self._stream = None
