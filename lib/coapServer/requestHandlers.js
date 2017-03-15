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
var proxyBuffer = {};
Handlers.proxyingWebSocket = function(pathname, connection, clients) {
  var request = connection.request, 
      endpoints = clients[pathname], 
      stream = proxyBuffer[pathname];

  if (typeof(stream) === 'undefined') {
    proxyBuffer[pathname] = stream = bl();
  };

  // The instance of CoapServer
  var server = connection.server;

  // there is an normal websocket client of this client connection
  // start dispatch coap message
  request.on('data', function(chunk) {
    stream.append(chunk);
  });

  // websocket sender
  request.on('end', function() {
    // if there are no websocket connects exist under pathname, persist the received data in buffer
    if (Object.keys(endpoints).length === 0 && endpoints.constructor === Object) return;
    
    var data = stream.toString('ascii');
    
    for(var host in endpoints) {
      if (!endpoints.hasOwnProperty(host)) continue;
      
      console.info('proxying ' + data + ' to ' + host);
      var wsConn = endpoints[host];
      wsConn.sendUTF(data);
    }

    proxyBuffer[pathname] = stream = bl();
    
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
