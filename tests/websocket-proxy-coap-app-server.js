var server = require('../servers/websocket-proxy-coap');

var ondata = function(payload) {
	var obj = JSON.parse(payload.data);
	var paths = payload.pathname.split('/');
	var deviceId = paths[2];

	console.log('[', deviceId, ']', payload.data);
};

var onstart = function(payload) {
	console.log('[websocket-to-CoAP] started.');
	server.shutdown();
}

server.start({
	onstart: onstart,
	ondata: ondata
});
