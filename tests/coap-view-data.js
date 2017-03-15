var coap = require('coap');

var port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
var host = process.env.HOST ? process.env.HOST : 'localhost';

var clientWriable = coap.request({
	'hostname': host,
	'port': port,
	'pathname': '/object/5550937980d51931b3000009/viewer',
	'observe': true
});

clientWriable.on('response', function(res) {
    res.pipe(process.stdout)
});

clientWriable.end();
