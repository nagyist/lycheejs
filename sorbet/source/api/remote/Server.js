
lychee.define('sorbet.api.remote.Server').includes([
	'sorbet.api.remote.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _serialize_project = function(project) {

		var host = null;
		var port = null;


		var server = project.server;
		if (server !== null) {
			host = server.host;
			port = server.port;
		}


		return {
			'identifier': project.id,
			'host':       host,
			'port':       port
		};

	};

	var _get_servers = function(vhost, filters) {

		var filtered = [];

		for (var pid in vhost.projects) {

			var blob = _serialize_project(vhost.projects[pid]);
			if (blob.host === null) blob.host = filters.host;

			filtered.push(blob);

		}


		filtered.sort(function(a, b) {
			if (a.identifier < b.identifier) return -1;
			if (a.identifier > b.identifier) return  1;
			return 0;
		});


		return filtered;

	};

	var _get_server = function(vhost, filters) {

		for (var pid in vhost.projects) {

			if (vhost.projects[pid].id === filters.identifier) {

				var blob = _serialize_project(vhost.projects[pid]);
				if (blob.host === null) blob.host = filters.host;
				if (blob.port !== null) {
					return blob;
				}

			}

		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id   = 'Server';
		this.main = main;


		sorbet.api.remote.Service.call(this, {
			'PATCH':   false,
			'POST':    false,
			'PUT':     false
		});



		/*
		 * INITIALIZATION
		 */

		this.bind('GET', function(vhost, filters, response) {

			filters.identifier = typeof filters.identifier === 'string' ? filters.identifier : null;


			var data = null;

			if (filters.identifier === null) {
				data = _get_servers.call(this, vhost, filters);
			} else {
				data = _get_server.call(this, vhost, filters);
			}

			if (data !== null) {
				response(true, data);
			} else {
				response(false, data);
			}

		}, this);

		this.bind('OPTIONS', function(vhost, filters, response) {

			var data = {
				identifier: 'Identifier of the Project, e.g. "boilerplate"'
			};

			response(true, data);

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

