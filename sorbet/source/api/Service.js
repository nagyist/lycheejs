
lychee.define('sorbet.api.Service').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _services = {};

	var _validate_tunnel = function(tunnel, type) {

		if (type === null) return false;


		if (type === Class.TYPE.client) {
			return lychee.interfaceof(sorbet.api.Client, tunnel);
		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id, tunnel, type) {

		id     = typeof id === 'string'          ? id     : null;
		type   = lychee.enumof(Class.TYPE, type) ? type   : null;
		tunnel = _validate_tunnel(tunnel, type)  ? tunnel : null;


		this.id     = id;
		this.tunnel = tunnel;
		this.type   = type;


		if (lychee.debug === true) {

			if (this.id === null) {
				console.error('sorbet.api.Service: Invalid (string) id. It has to be kept in sync with the sorbet.api.Client and server-side sorbet.api.<id> instance.');
			}

			if (this.tunnel === null) {
				console.error('sorbet.api.Service: Invalid (sorbet.api.Client) tunnel.');
			}

			if (this.type === null) {
				console.error('sorbet.api.Service: Invalid (sorbet.api.Service.TYPE) type.');
			}

		}


		lychee.event.Emitter.call(this);

	};


	Class.TYPE = {
		// 'default': 0, (deactivated)
		'client': 1
		// 'remote': 2
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.tunnel instanceof Object) {
				this.tunnel = lychee.deserialize(blob.tunnel);
			}

		},

		serialize: function() {

			var id     = null;
			var tunnel = null;
			var type   = null;

			var blob = {};


			if (this.id !== null)     id = this.id;
			if (this.tunnel !== null) blob.tunnel = lychee.serialize(this.tunnel);
			if (this.type !== null)   type = this.type;


			return {
				'constructor': 'sorbet.api.Service',
				'arguments':   [ id, tunnel, type ],
				'blob':        blob
			};

		},



		/*
		 * SERVICE API
		 */

		multicast: function(data, service) {
			return false;
		},

		broadcast: function(data, service) {
			return false;
		},

		report: function(message, blob) {
			return false;
		},

		setMulticast: function(multicast) {
			return false;
		}

	};


	return Class;

});

