/**
 *
 * WoT.City Open Source Project
 *
 * Copyright 2015 Jollen
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

var Framework = require('./lib/framework')
  , WebsocketBroker = require("./lib/websocketBrokerServer/server")
  , WebsocketRouter = require("./lib/websocketBrokerServer/router")
  , WebsocketRequestHandlers = require("./lib/websocketBrokerServer/requestHandlers")
  , CoapBroker = require("./lib/coapServer/server")
  , CoapRouter = require("./lib/coapServer/router")
  , CoapRequestHandlers = require("./lib/coapServer/requestHandlers");

var Component = require('./runtime/component')
  , Runtime = require('./runtime/runtime');

module.exports = {
	Framework: Framework,

 	WebsocketBroker: WebsocketBroker,
 	WebsocketRouter: WebsocketRouter,
 	WebsocketRequestHandlers: WebsocketRequestHandlers,

 	CoapBroker: CoapBroker,
 	CoapRouter: CoapRouter,
 	CoapRequestHandlers: CoapRequestHandlers,

 	Component: Component,
 	Runtime: Runtime,

    Server: {
        WebsocketBroker: require('./servers/websocket-broker'),
        CoapBroker: require('./servers/coap-broker'),
        WebsocketToCoapProxy: require('./servers/websocket-proxy-coap'),
        CoapToWebsocketProxy: require('./servers/coap-proxy-websocket')
    }
};
