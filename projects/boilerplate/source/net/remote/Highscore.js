
lychee.define('game.net.remote.Highscore').requires([
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

	var _on_save = function(data) {

		if (data instanceof Object) {

			var object = this.storage.create();

			object.user  = data.user;
			object.score = data.score;
			object.time  = Date.now();

			this.storage.insert(object);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		lychee.net.Service.call(this, 'highscore', remote, lychee.net.Service.TYPE.remote);


		this.storage = new lychee.Storage({
			id:    'boilerplate-highscore',
			model: _model
		});

		this.storage.bind('sync', function(objects) {

			if (this.tunnel !== null) {

				this.tunnel.send({
					objects: objects
				}, {
					id:    this.id,
					event: 'sync'
				});

				this.multicast({
					event:   'sync',
					objects: objects
				});

			}

		}, this);


		// Force new sync
		this.storage.sync();


		this.bind('save', _on_save, this);

	};


	Class.prototype = {

	};


	return Class;

});

