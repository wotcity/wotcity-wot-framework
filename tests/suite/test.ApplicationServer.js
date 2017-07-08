var vows = require('vows'),
    assert = require('assert');

var server = require('../../servers/websocket-broker');

// Environment
process.env['PORT'] = 9000;

var onstart = function(payload) {
    server.shutdown(function() {
    });    
}

vows.describe('WoT.City Framework Tests').addBatch({
    'Testing WebSocket Broker Application Server': {
        'is server started': function () {
            server.start({
                onstart: onstart
            });
        }
    }
}).export(module);;
