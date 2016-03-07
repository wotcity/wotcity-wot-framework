var coap = require('coap');

var sendPath = function() {
    console.log('Connecting...');

    var clientWriable = coap.request('coap://localhost:8000/object/55548dd35200c3917f000159/send');

    clientWriable.end(new Buffer('i am tester'));
};

sendPath();
