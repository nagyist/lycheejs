
lychee.define('game.net.client.Highscore').requires([
	'lychee.Storage'
]).includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _model = {
		user:  'John Doe',
		score: 1337,
		time:  Date.now()
	};

	var _on_sync = function(data) {

		var objects = data.objects;

		for (var o = 0, ol = objects.length; o < ol; o++) {

			var update = objects[o];
			var stored = this.storage.get(o);
			if (stored === null) {

				stored = this.storage.create();

				stored.user  = update.user;
				stored.time  = update.time;
				stored.score = update.score;

				this.storage.insert(stored);

			} else {

				stored.user  = update.user;
				stored.time  = update.time;
				stored.score = update.score;

				this.storage.update(stored);

			}

		}

	};

	var _on_multicast = function(data) {

		var event = data.event;
		if (event === 'sync') {
			_on_sync.call(this, data);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		lychee.net.Service.call(this, 'highscore', client, lychee.net.Service.TYPE.client);


		this.storage = new lychee.Storage({
			id:    'boilerplate-highscore',
			type:  lychee.Storage.TYPE.temporary,
			model: _model
		});


		this.bind('sync',      _on_sync,      this);
		this.bind('multicast', _on_multicast, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.net.Service.prototype.serialize.call(this);
			data['constructor'] = 'game.net.client.Highscore';
			data['arguments']   = [ '#MAIN.client' ];


			return data;

		},



		/*
		 * CUSTOM API
		 */

		save: function(user, score) {

			if (this.tunnel !== null) {

				var data   = this.storage.create();

				data.user  = user;
				data.score = score;
				data.time  = Date.now();


				this.tunnel.send(lychee.extend({}, data), {
					id:    this.id,
					event: 'save'
				});


				return true;

			}


			return false;

		}

	};


	return Class;

});

