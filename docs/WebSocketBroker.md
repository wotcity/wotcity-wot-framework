# WebSocket Broker Servers

[![Join the chat at https://gitter.im/wotcity/wotcity-wot-framework](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/wotcity/wotcity-wot-framework?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A WebSocket broker server is not running on IoT devices. The main use case is for constrained devices (eg. microcontrollers) to send data streams over the web.

1. [Install](#install)
2. [Usage](#usage)
3. [Discussion](#discussion)
4. [How To Report Bugs](#how-to-report-bugs)

## Install

1. [Download dotcity-wot-framework](https://github.com/wotcity/dotcity-wot-framework).
2. Run `$ cd dotcity-wot-framework` to change the directory.
3. Run `$ npm install` to install the dependencies if you don't already have them.
4. Run `$ node servers/websocket-broker.js` to start the WoT websocket server.

By default, the server is running at `ws://localhost:8000`. You could override the default settings by Linux shell environment varialbes ```HOST``` and ```PORT```. To start WebSocket broker server at *wotcity.com* and port 8080, run `$ export HOST=wotcity.com; export PORT=8080; node servers/websocket-broker.js` .

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
ws://localhost:8000/object/[name]/viewer
```

Also, you need to specify the object name and hostname. For example:

```
ws://localhost:8000/object/frontdoor/viewer
```

An physical object has two significant resources, *send* and *viewer*. *send* is to send device data to the server over Websocket connection. *viewer* could be used by web frontend to receive real-time data over the connection.

### Tests

1. Open a new terminal and run `$ cd tests` to enter the directory of test scripts.
2. Run `$ node websocket-send.js` to start sending streaming data to WoT websocket server.
3. Open a new terminal and run `$ node websocket-viewer.js` to start receiving streaming data over websocket. 

## Discussion

There are various ways to get involved with .CITY Web of Things Framework. We're looking for help identifying bugs, writing documentation and contributing codes.

You can also find us in the [#wotcity](http://webchat.freenode.net/?channels=wotcity) IRC channel on irc.freenode.net.

## How to Report Bugs

Bugs are reported via [https://github.com/wotcity/wotcity-wot-framework](https://github.com/wotcity/wotcity-wot-framework).
