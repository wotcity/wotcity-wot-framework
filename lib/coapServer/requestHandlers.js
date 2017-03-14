/**
 *
 * WoT.City Open Source Project
 *
 * Copyright 2015 WoT.City Open Source Project
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

/**
 * The sending observer.
 */
Handlers.send = function(pathname, connection, clients) {
  var stream = bl();

  // the server of this connection
  var server = connection.server;
  var req = connection.request;

  /*
   * convert sender pathname to viewer pathname
   * eg. '/object/testman/send' to '/object/testman/viewer'
   */
  var paths = pathname.split('/');

  // remove the rear string 'send'
  var viewer = paths.slice(0, -1).join('/');

  connection.viewer = viewer + '/viewer';

  var done = function(data) {
    // emit 'onData'
    server.emit('data', {
      data: data,
      pathname: pathname
    });

    // dispatch this data
    for (var path in clients) {
        if (path === connection.viewer)
            return server.dispatchData(path, data);
    }
  };

  req.on('data', function(chunk) {
    stream.append(chunk);
  });

  req.on('end', function() {
    var data = stream.toString('ascii');
    done(data);
  });
}

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
          return clients[path].push(connection.response);
      }
  }

  /*
   * Not found. There is not a existing sender.
   */
  clients[pathname] = [];
  clients[pathname].push(connection.response);
}

/**
 * The CoAP Proxy - HTTP
 */
Handlers.proxyingHTTP = function(pathname, connection, clients) {
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
 * The CoAP Proxy to WebSocket Endpoint
 */
var webSocketConnections = [];
var proxyBuffer = bl();
Handlers.proxyingWebSocket = function(pathname, connection, clients) {
  var request = connection.request;
  var wsConn = webSocketConnections[pathname];

  // The instance of CoapServer
  var server = connection.server;
  var endpoint = server.endpoint;

  if (!/^(ws|wss):\/\//.test(endpoint)) {
    endpoint = 'ws://' + endpoint;
  }

  if (typeof(wsConn) === 'undefined') {
    var wsClient = new WebSocketClient();

    wsClient.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
    });

    wsClient.on('connect', function(conn) {
      conn.on('error', function(error) {
      });
      conn.on('close', function() {
        delete webSocketConnections[pathname];
      });
      conn.on('message', function(message) {
      });

      webSocketConnections[pathname] = conn;
    });

    var uri = endpoint + pathname;
    console.log('Connect to endpoint ' + uri);

    // initial websocket connection
    wsClient.connect(uri, '');
  }

  // there is an normal websocket client of this client connection
  // start dispatch coap message
  request.on('data', function(chunk) {
    proxyBuffer.append(chunk);
  });

  // websocket sender
  request.on('end', function() {
    if (typeof(wsConn) === 'undefined') return;
    
    var data = proxyBuffer.toString('ascii');
    wsConn.sendUTF(data);
    proxyBuffer = bl();
    
    // emit 'onData'
    server.emit('data', {
      data: data,
      pathname: pathname      
    });
  });

  // write back the original sender pathname
  connection.pathname = pathname;
}

if (typeof(module) != "undefined" && typeof(exports) != "undefined")
  module.exports = Handlers;
