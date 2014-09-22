
lychee.define('sorbet.module.Blacklist').requires([
	'lychee.Storage'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _is_blocked = function(blocked, value) {

		var found = false;

		for (var b = 0, bl = blocked.length; b < bl; b++) {

			if (blocked[b] === value) {
				found = true;
				break;
			}

		}

		return found;

	};

	var _validate_remote = function(remote) {

		var classes = remote.split('.');

		if (classes[0] === '127') {
			return false;
		}

		if (classes[0] === '10') {
			return false;
		}

		if (classes[0] === '192' && classes[1] === '168') {
			return false;
		}

		if (classes[0] === '172' && (classes[1] >= '16' && classes[1] <= '31')) {
			return false;
		}


		return true;

	};



	/*
	 * IMPLEMENTATION
	 */

	var _model = {
		host:    'dashboard.lycheejs.org',
		blocked: {
			urls:       [],
			remotes:    [],
			useragents: []
		},
		database: []
	};

	var Class = function(main) {

		this.id      = 'Blacklist';
		this.main    = main || null;

		this.storage = new lychee.Storage({
			id:    'sorbet-blacklist',
			model: _model,
			type:  lychee.Storage.TYPE.persistent
		});

	};


	Class.prototype = {

		/*
		 * MODULE API
		 */

		process: function(vhost, response, data) {

			var remote = data.remote || null;
			if (remote !== null) {

				if (_validate_remote(remote) === true) {

					var object = this.storage.filter(function(index, object) {
						return object.host === data.host;
					}, this)[0] || null;

					if (object !== null) {

						var isurl       = _is_blocked(object.blocked.urls,       data.url);
						var isremote    = _is_blocked(object.blocked.remotes,    data.remote);
						var isuseragent = _is_blocked(object.blocked.useragents, data.useragent);

						if (isurl || isremote || isuseragent) {

							this.main.modules.get('Error').process(vhost, response, {
								status: 418,
								host:   data.host,
								url:    data.url
							});

							return true;

						}

					}

				}

			}


			return false;

		},



		/*
		 * CUSTOM API
		 */

		report: function(vhost, data) {

			var remote = data.remote || null;

			if (remote !== null) {

				if (_validate_remote(remote) === true) {

					var object = this.storage.filter(function(index, object) {
						return object.host === data.host;
					}, this)[0] || null;


					var entry = {
						url:       data.url     || null,
						referer:   data.referer || null,
						remote:    data.remote  || null,
						useragent: data.useragent || null,
						time:      Date.now()
					};

					if (object !== null) {

						object.database.push(entry);

						this.storage.update(object);

					} else {

						object          = this.storage.create();
						object.host     = data.host;
						object.database = []; // unlink from model
						object.database.push(entry);

						this.storage.insert(object);

					}


					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

