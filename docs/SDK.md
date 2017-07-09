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

## APIs

### Servers

* WebsocketBroker
* CoapBroker
* WebsocketToCoapProxy
* CoapToWebsocketProxy
