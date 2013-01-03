
lychee.define('lychee.net.Remote').tags({
	platform: 'nodejs'
}).requires([
	'lychee.net.Protocol'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var _protocol = lychee.net.Protocol;

	var Class = function(server, socket, maxFrameSize, encoder, decoder) {

		encoder = encoder instanceof Function ? encoder : function(msg) { return msg; };
		decoder = decoder instanceof Function ? decoder : function(msg) { return msg; };


		this.id      = socket.remoteAddress + ':' + socket.remotePort;
		this.version = _protocol.VERSION;

		this.__server    = server;
		this.__socket    = socket;
		this.__encoder   = encoder;
		this.__decoder   = decoder;
		this.__isWaiting = true;


		lychee.event.Emitter.call(this, 'remote');

		settings = null;


		var that = this;

		this.__protocol = new _protocol(socket, maxFrameSize, function(closedByRemote) {

			that.__socket.end();
			that.__socket.destroy();
			that.__server.disconnect(that);

		});

		this.__socket.on('data', function(data) {
			that.__protocol.read(data, that.__onReceive, that);
		});

		this.__socket.on('error', function(err) {
			that.__protocol.close();
		});

		this.__socket.on('end', function() {
			that.__protocol.close(true);
		});

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */

		__onReceive: function(message, isBinary) {


			var data = null;
			try {
				data = this.__decoder(message);
			} catch(e) {
				return false;
			}


			this.trigger('receive', [ data ]);

			return true;

		},

		isWaiting: function() {
			return this.__isWaiting === true;
		},

		accept: function() {

			if (this.__isWaiting === true) {

				this.__server.connect(this);
				this.__isWaiting = false;

				return true;

			}


			return false;

		},

		reject: function(reason) {

			if (this.__isWaiting === true) {

				this.__protocol.close(false, reason);
				this.__isWaiting = false;

				return true;

			}


			return false;

		},

		send: function(message) {

			var data = this.__encoder(message);
			this.__protocol.write(data);

		},

		disconnect: function(reason) {

			if (this.__protocol.isConnected() === true) {
				return this.__protocol.close(false, reason);
			}


			return false;

		}

	};


	return Class;

});

