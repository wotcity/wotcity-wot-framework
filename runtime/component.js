/**
 *
 * WoT.City Open Source Project
 * 
 * Copyright 2016 Jollen
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
 * Expose `Automation` class. (NodeJS)
 */
if (typeof(module) !== "undefined" && typeof(exports) !== "undefined") {
  exports = module.exports = Component;
}

/**
 * Util Modules
 */
var merge = require('utils-merge');

/*
 * Class
 */
function Component(options) {
  // initialize the private options
  this._options = {};

  this.inPorts = new InPorts;
  this.outPorts = new OutPorts;
};

Component.prototype.registerNetwork = function(network) {
  this.inPorts._network = network;
  this.outPorts._network = network;
};

// [TBD] Extend 'inPorts' class:
//  Component = inPorts.Extend({})
var InPorts = function() {
  this._network = {};
  this.methods = [];
};

InPorts.prototype.add = function(name, callback) {
  if (typeof(name) !== 'string') 
    return;

  if (typeof(callback) === 'function') {
    this[name] = callback;
    this.methods[name] = callback;
  }
};

var OutPorts = function() {
  this._network = {};
};

OutPorts.prototype.send = function(payload) {
  if (this._network && typeof(this._network.send) === 'function') {
    this._network.send(payload);
  }
};

OutPorts.prototype.add = function(name) {
  if (typeof(name) !== 'string') 
    return;

  this[name] = {
    send: this.send.bind(this)
  };
};