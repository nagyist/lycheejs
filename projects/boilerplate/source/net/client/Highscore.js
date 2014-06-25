
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
			this.storage.update(o, objects[o]);
		}

	};

	var _on_multicast = function(data) {

		var event = data.event;
		if (event === 'sync') {

			_on_sync.call(this, data);

		} else if (event === 'insert') {

			this.storage.insert(data.object);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		lychee.net.Service.call(this, 'highscore', client, lychee.net.Service.TYPE.client);


		this.storage = new lychee.Storage({
			id:    'boilerplate-highscore',
			model: _model
		});


		this.bind('sync',      _on_sync,      this);
		this.bind('multicast', _on_multicast, this);


window._SERVICE = this;

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		save: function(user, score) {

			if (this.tunnel !== null) {

				var data   = this.storage.create();
				data.user  = user;
				data.score = score;


				this.tunnel.send(data, {
					id:    this.id,
					event: 'save'
				});

				this.storage.insert(data);


				return true;

			}


			return false;

		}

	};


	return Class;

});

