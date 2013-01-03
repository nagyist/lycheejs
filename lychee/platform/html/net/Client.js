
lychee.define('lychee.net.Client').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		typeof WebSocket !== 'undefined'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {


	var Class = function(encoder, decoder) {

		encoder = encoder instanceof Function ? encoder : function(msg) { return msg; };
		decoder = decoder instanceof Function ? decoder : function(msg) { return msg; };


		this.__encoder = encoder;
		this.__decoder = decoder;
		this.__socket  = null;

		this.__isBinary  = false;
		this.__isRunning = false;


		lychee.event.Emitter.call(this, 'client');

	};


	Class.prototype = {

		listen: function(port, hostname) {

			if (this.__isRunning === true) {
				return false;
			}


			if (lychee.debug === true) {
				console.log('lychee.net.Client: Listening on ' + hostname + ':' + port);
			}


			var url = 'ws://' + hostname + ':' + port;

			this.__socket = new WebSocket(url);

			if (
				typeof ArrayBuffer !== 'undefined'
				&& typeof this.__socket.binaryType !== 'undefined'
			) {
				this.__socket.binaryType = 'arraybuffer';
				this.__isBinary = true;
			}


			var that = this;

			this.__socket.onopen = function() {

				that.__isRunning = true;
				that.trigger('connect', [ that ]);

			};

			this.__socket.onmessage = function(message) {

				var data = message.data;

				if (
					that.__isBinary === true
					&& message.data instanceof ArrayBuffer
				) {

					var bytes = new Uint8Array(message.data);
					data = String.fromCharCode.apply(null, bytes);

				}


				that.trigger('receive', [ that.__decoder(data) ]);

			};

			this.__socket.onclose = function(message) {

				that.__isRunning = false;
				that.trigger('disconnect', [ that, message.code, message.reason ]);

			};


			return true;

		},

		send: function(message) {

			if (this.__isRunning === true) {

				var data = this.__encoder(message);
				if (this.__isBinary === true) {

					var bl    = data.length;
					var bytes = new Uint8Array(bl);

					for (var b = 0; b < bl; b++) {
						bytes[b] = data.charCodeAt(b);
					}

					data = bytes.buffer;

				}


				this.__socket.send(data);

				return true;

			}


			return false;

		},

		disconnect: function() {

			if (this.__isRunning === true) {

				this.__socket.close();

				return true;

			}


			return false;

		}

	};


	return Class;

});

