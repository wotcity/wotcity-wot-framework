# SDK

How to use ```wotcity.io``` as the application server SDK.

## Step 1: Create a new Node.js project

```
$ mkdir mywot
$ cd mywot
$ npm init
$ npm i wotcity.io --save
```

## Step 2: Create a simple WebSocket broker application

Create a new file named ```app.js``` for example and copy the following sample code:

```
var Server = require('wotcity.io').Server;
Server.WebsocketBroker.start();
```

# APIs

## Class: Server.WebsocketBroker

To start a Websocket broker server:

```
var Server = require('wotcity.io').Server;
Server.WebsocketBroker.start();
```

### new Server.WebsocketBroker(callback)

* ```options``` <Object> Options containing response events.
 * ondata <Function> Callback function that receives client data
 * onstart <function> Callback function that notifies the success of creating the Websocket connection.

## Class: Server.CoapBroker

To start a CoAP broker server:

```
var Server = require('wotcity.io').Server;
Server.CoapBroker.start();
```

### new Server.CoapBroker(callback)

* ```options``` <Object> Options containing response events.
 * ondata <Function> Callback function that receives client data
 * onstart <function> Callback function that notifies the success of creating the Websocket connection.

## Class: Server.WebsocketToCoapProxy

To start a Websocket-to-CoAP protocol translation server:

```
var Server = require('wotcity.io').Server;
Server.WebsocketToCoapProxy.start();
```

### new Server.WebsocketToCoapProxy(callback)

* ```options``` <Object> Options containing response events.
 * ondata <Function> Callback function that receives client data
 * onstart <function> Callback function that notifies the success of creating the Websocket connection.

## Class: Server.CoapToWebsocketProxy

To start a CoAP-to-Websocket protocol translation server:

```
var Server = require('wotcity.io').Server;
Server.CoapToWebsocketProxy.start();
```

### new Server.CoapToWebsocketProxy(callback)

* ```options``` <Object> Options containing response events.
 * ondata <Function> Callback function that receives client data
 * onstart <function> Callback function that notifies the success of creating the Websocket connection.
