/**
 *
 * WoT.City Open Source Project
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
var Framework = require('../lib/framework');

/**
 * Main Server Modules
 */
var CoapBroker = require("../lib/coapServer/server")
  , Router = require("../lib/coapServer/router")
  , RequestHandlers = require("../lib/coapServer/requestHandlers");

/**
 * Util Modules
 */
var merge = require('utils-merge');

/**
 * CoAP URL Router
 */
var coapHandlers = {
   "/object/([A-Za-z0-9-]+)/send": RequestHandlers.proxyingWebSocket,
};

/*
 * Prototype and Class
 */
var Server = function () {

};

/**
 * Event Callback System
 */
Server.prototype.onNewThing = function(thing) {
  // Call framework APIs
  // TBD: register remote things
  this.registerThing(thing);
};

/**
 * Create an WoT server.
 *
 * @return {Object}
 * @api public
 */
function createServer(options) {
  var instance = new Server();
  return merge(instance, options);
}

/**
 * Start a CoAP server.
 *
 * @return {None}
 * @api public
 */
Server.prototype.start = function() {
  var port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
  var host = process.env.HOST ? String(process.env.HOST) : 'localhost';

  var server = new CoapBroker({
    port: port,
    host: host
  });
  var router = new Router();

  // Events
  server.on('newThing', this.onNewThing.bind(this));

  server.start(router.route, coapHandlers);
};

/**
 * Create the server instance.
 */
var coapBrokerImpl = createServer({});

/**
 * Combined server with framework instance.
 */
var coapServer = new Framework({
  server: coapBrokerImpl
});

/**
 * Start the server.
 */
coapServer.start();

/*
 * We're ready to accept requests.
 * Register ourselves.
 */

// W3C WoT
// Local things description
var thing_handler = require('../lib/w3c/thing/thing_handler');

/**
 * Register local things.
 */
var localThings = require('../things/demo');

var thingInit = function (things) {
  // call the thing handler to start handling the things
  thing_handler.init(things);

  console.log("WoT Framework is initialised");
}

// init local things
thingInit(localThings);
