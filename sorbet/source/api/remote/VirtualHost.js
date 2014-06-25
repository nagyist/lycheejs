
lychee.define('sorbet.api.remote.VirtualHost').includes([
	'sorbet.api.remote.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _serialize_virtualhost = function(vhost) {

		var data = lychee.serialize(vhost);
		if (data !== null) {

			var port     = this.main.port;
			var settings = data['arguments'][0];


			settings.identifier = settings.id;
			settings.urls       = [
				'http://' + settings.id + (port !== null ? (':' + port) : '')
			];


			if (settings.aliases instanceof Array) {

				for (var a = 0, al = settings.aliases.length; a < al; a++) {

					var alias = settings.aliases[a];
					var url   = 'http://' + alias + (port !== null ? (':' + port) : '');
					settings.urls.push(url);

				}

			} else {
				settings.aliases = [];
			}


			delete settings.id;


			return settings;

		}


		return null;

	};

	var _get_virtualhosts = function(filters) {

		var vhosts = this.main.vhosts.ids();


		var done     = [];
		var filtered = [];

		for (var v = 0, vl = vhosts.length; v < vl; v++) {

			var vhost = this.main.vhosts.get(vhosts[v]);
			if (vhost !== null) {

				var blob = _serialize_virtualhost.call(this, vhost);
				if (blob.root.substr(0, 2) === '..') continue;

				if (done.indexOf(blob.identifier) === -1) {
					filtered.push(blob);
					done.push(blob.identifier);
				}

			}

		}


		return filtered;

	};

	var _get_virtualhost = function(filters) {

		var found = null;


		if (filters.identifier !== null) {

			var vhost = this.main.vhosts.get(filters.identifier);
			if (vhost !== null) {

				var blob = _serialize_virtualhost.call(this, vhost);
				if (blob.root.substr(0, 2) !== '..') {
					found = blob;
				}

			}

		}


		return found;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id   = 'VirtualHost';
		this.main = main;


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


			var data = null;

			if (filters.identifier === null) {
				data = _get_virtualhosts.call(this, filters);
			} else {
				data = _get_virtualhost.call(this, filters);
			}

			if (data !== null) {
				response(true, data);
			} else {
				response(false, data);
			}

		}, this);

		this.bind('OPTIONS', function(vhost, filters, response) {

			var data = {
				identifier: 'Identifier of the VirtualHost, e.g. "cosmo.lycheejs.org"'
			};

			response(true, data);

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

