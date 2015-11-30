
lychee.define('lychee.net.Server').tags({
	platform: 'node'
}).requires([
	'lychee.Storage',
	'lychee.crypto.SHA1',
	'lychee.data.JSON',
	'lychee.net.Remote'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof process !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, global, attachments) {

	var http  = require('http');
	var _JSON = lychee.data.JSON;
	var _SHA1 = lychee.crypto.SHA1;



	/*
	 * HELPERS
	 */

	var _get_websocket_handshake = function(request) {

		var origin   = request.headers.origin || null;
		var host     = request.headers.host   || null;
		var nonce    = request.headers['sec-websocket-key'] || null;

		if (origin !== null && nonce !== null) {

			var handshake = '';
			var accept    = (function(nonce) {

				var sha1 = new lychee.crypto.SHA1();
				sha1.update(nonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
				return sha1.digest().toString('base64');

			})(nonce);


			// HEAD

			handshake += 'HTTP/1.1 101 WebSocket Protocol Handshake\r\n';
			handshake += 'Upgrade: WebSocket\r\n';
			handshake += 'Connection: Upgrade\r\n';

			handshake += 'Sec-WebSocket-Version: '  + '13'       + '\r\n';
			handshake += 'Sec-WebSocket-Origin: '   + origin     + '\r\n';
			handshake += 'Sec-WebSocket-Protocol: ' + 'lycheejs' + '\r\n';
			handshake += 'Sec-WebSocket-Accept: '   + accept     + '\r\n';


			// BODY
			handshake += '\r\n';


			return handshake;

		}


		return null;

	};

	var _upgrade_to_websocket = function(request, socket, head) {

		var connection = (request.headers.connection || '').toLowerCase();
		var upgrade    = (request.headers.upgrade    || '').toLowerCase();
		var protocol   = (request.headers['sec-websocket-protocol'] || '').toLowerCase();

		if (connection.indexOf('upgrade') !== -1 && upgrade.indexOf('websocket') !== -1 && protocol === 'lycheejs') {

			var handshake = _get_websocket_handshake(request);
			if (handshake !== null) {

				socket.write(handshake, 'ascii');
				socket.setTimeout(0);
				socket.setNoDelay(true);
				socket.setKeepAlive(true, 0);
				socket.removeAllListeners('timeout');

				return true;

			}

		}


		socket.end();
		socket.destroy();

		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var _storage = new lychee.Storage({
		id:    'server',
		type:  lychee.Storage.TYPE.persistent,
		model: {
			id:   '::ffff:1337',
			host: '::ffff',
			port: 1337
		}
	});


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.codec = lychee.interfaceof(settings.codec, _JSON) ? settings.codec : _JSON;
		this.host  = null;
		this.port  = 1337;


		this.__socket = null;


		this.setHost(settings.host);
		this.setPort(settings.port);


		lychee.event.Emitter.call(this);

		settings = null;


		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			var id  = remote.host + ':' + remote.port;
			var obj = _storage.create();
			if (obj !== null) {

				obj.id   = id;
				obj.host = remote.host;
				obj.port = remote.port;

				_storage.write(id, obj);

			}

		}, this);

		this.bind('disconnect', function(remote) {

			var id  = remote.host + ':' + remote.port;
			var obj = _storage.read(id);
			if (obj !== null) {
				_storage.remove(id);
			}

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Server';

			var settings = {};


			if (this.codec !== _JSON)      settings.codec = lychee.serialize(this.codec);
			if (this.host !== 'localhost') settings.host  = this.host;
			if (this.port !== 1337)        settings.port  = this.port;


			data['arguments'][0] = settings;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function() {

			if (this.__socket === null) {

				if (lychee.debug === true) {
					console.log('lychee.net.Server: Connected to ' + this.host + ':' + this.port);
				}


				var that = this;


				this.__socket = new http.Server();

				this.__socket.on('upgrade', function(request, socket, headers) {

					if (_upgrade_to_websocket.call(that, request, socket, headers) === true) {

						var host = socket.remoteAddress || socket.server._connectionKey.split(':')[1];
						var port = socket.remotePort    || socket.server._connectionKey.split(':')[2];


						var remote = new lychee.net.Remote({
							host:  host,
							port:  port,
							codec: that.codec
						});

						remote.bind('connect', function() {
							that.trigger('connect', [ this ]);
						}, remote);

						remote.bind('disconnect', function() {
							that.trigger('disconnect', [ this ]);
						}, remote);

						remote.connect(socket);
						remote.trigger('connect');

					}

				});

				this.__socket.on('error', function(err) {
					console.error('lychee.net.Server: Error "' + err + '" on ' + that.host + ':' + that.port);
				});

				this.__socket.on('close', function() {
					that.__socket = null;
				});

				this.__socket.listen(this.port, this.host);


				return true;

			}


			return false;

		},

		disconnect: function() {

			if (this.__socket !== null) {
				this.__socket.close();
			}


			return true;

		},



		/*
		 * TUNNEL API
		 */

		setHost: function(host) {

			host = typeof host === 'string' ? host : null;


			if (host !== null) {

				this.host = host;

				return true;

			}


			return false;

		},

		setPort: function(port) {

			port = typeof port === 'number' ? (port | 0) : null;


			if (port !== null) {

				this.port = port;

				return true;

			}


			return false;

		}

	};


	return Class;

});

