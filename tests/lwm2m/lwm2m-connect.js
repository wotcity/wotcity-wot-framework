var coap = require('coap');

// should send the path to the server
var sendPath = function() {
    console.log('Connecting...');

    var clientWriable = coap.request('coap://192.168.0.104:8000/llwm/0000001');

    clientWriable.end(new Buffer('{}'));
};

sendPath();
