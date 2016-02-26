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

/**************************************************************/
/**
 * lwm2m-node-lib
 */
var config = require('./config.js'),
    lwm2mClient = require('lwm2m-node-lib').client,
    async = require('async'),
    globalDeviceInfo,
    separator = '\n\n\t';

function printObject(result) {
    var resourceIds = Object.keys(result.attributes);
    console.log('\nObject:\n--------------------------------\nObjectType: %s\nObjectId: %s\nObjectUri: %s',
        result.objectType, result.objectId, result.objectUri);

    if (resourceIds.length > 0) {
        console.log('\nAttributes:');
        for (var i=0; i < resourceIds.length; i++) {
            console.log('\t-> %s: %s', resourceIds[i], result.attributes[resourceIds[i]]);
        }
        console.log('\n');
    }
}

function handleObjectFunction(error, result) {
    if (error) {
        console.log('Error: ' + error)
    } else {
        printObject(result);
    }
}

function create(command) {
    lwm2mClient.registry.create(command[0], handleObjectFunction);
}

function get(command) {
    lwm2mClient.registry.get(command[0], handleObjectFunction);
}

function remove(command) {
    lwm2mClient.registry.remove(command[0], handleObjectFunction);
}

function set(command) {
    lwm2mClient.registry.setResource(command[0], command[1], command[2], handleObjectFunction);
}

function unset(command) {
    lwm2mClient.registry.unsetResource(command[0], command[1], handleObjectFunction);
}

function list() {
    lwm2mClient.registry.list(function(error, objList) {
        if (error){
            console.log(error);
        } else {
            console.log('\nList:\n--------------------------------\n');
            for (var i=0; i < objList.length; i++) {
                console.log('\t-> ObjURI: %s / Obj Type: %s / Obj ID: %s / Resource Num: %d',
                    objList[i].objectUri, objList[i].objectType, objList[i].objectId,
                    Object.keys(objList[i].attributes).length);
            }
        }
    });
}

function handleWrite(objectType, objectId, resourceId, value, callback) {
    console.log('\nValue written:\n--------------------------------\n');
    console.log('-> ObjectType: %s', objectType);
    console.log('-> ObjectId: %s', objectId);
    console.log('-> ResourceId: %s', resourceId);
    console.log('-> Written value: %s', value);

    callback(null);
}

function handleExecute(objectType, objectId, resourceId, value, callback) {
    console.log('\nCommand executed:\n--------------------------------\n');
    console.log('-> ObjectType: %s', objectType);
    console.log('-> ObjectId: %s', objectId);
    console.log('-> ResourceId: %s', resourceId);
    console.log('-> Command arguments: %s', value);

    callback(null);
}

function handleRead(objectType, objectId, resourceId, value, callback) {
    console.log('\nValue read:\n--------------------------------\n');
    console.log('-> ObjectType: %s', objectType);
    console.log('-> ObjectId: %s', objectId);
    console.log('-> ResourceId: %s', resourceId);
    console.log('-> Read Value: %s', value);

    callback(null);
}

function setHandlers(deviceInfo) {
    lwm2mClient.setHandler(deviceInfo.serverInfo, 'write', handleWrite);
    lwm2mClient.setHandler(deviceInfo.serverInfo, 'execute', handleExecute);
    lwm2mClient.setHandler(deviceInfo.serverInfo, 'read', handleRead);
}

function connect(command) {
    var url;

    console.log('\nConnecting to the server. This may take a while.\n');

    if (command[2] === '/') {
        url = command[2];
    }

    lwm2mClient.register(command[0], command[1], command[3], command[2], function (error, deviceInfo) {
        if (error) {
            console.log(error);
        } else {
            globalDeviceInfo = deviceInfo;
            setHandlers(deviceInfo);
            console.log('\nConnected:\n--------------------------------\nDevice location: %s', deviceInfo.location);
        }
    });
}

function disconnect(command) {
    if (globalDeviceInfo) {
        lwm2mClient.unregister(globalDeviceInfo, function(error) {
            if (error) {
                console.log(error);
            } else {
                console.log('\nDisconnected:\n--------------------------------\n');
            }
        });
    } else {
        console.error('\nCouldn\'t find device information (the connection may have not been completed).');
    }
}

