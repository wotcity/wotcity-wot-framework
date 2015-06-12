var coap = require('coap');

var clientWriable = coap.request('coap://localhost:8000/object/testman/viewer');

clientWriable.on('response', function(res) {
    res.pipe(process.stdout)
});

clientWriable.end();