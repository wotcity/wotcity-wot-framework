var coap = require('coap');

var clientWriable = coap.request({
	'hostname': '127.0.0.1',
	'port': 8000,
	'pathname': '/object/5550937980d51931b3000009/viewer',
	'observe': true
});

clientWriable.on('response', function(res) {
    res.pipe(process.stdout)
});

clientWriable.end();
