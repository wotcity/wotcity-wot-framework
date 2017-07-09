var vows = require('vows'),
    assert = require('assert');

// Environment
process.env['PORT'] = 9000;

// SDK
var Server = require('../../index').Server;

vows.describe('WoT.City SDK Tests').addBatch({
    'Testing WebSocket Broker SDK': {
        'is server started': function () {
            var onstart = function(payload) {
                Server.WebsocketBroker.shutdown(function() {
                    return 0;
                });    
            };

            Server.WebsocketBroker.start({
                onstart: onstart
            });
        }
    },
    'Testing CoAP Broker SDK': {
        'is server started': function () {
            var onstart = function(payload) {
                Server.CoapBroker.shutdown(function() {
                    return 0;
                });    
            };

            Server.CoapBroker.start({
                onstart: onstart
            });
        }
    },  
    'Testing WebSocket-to-CoAP Proxy SDK': {
        'is server started': function () {
            var onstart = function(payload) {
                Server.WebsocketToCoapProxy.shutdown(function() {
                    return 0;
                });    
            };

            Server.WebsocketToCoapProxy.start({
                onstart: onstart
            });
        }
    },   
    'Testing CoAP-to-WebSocket Proxy SDK': {
        'is server started': function () {
            var onstart = function(payload) {
                Server.CoapToWebsocketProxy.shutdown(function() {
                    return 0;
                });    
            };

            Server.CoapToWebsocketProxy.start({
                onstart: onstart
            });
        }
    }      
}).export(module);;
