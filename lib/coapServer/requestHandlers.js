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

if (typeof(Handlers) == "undefined") {
    var Handlers = {};
}

(function() {
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
  Handlers.send = function(pathname, connection, clients) {
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
})();

if (typeof(module) != "undefined" && typeof(exports) != "undefined")
  module.exports = Handlers;