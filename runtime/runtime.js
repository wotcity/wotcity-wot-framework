/**
 *
 * fb0 - Light-weight FBP JavaScript Network
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

if (typeof(module) !== "undefined" && typeof(exports) !== "undefined") {
  exports = module.exports = Network;
}

var Promise = require('bluebird');

function Network() {
  this._queue = [];
  this._processes = [];
  this._running = {};
  this._elapsed = -1;
  this._connections = [];
}

/**
 * Create a connection.
 *
 * @param {String} upproc The process name of up component (outPorts)
 * @param {String} upport The out port name of this process (outPorts)
 * @param {String} downproc The process name of down component (inPorts)
 * @param {String} downport The in port name of this process (inPorts)
 * @api private
 */
Network.prototype.connect = function(upproc, upport, downproc, downport) {
  this._connections.push({
    upproc, 
    upport, 
    downproc, 
    downport
  });
};

/**
 * Called by 'outPorts'
 */
Network.prototype.send = function(data) {
  // Construct a message of this payload.
  // Which upproc this payload is belonged to, and its upport name.
  var connection = {};
  var payload;

  if (!this._connections.length)
    // There is no connections of the graph.
    return;

  // No running process.
  // This is the data from hardware devices.
  if (typeof data.upproc !== 'undefined'
    && data.upproc === 'devify-device'
    && typeof data.upport !== 'undefined'
    && data.upport === 'out') {
    // The first process of the graph is the 'devify-device'
    // which is the *system* upproc. And its outPorts are the 
    // source of hardware data.
    // It's automatically connected to the inPorts of the first
    // user upproc.
    connection = this._connections[0];
    payload = data.payload;
  } else {
    connection.upproc = this._running.name;
    connection.upport = this._running.activeInPortName;
    payload = data;
  }

  this.sendToQueue({
    upproc: connection.upproc,
    upport: connection.upport,
    payload: payload
  });

  // Jobs of the running process is finished.
  // Terminal the running process.
  this._running = {};
};

Network.prototype.sendToQueue = function(item) {
  this._queue.push(item);
};

/**
 * The process name if the component name.
 * Each component can only be instantiated once (singleton).
 */
Network.prototype.contextSwitchByName = function(name) {
  for (i = 0; i < this._processes.length; i++) {
    if (this._processes[i].name === name) {
      this._running = this._processes[i];
    }
  };
};

/**
 * Run the queue. Handle the rear message.
 */
Network.prototype.run = Promise.coroutine(function* () {
  if (!this._queue.length)
    return;

  var message = this._queue.pop();
  var upproc = message.upproc;
  var upport = message.upport;
  var payload = message.payload;
  var connection = {};

  // Lookup the connection of this message
  for (i = 0; i < this._connections.length; i++) {
    var _connection = this._connections[i];

    if (_connection.upproc === upproc) {
      // The connection if this message is found.
      connection = _connection;

      // There must be only one connection of one upport.
      break;
    }
  };

  if (Object.getOwnPropertyNames(connection).length === 0)
    // No connection found.
    return;
  
  // Switch to 'downproc' process.
  this.contextSwitchByName(connection.downproc);

  // Send data to the downport.
  // The downport is the inPorts of downproc.
  var inPortName = connection.downport;

  if (typeof(this._running) === 'undefined') 
    return;

  if (typeof(this._running.inPorts) === 'undefined')
    return;

  if (typeof(this._running.inPorts.methods[inPortName]) !== 'function')
    return;

  // The 'data' event.
  // Call back inPorts event method.
  var start = new Date();
  this._running.inPorts.methods[inPortName]('data', payload);
  this._running.activeInPortName = inPortName;
  this._elapsed = Date.now() - start;

  console.log('Elapsed time for ' + inPortName + ': ' + this._elapsed + '(ms)...')
});

Network.prototype.useComponent = function(component) {
  if (typeof component === 'undefined')
    return;

  if (Object.getOwnPropertyNames(component).length === 0)
    // An empty component.
    return;

  if (typeof component.registerNetwork !== 'function') {
    console.log('Not an valid component.');
    return;
  }

  component.registerNetwork(this);
  this._processes.push(component);
};

Network.prototype.load = function(components) {
  if (typeof components === 'undefined')
    return;

  if (typeof components.length === 'undefined')
    // Not an array
    return;

  if (Object.getOwnPropertyNames(components).length === 0)
    // An empty object
    return;

  components.forEach(function (component) {
    this.useComponent(component);
  }.bind(this));
};

/**
 * Runtime of the network
 */
Network.prototype.runtime = Promise.coroutine(function* (graph) {
  if (typeof graph === 'undefined')
    return;

  if (Object.getOwnPropertyNames(graph).length === 0)
    // An empty object
    return;

  if (typeof graph.connections.length === 'undefined')
    // Not an array
    return;

  // Load graph
  graph.connections.forEach(function (connection) {
    this.connect( connection.upproc
                , connection.upport
                , connection.downproc
                , connection.downport );
  }.bind(this));

  // TBD: The Non-Preemptive Scheduler
  while (1) {
    yield Promise.delay(100);
    if (this._queue.length > 512) {
      console.log('Queue reaches maximum size of 512...')

      // The last item is now lost.
      this._queue.pop();
    }
    this.run();
  }
});