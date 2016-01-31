/**
 *
 * .City Web of Things Framework
 * 
 * Copyright 2015 WoT.City, Inc.
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

var bl = require('bl');
var WebSocketClient = require('websocket').client;

if (typeof(Handlers) == "undefined") {
    var Handlers = {};
}

// reading readable streams
var dispatchMessage = function(viewers, req) {
  var stream = bl();

  req.on('data', function(chunk) {
    stream.append(chunk);
  });

  req.on('end', function() {
    var data = stream.toString('ascii');
    console.log('Dispatching: ' + data);
  })
};

/**
 * The sending observer.
 */
var send = function(pathname, connection, clients) {
  console.log('Routing ' + pathname);

  // write back the original sender pathname
  connection.pathname = pathname;

  /*
   * convert sender pathname to viewer pathname
   * eg. '/object/testman/send' to '/object/testman/viewer'
   */
  var paths = pathname.split('/');

  // remove the rear string 'send'
  var viewer = paths.slice(0, -1).join('/');

  connection.viewer = viewer + '/viewer';

  /*
   * initial storage for this viewer
   */
  for (var path in clients) {
      if (path === connection.viewer)
          return dispatchMessage(clients[path], connection.request);
  }

  clients[connection.viewer] = [];
}

/**
 * The data sender.
 */
Handlers.send = send;

/**
 * The viewer observer.
 */
Handlers.viewer = function(pathname, connection, clients) {
  console.log("Viewer Routed: " + pathname);

  // write back the original sender pathname
  connection.pathname = pathname;

  // Save viewer clients (unlimited clients)
  for (var path in clients) {
      if (path === pathname) {
          return clients[path].push(connection.responsive);
      }
  }

  /*
   * Not found. There is not a existing sender.
   */
  clients[pathname] = [];
  clients[pathname].push(connection.responsive);
}

/**
 * The CoAP Proxy - HTTP
 */
Handlers.proxyingHTTP = function(pathname, connection, clients) {
  console.log("Proxying: " + pathname);

  var http = require('http');
  var options = {
    host: 'wot.city',
    path: pathname
  };

  callback = function(response) {
    var str = '';

    // chunk of data
    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
    });
  }

  // Proxying this CoAP request
  http.request(options, callback).end();

  // write back the original sender pathname
  connection.pathname = pathname;
}

/**
 * The CoAP Proxy - WebSocket
 */
var webSocketConnections = [];

Handlers.proxyingWebSocket = function(pathname, connection, clients) {
  console.log("Proxying: " + pathname);

  var request = connection.request;
  var wsConn = webSocketConnections[pathname];

  if (typeof(wsConn) === 'undefined') {
    console.log('-== Create WebSocket Client ==-');
    var wsClient = new WebSocketClient();

    wsClient.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
    });

    wsClient.on('connect', function(conn) {
      console.log('WebSocket connection created.');

      conn.on('error', function(error) {
      });
      conn.on('close', function() {
        delete webSocketConnections[pathname];
      });
      conn.on('message', function(message) {
      });

      webSocketConnections[pathname] = conn;
    });

    // initial websocket connection
    return wsClient.connect('wss://wot.city' + pathname, '');
  }

  // there is an normal websocket client of this client connection
  // start dispatch coap message
  var stream = bl();

  request.on('data', function(chunk) {
    stream.append(chunk);
  });

  // websocket sender
  request.on('end', function() {
    var data = stream.toString('ascii');
    wsConn.sendUTF(data);
    console.log('[DATA]: ' + data);
  });

  // write back the original sender pathname
  connection.pathname = pathname;
}

if (typeof(module) != "undefined" && typeof(exports) != "undefined")
  module.exports = Handlers;
