
lychee.define('game.net.client.Control').includes([
	'lychee.net.client.Session'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(client) {

		var settings = {};


		settings.autostart = false;
		settings.autolock  = true;
		settings.min       = 2;
		settings.max       = 6;
		settings.sid       = 'wait-for-init';


		lychee.net.client.Session.call(this, 'control', client, settings);


		/*
		 * INITIALIZATION
		 */

		this.bind('init', function(data) {

			this.setSid(data.sid);
			this.join();

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.net.remote.Session.prototype.serialize.call(this);
			data['constructor'] = 'app.net.client.Control';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		control: function(data) {

			if (data instanceof Object) {

				this.tunnel.send({
					tid:       data.tid,
					position:  data.position,
					action:    data.action,
					direction: data.direction
				}, {
					id:    this.id,
					event: 'control'
				});


				return true;

			}


			return false;

		}

	};


	return Class;

});

