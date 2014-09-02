# -*- coding: utf-8 -*-
import random
from socketHandler import SocketHandler
from socketAudioHandler import SocketAudioHandler
import os
import cherrypy
from volume import Volume
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
import sys


class Root(object):

    def __init__(self):
        cherrypy.engine.subscribe('start', self.start)
        cherrypy.engine.subscribe('stop', self.stop)

    def start(self):
        print("start")

    def stop(self):
	Bohnify.Instance().endprogram()
        Volume.Instance().stop()
        print("end")

    @cherrypy.expose
    def ws(self):
        cherrypy.log("Handler created: %s" % repr(cherrypy.request.ws_handler))

    @cherrypy.expose
    def audio(self):
        cherrypy.log("Handler created: %s" % repr(cherrypy.request.ws_handler))

if __name__ == '__main__':
    sys.setrecursionlimit(1000)

    cherrypy.config.update({
        'engine.autoreload_on':False,
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 1650,
        'tools.staticdir.root': os.path.abspath(os.path.join(os.path.dirname(__file__), '../')),
        "environment": "embedded"
    })

    WebSocketPlugin(cherrypy.engine).subscribe()
    cherrypy.tools.websocket = WebSocketTool()
    cherrypy.quickstart(Root(),"",config={
                            '/': {
                                'tools.staticdir.on': True,
                                'tools.staticdir.dir' : "",
                                'tools.staticdir.index': 'index.html'
                            },
                            '/audio': {
                                'tools.websocket.on': True,
                                'tools.websocket.handler_cls': SocketAudioHandler
                            },
                            '/ws': {
                                'tools.websocket.on': True,
                                'tools.websocket.handler_cls': SocketHandler
                            },
                        })
