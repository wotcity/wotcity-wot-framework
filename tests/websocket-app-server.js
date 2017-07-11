var server = require('../servers/websocket-broker');

var ondata = function(payload) {
	var obj = JSON.parse(payload.data);
	var paths = payload.pathname.split('/');
	var deviceId = paths[2];

	console.log('[', deviceId, ']', payload.data);
};

var onstart = function(payload) {
}

server.start({
	onstart: onstart,
	ondata: ondata
});
