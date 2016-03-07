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

 'use strict';

/** 
 * Wrapper of request handlers.
 */
if (typeof(Handlers) == "undefined") {
    var Handlers = {};
}

/**
 * The registration handler wrapper.
 *
 * @param {String} pathname     Pathname of CoAP request.
 * @param {Object} connection   CoAP client connection.
 * @param {Object} clients      The data model of client connections.
 */
Handlers.registration = function(pathname, request, response) {
  var handle = require('services/registration.js');

  /*
   * Invoke the handler for this operation.
   */
  handle.handle(request, response);
}

if (typeof(module) != "undefined" && typeof(exports) != "undefined")
  module.exports = Handlers;