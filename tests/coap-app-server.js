var server = require('../servers/coap-broker'); 

var onmessage = function(payload) {
	var obj = JSON.parse(payload.data);
	var paths = payload.pathname.split('/');
	var deviceId = paths[2];

	console.log('[', deviceId, ']', payload.data);
};

var onstart = function(port, host) {
	console.log('[CoAP] server started.');
}

server.start({
	onstart: onstart,
	onmessage: onmessage
});
