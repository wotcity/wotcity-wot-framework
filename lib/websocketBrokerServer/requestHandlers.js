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

if (typeof(Handlers) == "undefined") {
    var Handlers = {};
}

Handlers.send = function(pathname, connection, clients) {
  // the original sender pathname
  connection.pathname = pathname;

  /*
   * convert sender pathname to viewer pathname
   * eg. '/object/mbedtaiwan/send' to '/object/mbedtaiwan/viewer'
   */
  var paths = pathname.split('/');

  // remove the rear string 'send'
  var viewer = paths.slice(0, -1).join('/');

  connection.viewer = viewer + '/viewer';
  connection.statusViewer = viewer + '/status';

  /*
   * initial storage for this viewer
   */
  for (var path in clients) {
      if (path === connection.viewer)
          return;
  }

  clients[connection.viewer] = [];
  clients[connection.statusViewer] = [];
}

Handlers.viewer = function(pathname, connection, clients) {
  //console.log("Viewer Routed: " + pathname);

  // the original sender pathname
  connection.pathname = pathname;

  // Save viewer clients (unlimited clients)
  for (var path in clients) {
      if (path === pathname) {
          clients[path].push(connection);
          return;
      }
  }

  /*
   * Not found. There is not a existing sender.
   */
  clients[pathname] = [];
  clients[pathname].push(connection);
}

Handlers.status = function(pathname, connection, clients) {
  //console.log("Status Routed: " + pathname);

  // the original sender pathname
  connection.pathname = pathname;

  // Save status viewer clients (unlimited clients)
  for (var path in clients) {
      if (path === pathname) {
          clients[path].push(connection);
          return;
      }
  }

  /*
   * Not found. There is not a existing status viewer.
   */
  clients[pathname] = [];
  clients[pathname].push(connection);
}

/**
 * The Websocket Proxy to Coap Endpoint
 */
Handlers.proxyingCoap = function(pathname, connection, clients) {
  connection.pathname = pathname;
  connection.isProxy = true;
}

if (typeof(module) != "undefined" && typeof(exports) != "undefined")
  module.exports = Handlers;
