
lychee.define('sorbet.api.remote.Blacklist').includes([
	'sorbet.api.remote.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _serialize_blacklist = function(blacklist) {

		return {
			'identifier': blacklist.host,
			'blocked':    blacklist.blocked,
			'database':   blacklist.database
		};

	};

	var _get_blacklists = function(filters) {

		var blacklists = this.storage.filter();


		var filtered = [];

		for (var b = 0, bl = blacklists.length; b < bl; b++) {
			filtered.push(_serialize_blacklist(blacklists[b]));
		}

		filtered.sort(function(a, b) {
			if (a.identifier < b.identifier) return -1;
			if (a.identifier > b.identifier) return  1;
			return 0;
		});


		return filtered;

	};

	var _get_blacklist = function(filters) {

		var blacklist = this.storage.filter(function(index, object) {
			return object.host === filters.identifier;
		})[0] || null;


		if (blacklist !== null) {
			return _serialize_blacklist(blacklist);
		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id      = 'Project';
		this.main    = main;

		this.storage = new lychee.Storage({
			id:    'sorbet-blacklist',
			type:  lychee.Storage.TYPE.persistent
		});


		sorbet.api.remote.Service.call(this, {
			'PATCH': false,
			'POST':  false,
			'PUT':   false
		});



		/*
		 * INITIALIZATION
		 */

		this.bind('GET', function(vhost, filters, response) {

			filters.identifier = typeof filters.identifier === 'string' ? filters.identifier : null;


			this.storage.sync();


			var data = null;

			if (filters.identifier === null) {
				data = _get_blacklists.call(this, filters);
			} else {
				data = _get_blacklist.call(this, filters);
			}

			if (data !== null) {
				response(true, data);
			} else {
				response(false, data);
			}

		}, this);

		this.bind('POST', function(vhost, data, response) {

		}, this);

		this.bind('OPTIONS', function(vhost, filters, response) {

			var data = {
				identifier: 'Domain of the VirtualHost, e.g. "cosmo.lycheejs.org"'
			};

			response(true, data);

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

