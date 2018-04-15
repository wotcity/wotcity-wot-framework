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
  , WebSocketClient = require('websocket').client  
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
  this.endpoints = options.endpoints || [];
  this.websocketEndpoints = {};

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

    var proxyingCoapEndpoint = function(uri, payload) {
      if (typeof uri === 'undefined') return;
      if (!/^(coap):\/\//.test(uri)) uri = 'coap://' + uri;

      console.log('Connect to CoAP endpoint: ' + uri);

      var coapClient = coap.request(uri);
      coapClient.end(new Buffer(payload.utf8Data));
    };

    var proxyingWebsocketEndpoint = function(uri, payload) {
      if (typeof uri === 'undefined') return;

      var conn = self.websocketEndpoints[uri];

      if (typeof conn !== 'undefined' 
        && Object.keys(conn).length === 0) return;

      if (typeof conn !== 'undefined'
        && Object.keys(conn).length > 0) 
        return conn.sendUTF(payload);

      // Wait for connections...
      self.websocketEndpoints[uri] = {};

      if (!/^(ws|wss):\/\//.test(uri)) uri = 'ws://' + uri;

      var wsClient = new WebSocketClient();

      wsClient.on('connectFailed', function(error) {
        console.log('Connect failed: ' + error.toString());
      });

      wsClient.on('connect', function(conn) {
        conn.on('error', function(error) {
          console.log('Connect error: ' + error.toString());          
        });
        conn.on('close', function(error) {
          console.log('Connect closed: ' + error.toString()); 

          delete self.websocketEndpoints[uri];
        });
        conn.on('message', function(message) {
        });

        self.websocketEndpoints[uri] = conn;
      });

      console.log('Connect to Websocket endpoint: ' + uri);

      // initial websocket connection
      wsClient.connect(uri, '');
    };

    if (this.isCoapProxy === true) {
      for (var i = 0; i < self.endpoints.length; i++) {
        var host = self.endpoints[i];
        if (typeof host === 'undefined' || !host) return;

        var uri = host + this.pathname;        

        proxyingCoapEndpoint(uri, message);
      }      
    } else /* websocket proxy */ {
      for (var i = 0; i < self.endpoints.length; i++) {
        var host = self.endpoints[i];
        if (typeof host === 'undefined' || !host) return;

        var uri = host + this.pathname;        

        proxyingWebsocketEndpoint(uri, message);
      }     
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
