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

var http = require("http")
  , url = require("url")
  , cluster = require('cluster')
  , WebSocketServer = require('websocket').server
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  , coap = require('coap');

/**
 * Expose `WebsocketBroker` constructor.
 */
if (typeof(module) != "undefined" && typeof(exports) != "undefined") {
  exports = module.exports = WebsocketBroker;
}

/**
 * Initialize a new `WebsocketBroker` with the given `options`.
 *
 * @param {Object} options
 * @api private
 */

function WebsocketBroker(options) {
  // Superclass Constructor
  EventEmitter.call(this);

  options = options || {};
  this.clientsPath = [];
  this.host = options.host || 'localhost';
  this.port = options.port || 8000;
  this.endpoint = options.endpoint || 'localhost:8000';

  this.wsServer = null;
  this.httpServer = null;
}

util.inherits(WebsocketBroker, EventEmitter);

/**
 * Initialize a new `WebsocketBroker` with the given `options`.
 *
 * @param {Object} request
 * @param {Object} response
 * @api private
 */

WebsocketBroker.prototype.onRequest = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end();
};

/**
 * Initialize a new `WebsocketBroker` with the given `options`.
 *
 * @param {String} path
 * @param {Object} data
 * @api private
 */

WebsocketBroker.prototype.dispatchData = function(path, data) {
  var connections = this.clientsPath[path];

  if (typeof(connections) === 'undefined')
    return;

  //console.log('Pushing [' + data + '] to ' + path);

  for (var i = 0; i < connections.length; i++) {
    connections[i].sendUTF(data);
  }
};

/**
 * Initialize a new `WebsocketBroker` with the given `options`.
 *
 * @param {Object} request
 * @param {Object} response
 * @api private
 */

WebsocketBroker.prototype.dispatchStatus = function(path, data) {
  var connections = this.clientsPath[path];

  if (typeof connections === 'undefined')
    return;

  //console.log('Pushing [' + data + '] to ' + path);

  for (var i = 0; i < connections.length; i++) {
    connections[i].sendUTF(data);
  }
};

/**
 * Start websocket server.
 *
 * @param {Object} route
 * @return {}
 * @api public
 */

WebsocketBroker.prototype.start = function(route, handlers) {
  var self = this;

  if (cluster.isMaster && process.env['CPUS'] > 1) {
      // Count the machine's CPUs
      var cpuCount = process.env['CPUS'];

      //console.info('CPUs: ' + cpuCount);

      // Create a worker on each CPU
      for (var i = 0; i < cpuCount ; i++) {
          var port = this.port + i;
          cluster.fork({
            HOST: this.host,
            PORT: port
          });
      }

      return true;
  }

  // arguments to child processes
  var port = self.port || process.env['PORT'];
  var host = self.host || process.env['HOST'];
  var endpoint = self.endpoint || process.env['ENDPOINT'];

  var httpServer = http.createServer(this.onRequest).listen(port, host, function() {
      var workerinfo = "";
      if (cluster.isWorker) workerinfo = " on CPU " + cluster.worker.id;
      console.info('WoT/WebSocket server is listening at ws://' + self.host + ':' + self.port + workerinfo);

      self.emit('start', {
        port: port,
        host: host
      });      
  });

  var wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
  });

  this.httpServer = httpServer;
  this.wsServer = wsServer;

  /**
   * handlers
   */
  var onWsRequest = function(request) {
    var connection = request.accept('', request.origin);

    //console.log("[2]: onWsRequest");
    //console.log("[3]: resource: " + request.resource);

    // put worker object into connection
    connection.worker = cluster.worker;

    route(request.resource, connection, handlers, self.clientsPath);

    // register this thing
    self.emit('newThing', {
      name: connection.pathname
    });

    connection.on('message', onWsConnMessage);
    connection.on('close', onWsConnClose);

    if (typeof (connection.statusViewer) !== 'undefined')
      self.dispatchStatus(connection.statusViewer, JSON.stringify({ isAlive: true }));
  };

  var onWsConnMessage = function(message) {
    //console.log('onWsConnMessage: ' + this.pathname);
    //console.log('Received: ' + message.utf8Data);

    self.emit('data', {
      data: message.utf8Data,
      pathname: this.pathname
    });

    if(this.isProxy) {
      for(var i=0, host; host = self.endpoint[i++];) {
        (function(host, conn) {
          var coapclient = coap.request('coap://' + host + conn.pathname);
          coapclient.end(new Buffer(message.utf8Data));
        })(host, this)
      }
      
      return;
    }
    
    // Is it a sender ? Yes, then push data to all viewers.
    if (typeof (this.viewer) !== 'undefined')
      self.dispatchData(this.viewer, message.utf8Data);

    if (typeof (this.statusViewer) !== 'undefined')
      self.dispatchStatus(this.statusViewer, JSON.stringify({ isAlive: true }));
  };

  var onWsConnect = function(webSocketConnection) {
    //console.log("[1]: onWsConnect: a new thing is connected");

    //webSocketConnection.on('message', onWsConnMessage);
    //webSocketConnection.on('close', onWsConnClose);
  };

  var onWsConnClose = function(reasonCode, description) {
    //console.log('Peer disconnected with reason: ' + reasonCode);

    // remove an element from Array
    //clientsConn.splice( clientsConn.indexOf(this), 1 );

    if (typeof (this.statusViewer) !== 'undefined')
        self.dispatchStatus(this.statusViewer, JSON.stringify({ isAlive: false }));
  };

  wsServer.on('request', onWsRequest);
  wsServer.on('connect', onWsConnect);
};

/**
 * Shutdown the Websocket server.
 *
 * @param cb {Function} The complete callback
 * @return {}
 * @api public
 */                                                                         
WebsocketBroker.prototype.shutdown = function(cb) {
    var self = this;

    this.httpServer.close(function() {
        self.wsServer.shutDown();
        if (typeof cb === 'function') return cb();
    });
};