function updateConnection(command) {
    if (globalDeviceInfo) {
        lwm2mClient.update(globalDeviceInfo, function(error, deviceInfo) {
            if (error) {
                console.log(error);
            } else {
                globalDeviceInfo = deviceInfo;
                setHandlers(deviceInfo);
                console.log('\Information updated:\n--------------------------------\n');
            }
        });
    } else {
        console.error('\nCouldn\'t find device information (the connection may have not been completed).');
    }
}

function quit(command) {
    console.log('\nExiting client\n--------------------------------\n');
    process.exit();
}

var commands = {
    'create': {
        parameters: ['objectUri'],
        description: '\tCreate a new object. The object is specified using the /type/id OMA notation.',
        handler: create
    },
    'get': {
        parameters: ['objectUri'],
        description: '\tGet all the information on the selected object.',
        handler: get
    },
    'remove': {
        parameters: ['objectUri'],
        description: '\tRemove an object. The object is specified using the /type/id OMA notation.',
        handler: remove
    },
    'set': {
        parameters: ['objectUri', 'resourceId', 'resourceValue'],
        description: '\tSet the value for a resource. If the resource does not exist, it is created.',
        handler: set
    },
    'unset': {
        parameters: ['objectUri', 'resourceId'],
        description: '\tRemoves a resource from the selected object.',
        handler: unset
    },
    'list': {
        parameters: [],
        description: '\tList all the available objects along with its resource names and values.',
        handler: list
    },
    'connect': {
        parameters: ['host', 'port', 'endpointName', 'url'],
        description: '\tConnect to the server in the selected host and port, using the selected endpointName.',
        handler: connect
    },
    'updateConnection': {
        parameters: [],
        description: '\tUpdates the current connection to a server.',
        handler: updateConnection
    },
    'disconnect': {
        parameters: [],
        description: '\tDisconnect from the current server.',
        handler: disconnect
    },
    'config': {
        parameters: [],
        description: '\tPrint the current config.',
        handler: function() {

        }
    },
    'quit': {
        parameters: [],
        description: '\tExit the client.',
        handler: quit
    }
};

Handlers.lwm2mRouter = function(pathname, connection, clients) {
  console.log('Device: ' + pathname);

  lwm2mClient.registry.create([pathname], handleObjectFunction);

  console.log('\nConnecting to the server. This may take a while.\n');

  lwm2mClient.register('localhost', 5683, '/', 'john', function (error, deviceInfo) {
      if (error) {
          console.log('Register error: ' + error);
      } else {
          globalDeviceInfo = deviceInfo;
          setHandlers(deviceInfo);
          console.log('\nConnected:\n--------------------------------\nDevice location: %s', deviceInfo.location);
      }
  });
}

/**************************************************************/

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

/**
 * The CoAP Proxy - HTTP
 */
Handlers.proxyingWebSocket = function(pathname, connection, clients) {
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
Handlers.proxyingWebSocket = function(pathname, connection, clients) {
  console.log("Proxying: " + pathname);

  if (typeof(connection.webSocketConnection) === 'undefined') {
    connection.webSocketClient = new WebSocketClient();

    connection.webSocketClient.on('connectFailed', function(error) {
    });

    connection.webSocketClient.on('connect', function(conn) {
      conn.on('error', function(error) {
      });
      conn.on('close', function() {
        delete connection.webSocketConnection;
      });
      conn.on('message', function(message) {
      });

      connection.webSocketConnection = conn;
    });

    // initial websocket connection
    return connection.webSocketClient.connect('ws://wot.city' + pathname, '');
  }

  // there is an normal websocket client of this client connection
  // start dispatch coap message
  var stream = bl();

  connection.request.on('data', function(chunk) {
    stream.append(chunk);
  });

  // websocket sender
  connection.request.on('end', function() {
    var data = stream.toString('ascii');
    connection.webSocketClient.sendUTF(data);
  })

  // write back the original sender pathname
  connection.pathname = pathname;
}


if (typeof(module) != "undefined" && typeof(exports) != "undefined")
  module.exports = Handlers;
