
lychee.define('lychee.net.Server').tags({
	platform: 'html'
}).requires([
	'lychee.Storage',
	'lychee.data.JSON',
	'lychee.net.Remote'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	var _JSON = lychee.data.JSON;



	/*
	 * HELPERS
	 */

	// TODO: WebSocket Upgrade
	// TODO: WebSocket Handshake



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
		this.host  = 'localhost';
		this.port  = 1337;


		this.__socket = null;


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

