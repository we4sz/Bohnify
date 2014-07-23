# -*- coding: utf-8 -*-
import random
from socketHandler import SocketHandler
import os
import cherrypy

from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool


class Root(object):

    @cherrypy.expose
    def ws(self):
        cherrypy.log("Handler created: %s" % repr(cherrypy.request.ws_handler))

if __name__ == '__main__':
    cherrypy.config.update({
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 1650,
        'tools.staticdir.root': os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
    })

    WebSocketPlugin(cherrypy.engine).subscribe()
    cherrypy.tools.websocket = WebSocketTool()

    cherrypy.quickstart(Root(),"",config={
                            '/': {
                                'tools.staticdir.on': True,
                                'tools.staticdir.dir' : "Frontend",
                                'tools.staticdir.index': 'index.html'
                            },
                            '/ws': {
                                'tools.websocket.on': True,
                                'tools.websocket.handler_cls': SocketHandler
                            },
                        })
