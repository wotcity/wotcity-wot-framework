# Websocket Broker Servers to Coap Broker Servers

[![Join the chat at https://gitter.im/wotcity/wotcity-wot-framework](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/wotcity/wotcity-wot-framework?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A Coap broker server is not running on IoT devices. The main use case is for constrained devices (eg. microcontrollers) to send data streams over the web.

1. [Install](#install)
2. [Usage](#usage)
3. [Discussion](#discussion)
4. [How To Report Bugs](#how-to-report-bugs)

## Install

1. [Download dotcity-wot-framework](https://github.com/wotcity/dotcity-wot-framework).
2. Run `$ cd dotcity-wot-framework` to change the directory.
3. Run `$ npm install` to install the dependencies if you don't already have them.
4. Run `$ node servers/websocket-proxy-coap.js` to start the WoT Websocket proxy server.
4. Run `$ node servers/coap-broker.js` to start the WoT Coap endpoint server.

By default, the Websocket proxy server is running at `ws://localhost:8000`. The Coap endpoint server is running at `coap://localhost:8000`.

The address of only **ONE** target endpoint set in Websocket proxy server is `localhost:8000`. You can check code in `servers/websocket-proxy-coap.js`:
```javascript
var server = new WebsocketBroker({
    port: port,
    host: host,
    endpoint: [
      'localhost:8000'
    ]
});
```
In this setting, Websocket proxy server will proxy data to `coap://localhost:8000`. Of course, you can add other hosts, for example `localhost:8001` in `endpoint` array to proxy data to multiple endpoints. 

### Prerequisites

1. [Node.js](https://nodejs.org). Note: Node should be with a version above 0.10.x.

## Usage

To send the data over the Internet, IoT devices should use the url below to establish a connection with the server.

```
ws://[hostname]/object/[name]/send
```

You must specify an object name and your hostname. For example:

```
ws://localhost:8000/object/frontdoor/send
```

To receive data from the server, the frontend should use the url below to establish a connection with the server.

```
coap://localhost:8000/object/[name]/viewer
```

Also, you need to specify the object name and hostname. For example:

```
coap://localhost:8000/object/frontdoor/viewer
```

An physical object has two significant resources, *send* and *viewer*. *send* is to send device data to the server over Websocket connection. *viewer* could be used by web frontend to receive real-time data over the Coap connection.

### Tests
##### Proxy to one endpoint
1. Open a new terminal and run `$ cd tests` to enter the directory of test scripts.
2. Run `$ node websocket-send.js` to start sending streaming data to WoT coap proxy server.
3. Open a new terminal and run `$ node coap-view-data.js` to start receiving streaming data over websocket. 

##### Proxy to two endpoint
1. Open a new terminal and run `$ export export PORT=8001; node servers/coap-broker.js` to start the 2nd coap endpoint at `coap://localhost:8001`.
2. Add another endpoint in `servers/websocket-proxy-coap.js`, for example `localhost:8001`, and then start to run the Websocket proxy server.
3. Open a new terminal and run `$ export export PORT=8001; node test/coap-viewer.js` to start the 2nd Coap viewer.

## Discussion

There are various ways to get involved with .CITY Web of Things Framework. We're looking for help identifying bugs, writing documentation and contributing codes.

You can also find us in the [#wotcity](http://webchat.freenode.net/?channels=wotcity) IRC channel on irc.freenode.net.

## How to Report Bugs

Bugs are reported via [https://github.com/wotcity/wotcity-wot-framework](https://github.com/wotcity/wotcity-wot-framework).
