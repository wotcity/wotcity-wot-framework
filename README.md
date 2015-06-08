# .City Web of Things Framework

The Web of Things framework by WoT.City. It's a broker WoT server. This means that it isn't running on IoT devices. The current implementation has the following features and please read [Usage](#usage) for technical information..

1. A Websocket broker server. 
2. The main use case is for constrained devices (eg. microcontrollers) to sending data streams to the web.

It's an reference implementation of concepts of W3C Web of Things Framework.

1. [Install](#install)
2. [Usage](#usage)
3. [Discussion](#discussion)
4. [How To Report Bugs](#how-to-report-bugs)
5. [Authors](#authors)

## Install

1. [Download dotcity-wot-framework](https://github.com/wotcity/dotcity-wot-framework).
2. Run `$ cd dotcity-wot-framework` to change the directory.
3. Run `$ npm install` to install the dependencies if you don't already have them.
4. Run `$ node index.js` to start the WoT websocket server.

The server is running at `ws://localhost:8000`.

## Tests

1. Open a new terminal and run `$ cd tests` to enter the directory of test scripts.
2. Run `$ node send.js` to start sending streaming data to WoT websocket server.
3. Open a new terminal and run `$ node viewer.js` to start receiving streaming data over websocket. 

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

## Discussion

There are various ways to get involved with .CITY Web of Things Framework. We're looking for help identifying bugs, writing documentation and contributing codes.

You can also find us in the [#wotcity](http://webchat.freenode.net/?channels=wotcity) IRC channel on irc.freenode.net.

## How to Report Bugs

Bugs are reported via [https://github.com/wotcity/dotcity-wot-framework](https://github.com/wotcity/dotcity-wot-framework).

## License

The MIT License (MIT)

Copyright (c) 2015 Jollen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.