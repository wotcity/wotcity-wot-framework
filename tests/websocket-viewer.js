var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

var port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
var host = process.env.HOST ? process.env.HOST : 'localhost';
var uri = host + ':' + port;

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket client connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
});

client.connect('ws://' + uri + '/object/5550937980d51931b3000009/viewer', '');
