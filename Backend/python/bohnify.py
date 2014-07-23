class Bohnify(object):

  _instance = None

  loginstatus = {
    "login" : False,
    "logingin" : False,
    "user" : None
  };

  def __new__(cls, *args, **kwargs):
    if not cls._instance:
      cls._instance = super(Bohnify, cls).__new__(cls, *args, **kwargs)
    return cls._instance
