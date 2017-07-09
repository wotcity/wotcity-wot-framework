var vows = require('vows'),
    assert = require('assert');

// Environment
process.env['PORT'] = 9000;

vows.describe('WoT.City Framework Tests').addBatch({
    'Testing WebSocket Broker Application Server': {
        'is server started': function () {
            var server = require('../../servers/websocket-broker');

            var onstart = function(payload) {
                server.shutdown(function() {
                    return 0;
                });    
            };

            server.start({
                onstart: onstart
            });
        }
    },
    'Testing CoAP Broker Application Server': {
        'is server started': function () {
            var server = require('../../servers/coap-broker'); 

            var onstart = function(payload) {
                server.shutdown(function() {
                    return 0;
                });    
            };

            server.start({
                onstart: onstart
            });
        }
    },  
    'Testing WebSocket-to-CoAP Proxy Application Server': {
        'is server started': function () {
            var server = require('../../servers/websocket-proxy-coap'); 

            var onstart = function(payload) {
                server.shutdown(function() {
                    return 0;
                });    
            };

            server.start({
                onstart: onstart
            });
        }
    },   
    'Testing CoAP-to-WebSocket Proxy Application Server': {
        'is server started': function () {
            var server = require('../../servers/coap-proxy-websocket'); 

            var onstart = function(payload) {
                server.shutdown(function() {
                    return 0;
                });    
            };

            server.start({
                onstart: onstart
            });
        }
    }      
}).export(module);;
