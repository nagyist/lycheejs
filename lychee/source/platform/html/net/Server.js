
lychee.define('lychee.net.Server').tags({
	platform: 'html'
}).requires([
	'lychee.data.BitON',
	'lychee.data.JSON',
	'lychee.net.Remote'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var _BitON  = lychee.data.BitON;
	var _JSON   = lychee.data.JSON;



	/*
	 * HELPERS
	 */

	// TODO: WebSocket Upgrade
	// TODO: WebSocket Handshake



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.host = 'localhost';
		this.port = 1337;


		this.__codec  = lychee.interfaceof(settings.codec, _JSON) ? settings.codec : _JSON;
		this.__socket = null;


		lychee.event.Emitter.call(this);

		settings = null;

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


			if (this.host !== 'localhost') settings.host = this.host;
			if (this.port !== 1337)        settings.port = this.port;


			data['arguments'][0] = settings;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function() {

			if (this.__socket === null) {

				if (lychee.debug === true) {
//					console.log('lychee.net.Server: Connected to ' + this.host + ':' + this.port);
				}


				var that = this;


				// TODO: Setup HTTP Server


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

