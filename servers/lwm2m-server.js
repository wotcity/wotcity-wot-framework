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
var Framework = require('../lib/framework');

/**
 * Main Server Modules
 */
var Lwm2mServer = require("../lib/lwm2m/server")
  , Router = require("../lib/lwm2m/router")
  , RequestHandlers = require("../lib/lwm2m/requestHandlers");

/**
 * Util Modules
 */
var merge = require('utils-merge');

/**
 * LWM2M URL Router
 */
var Lwm2mHandlers = [
  {
    method: 'POST',
    uri: '/rd',
    handler: RequestHandlers.registration
  },

  {
    method: 'DELETE',
    uri: '/rd/([A-Za-z0-9-]+)',
    handler: RequestHandlers.unregistration
  },

  {
    method: 'PUT',
    uri: '/rd/([A-Za-z0-9-]+)',
    handler: RequestHandlers.updateRegistration
  }
];

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
  this.registerThing(thing);
};

/**
 * Create an OMA LWM2M server.
 *
 * @return {Object}
 * @api public
 */
function createServer(options) {
  var instance = new Server();
  return merge(instance, options);
}

/**
 * Start a LWM2M server.
 *
 * @return {None}
 * @api public
 */
Server.prototype.start = function() {
  var port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
  var host = process.env.HOST ? String(process.env.HOST) : 'localhost';

  var server = new Lwm2mServer({
    port: port,
    host: host
  });
  var router = new Router();

  // Events
  server.on('newThing', this.onNewThing.bind(this));

  server.start(router.route, Lwm2mHandlers);
};

/**
 * Create the server instance.
 */
var M2mServerImpl = createServer({});

/**
 * Combined server with the framework instance.
 */
var M2mServer = new Framework({
  server: M2mServerImpl
});

/**
 * Start the server.
 */
M2mServer.start();
