
lychee.define('sorbet.api.client.VirtualHost').includes([
	'sorbet.api.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		sorbet.api.Service.call(this, 'virtualhost', client, sorbet.api.Service.TYPE.client);

		this.bind('get', function(data) {
			this.trigger('sync', [ data instanceof Array ? data : [ data ]]);
		}, this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		sync: function() {

			if (this.tunnel !== null) {

				this.tunnel.send({}, {
					id:     this.id,
					method: 'get'
				});


				return true;

			}


			return false;

		},

		get: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (this.tunnel !== null) {

				var data = {
					identifier: identifier
				};


				this.tunnel.send(data, {
					id:     this.id,
					method: 'get'
				});


				return true;

			}


			return false;

		}

	};


	return Class;

});

