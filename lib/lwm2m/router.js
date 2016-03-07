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

/**
 * Module dependencies.
 */


/**
 * Expose `Rounter` constructor.
 */
if (typeof(module) != "undefined" && typeof(exports) != "undefined")
  exports = module.exports = Rounter;

/**
 * Class and Prototype
 *
 * @api private
 */

function Rounter() {

}

/**
 * The URI (pathname) router. Handles the request to the coap server.
 *
 * @param {String} pathname       String containing the pathname of URI.
 * @param {Object} connection     Object containing the request infomation.
 * @param {Object} handlers
 * @param {Object} clients
 * @api public
 */

Rounter.prototype.route = function(pathname, request, response, handlers) {
  for(var obj in handlers) {

    var handler = obj.handler;
    var pathExp = pathToRegExp(obj.uri);

    if (!(pathExp instanceof RegExp)) {
      throw new Error('Path must be specified as either a string or a RegExp.');
    }

    if (typeof handler === "function") {
      if (pathExp.test(pathname)) {
        return handler(pathname, request, response);
      }      
    }
  }

  console.log("No request handler for this pathname: '" + pathname + "'");
}

/**
 * Converting the pathname string into to regular expression.
 *
 * @param {String} path
 * @api private
 */

var pathToRegExp = function(path) {
  if (typeof(path) === 'string') {
      if (path === '*') {
          path = /^.*$/;
      }
      else {
          //path = path.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
          path = new RegExp('^' + path + '$');
      }
  }
  return path;
};