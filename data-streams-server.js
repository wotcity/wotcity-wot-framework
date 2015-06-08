/**
 *
 * .City Web of Things Framework
 * 
 * Copyright 2015 Jollen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

 "use strict";

/**
 * Main WoT Framework
 */
var Framework = require('./lib/framework');

/**
 * Create WoT.City application instance which is
 * the basic WoT.City application. 
 * (Websocket broker server)
 */

/**
 * Main Server Modules
 */
var WebsocketBroker = require("./lib/websocketBrokerServer/server")
  , WebsocketRouter = require("./lib/websocketBrokerServer/router")
  , RequestHandlers = require("./lib/websocketBrokerServer/requestHandlers");

/**
 * Util Modules
 */
var merge = require('utils-merge');

/**
 * Websocket URL Router
 */
var wsHandlers = {
   "/object/([A-Za-z0-9-]+)/send": RequestHandlers.send,
   "/object/([A-Za-z0-9-]+)/viewer": RequestHandlers.viewer,
   "/object/([A-Za-z0-9-]+)/status": RequestHandlers.status
};

/*
 * Prototype and Class
 */
var Server = {};

/**
 * Create an WoT server.
 *
 * @return {Object}
 * @api public
 */
function createServer(options) {
  return merge(Server, options);
}

/**
 * Start a Websocket server.
 *
 * @return {None}
 * @api public
 */
Server.start = function() {
  var server = new WebsocketBroker();
  var router = new WebsocketRouter();

 /**
  * A new thing has been added.
  */
 var onNewThing = function(thing) {
   // Callback framework APIs
   this.register_thing(thing);
 };

  server.on('new_thing', onNewThing.bind(this));

  server.start(router.route, wsHandlers);
};

/**
 * Create the server instance.
 */
var broker = new createServer({
	port: 8015
});

/**
 * Combined server with framework instance.
 */
var streamsServer = new Framework({
	app: broker
});

/**
 * Start the server.
 */
streamsServer.start();

