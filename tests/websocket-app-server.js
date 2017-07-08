var server = require('../servers/websocket-broker');

var onmessage = function(payload) {
	var obj = JSON.parse(payload.data);
	var paths = payload.pathname.split('/');
	var deviceId = paths[2];

	console.log('[', deviceId, ']', payload.data);
};

server.start({
	onmessage: onmessage
});
