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
 * Module dependencies.
 */

var coap = require('coap')
  , url = require("url")
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  , WebSocketClient = require('websocket').client;

/**
 * Expose `CoapServer` constructor.
 */
if (typeof(module) != "undefined" && typeof(exports) != "undefined") {
  exports = module.exports = CoapServer;
}

/**
 * Initialize a new `CoapServer` with the given `options`.
 *
 * @param {Object} options
 * @api private
 */

function CoapServer(options) {
  // Superclass Constructor
  EventEmitter.call(this);

  options = options || {};
  this.clientsPath = [];
  this.proxyToWebsocketBrokers = {};
  this.host = options.host || 'localhost';
  this.port = options.port || 8000;
  this.endpoint = options.endpoint || [];
  this.route = {};
  this.handlers = {};
  this.server = null;
}

util.inherits(CoapServer, EventEmitter);

/**
 * Initialize a new `CoapServer` with the given `options`.
 *
 * @param {Object} request
 * @param {Object} response
 * @api private
 */
CoapServer.prototype.onRequest = function(request, response) {
  this.emit('newThing', {
    name: request.url
  });
};

/**
 * Initialize a new `CoapServer` with the given `options`.
 *
 * @param {String} path
 * @param {Object} data
 * @api private
 */

CoapServer.prototype.dispatchData = function(path, data) {
  var connections = this.clientsPath[path];

  if (typeof(connections) === 'undefined')
    return;

  //console.log('Pushing [' + data + '] to ' + path);

  for (var i = 0; i < connections.length; i++) {
    connections[i].write(data);
  }
};

/**
 * Start coap server.
 *
 * @param {Object} route
 * @return {}
 * @api public
 */
CoapServer.prototype.start = function(route, handlers) {
  var self = this;

  if (self.endpoint.length !== 0) {
    self.startAsProxy(route, handlers);
    return;
  };

  var server = coap.createServer().listen(this.port, function() {
      console.info('WoT/CoAP server is listening at coap://' + self.host + ':' + self.port);

      self.emit('start', {
        port: self.port,
        host: self.host
      });      
  });

  var coapRequest = function(request, response) {
    self.onRequest(request, response);

    // `response` is an instance of OutgoingMessage
    // use ```connection.server``` to access CoapServer instance
    var connection = {
      request: request,
      response: response,
      server: self
    };

    route(request.url, connection, handlers, self.clientsPath);   
  };

  server.on('request', coapRequest);

  this.server = server;
};

/**
 * Shutdown the CoAP server.
 *
 * @param cb {Function} The complete callback
 * @return {}
 * @api public
 */                                                                         
CoapServer.prototype.shutdown = function(cb) {
    this.server.close(function() {
        if (typeof cb === 'function') return cb();
    });
};

/**
 * Start coap proxy server.
 *
 * @param {Object} route
 * @param {Object} handlers
 * @api public
 */
CoapServer.prototype.startAsProxy = function(route, handlers) {
  var self = this;

  var server = coap.createServer().listen(this.port, function() {
      console.info('WoT/CoAP proxy server is listening at coap://' + self.host + ':' + self.port);

      self.emit('start', {
        port: self.port,
        host: self.host
      });          
  });

  var coapRequest = function(request, response) {
    self.onRequest(request, response);

    // `response` is an instance of OutgoingMessage
    // use ```connection.server``` to access CoapServer instance
    var connection = {
      request: request,
      response: response,
      server: self
    };

    /** Data structure of proxyToWebsocketBrokers
    * proxyToWebsocketBrokers = {
    *   '/object/5550937980d51931b3000009/send': {
    *     'localhost:8000': wsConn1,
    *     'localhost:8001': wsConn2
    *   },
    *   '/object/6661234567d4444b1111111/send': {
    *     'localhost:8000': wsConn3,
    *     'localhost:8001': wsConn4
    *   }
    * }
    **/

    var pathname = request.url;
    for(var i=0, host; host=self.endpoint[i++];) {
      (function(host, endpointBrokers) {
        // check specific pathname exists else init it
        if (typeof(endpointBrokers[pathname]) === 'undefined') endpointBrokers[pathname] = {};

        // If ws connect exists, then return;
        if (typeof(endpointBrokers[pathname][host]) !== 'undefined') return;

        if (!/^(ws|wss):\/\//.test(host)) {
          host = 'ws://' + host;
        }

        var wsClient = new WebSocketClient();
        wsClient.on('connectFailed', function(error) {
          console.log('Connect Error: ' + error.toString());
        });

        wsClient.on('connect', function(conn) {
          conn.on('error', function(error) {
          });
          conn.on('close', function() {
            delete endpointBrokers[pathname][host];
            if (endpointBrokers[pathname].length === 0) {
              delete endpointBrokers[pathname];
            };
          });
          conn.on('message', function(message) {
          });

          endpointBrokers[pathname][host] = conn;
        });

        var uri = host + pathname;
        console.log('Connect to endpoint ' + uri);

        // initial websocket connection
        wsClient.connect(uri, '');

      })(host, self.proxyToWebsocketBrokers)
    }

    route(request.url, connection, handlers, self.proxyToWebsocketBrokers);
  };

  server.on('request', coapRequest);

  this.server = server;  
}