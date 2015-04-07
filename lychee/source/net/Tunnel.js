
lychee.define('lychee.net.Tunnel').requires([
	'lychee.data.BENCODE',
	'lychee.data.BitON',
	'lychee.data.JSON',
	'lychee.net.Service'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	var _BitON = lychee.data.BitON;
	var _JSON  = lychee.data.JSON;



	/*
	 * HELPERS
	 */

	var _plug_service = function(id, service) {

		id = typeof id === 'string' ? id : null;

		if (id === null || service === null) {
			return;
		}


		var found = false;

		for (var w = 0, wl = this.__services.waiting.length; w < wl; w++) {

			if (this.__services.waiting[w] === service) {
				this.__services.waiting.splice(w, 1);
				found = true;
				wl--;
				w--;
			}

		}


		if (found === true) {

			this.__services.active.push(service);

			service.trigger('plug', []);

			if (lychee.debug === true) {
				console.log('lychee.net.Tunnel: Remote plugged in Service (' + id + ')');
			}

		}

	};

	var _unplug_service = function(id, service) {

		id = typeof id === 'string' ? id : null;

		if (id === null || service === null) {
			return;
		}


		var found = false;

		for (var w = 0, wl = this.__services.waiting.length; w < wl; w++) {

			if (this.__services.waiting[w] === service) {
				this.__services.waiting.splice(w, 1);
				found = true;
				wl--;
				w--;
			}

		}

		for (var a = 0, al = this.__services.active.length; a < al; a++) {

			if (this.__services.active[a] === service) {
				this.__services.active.splice(a, 1);
				found = true;
				al--;
				a--;
			}

		}


		if (found === true) {

			service.trigger('unplug', []);

			if (lychee.debug === true) {
				console.log('lychee.net.Tunnel: Remote unplugged Service (' + id + ')');
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.codec     = lychee.interfaceof(_JSON, settings.codec) ? settings.codec : _JSON;
		this.port      = 1337;
		this.host      = 'localhost';
		this.binary    = false;
		this.reconnect = 0;


		this.__services  = {
			waiting: [],
			active:  []
		};


		this.setHost(settings.host);
		this.setPort(settings.port);
		this.setBinary(settings.binary);
		this.setReconnect(settings.reconnect);


		lychee.event.Emitter.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('disconnect', function() {

			for (var a = 0, al = this.__services.active.length; a < al; a++) {
				this.__services.active[a].trigger('unplug', []);
			}

			this.__services.active  = [];
			this.__services.waiting = [];


			if (this.reconnect > 0) {

				var that = this;

				setTimeout(function() {
					that.trigger('connect', []);
				}, this.reconnect);

			}

		}, this);

	};


	Class.STATUS = {
		1000: 'Normal Closure',
		1001: 'Going Away',
		1002: 'Protocol Error',
		1003: 'Unsupported Data',
		1005: 'No Status Received',
		1006: 'Abnormal Closure',
		1008: 'Policy Violation',
		1009: 'Message Too Big',
		1011: 'Internal Error',
		1012: 'Service Restart',
		1013: 'Try Again Later'
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.services instanceof Array) {

				for (var s = 0, sl = blob.services.length; s < sl; s++) {
					this.addService(lychee.deserialize(blob.services[s]));
				}

			}

		},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Tunnel';

			var settings = {};
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.codec !== _JSON)      settings.codec     = lychee.serialize(this.codec);
			if (this.host !== 'localhost') settings.host      = this.host;
			if (this.port !== 1337)        settings.port      = this.port;
			if (this.binary !== false)     settings.binary    = this.binary;
			if (this.reconnect !== 0)      settings.reconnect = this.reconnect;


			if (this.__services.active.length > 0) {

				blob.services = [];

				for (var a = 0, al = this.__services.active.length; a < al; a++) {

					var service = this.__services.active[a];

					blob.services.push(lychee.serialize(service));

				}

			}


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		send: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			if (data === null) {
				return false;
			}


			if (service !== null) {

				if (typeof service.id     === 'string') data._serviceId     = service.id;
				if (typeof service.event  === 'string') data._serviceEvent  = service.event;
				if (typeof service.method === 'string') data._serviceMethod = service.method;

			}


			var blob = this.codec.encode(data);
			if (blob !== null) {

				if (this.binary === true) {

					var bl    = blob.length;
					var bytes = new Uint8Array(bl);

					for (var b = 0; b < bl; b++) {
						bytes[b] = blob.charCodeAt(b);
					}

					blob = bytes.buffer;

				}


				this.trigger('send', [ blob, this.binary ]);

				return true;

			}


			return false;

		},

		receive: function(blob) {

			if (this.binary === true) {

				var bytes = new Uint8Array(blob);
				blob = String.fromCharCode.apply(null, bytes);

			}


			var data = this.codec.decode(blob);
			if (data instanceof Object && typeof data._serviceId === 'string') {

				var service = this.getService(data._serviceId);
				var event   = data._serviceEvent  || null;
				var method  = data._serviceMethod || null;


				if (method !== null) {

					if (method.charAt(0) === '@') {

						if (method === '@plug') {
							_plug_service.call(this,   data._serviceId, service);
						} else if (method === '@unplug') {
							_unplug_service.call(this, data._serviceId, service);
						}

					} else if (service !== null && typeof service[method] === 'function') {

						// Remove data frame service header
						delete data._serviceId;
						delete data._serviceMethod;

						service[method](data);

					}

				} else if (event !== null) {

					if (service !== null && typeof service.trigger === 'function') {

						// Remove data frame service header
						delete data._serviceId;
						delete data._serviceEvent;

						service.trigger(event, [ data ]);

					}

				}

			} else {

				this.trigger('receive', [ data ]);

			}


			return true;

		},

		setBinary: function(binary) {

			if (binary === true || binary === false) {

				this.binary = binary;

				return true;

			}


			return false;

		},

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

		},

		setReconnect: function(reconnect) {

			reconnect = typeof reconnect === 'number' ? (reconnect | 0) : null;


			if (reconnect !== null) {

				this.reconnect = reconnect;

				return true;

			}


			return false;

		},

		addService: function(service) {

			service = lychee.interfaceof(lychee.net.Service, service) ? service : null;


			if (service !== null) {

				var found = false;

				for (var w = 0, wl = this.__services.waiting.length; w < wl; w++) {

					if (this.__services.waiting[w] === service) {
						found = true;
						break;
					}

				}

				for (var a = 0, al = this.__services.active.length; a < al; a++) {

					if (this.__services.active[a] === service) {
						found = true;
						break;
					}

				}


				if (found === false) {

					this.__services.waiting.push(service);

					this.send({}, {
						id:     service.id,
						method: '@plug'
					});

				}


				return true;

			}


			return false;

		},

		getService: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				for (var w = 0, wl = this.__services.waiting.length; w < wl; w++) {

					var wservice = this.__services.waiting[w];
					if (wservice.id === id) {
						return wservice;
					}

				}

				for (var a = 0, al = this.__services.active.length; a < al; a++) {

					var aservice = this.__services.active[a];
					if (aservice.id === id) {
						return aservice;
					}

				}

			}


			return null;

		},

		removeService: function(service) {

			service = lychee.interfaceof(lychee.net.Service, service) ? service : null;


			if (service !== null) {

				var found = false;

				for (var w = 0, wl = this.__services.waiting.length; w < wl; w++) {

					if (this.__services.waiting[w] === service) {
						found = true;
						break;
					}

				}

				for (var a = 0, al = this.__services.active.length; a < al; a++) {

					if (this.__services.active[a] === service) {
						found = true;
						break;
					}

				}


				if (found === true) {

					this.send({}, {
						id:     service.id,
						method: '@unplug'
					});

				}


				return true;

			}


			return false;

		}

	};


	return Class;

});

