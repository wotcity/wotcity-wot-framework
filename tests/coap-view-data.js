var coap = require('coap');

var clientWriable = coap.request('coap://127.0.0.1:8000/object/5550937980d51931b3000009/viewer');

clientWriable.on('response', function(res) {
    res.pipe(process.stdout)
});

clientWriable.end();
