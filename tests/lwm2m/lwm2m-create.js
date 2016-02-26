var coap = require('coap');

// should send the path to the server
var sendPath = function() {
    console.log('Connecting...');

    var clientWriable = coap.request('coap://172.20.10.3:8000/75001/1/create');

    clientWriable.end(new Buffer('{}'));
};

sendPath();
