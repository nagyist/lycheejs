
lychee.define('sorbet.api.remote.Project').includes([
	'sorbet.api.remote.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _serialize_project = function(project) {

		var root = project['root'][1];
		if (root.substr(0, 15) === './sorbet/public') {
			root = root.substr(15);
		} else if (root.substr(0, 2) === './') {
			root = root.substr(1);
		}

		var pkg = project['package'][1];
		if (pkg.substr(0, 15) === './sorbet/public') {
			pkg = pkg.substr(15);
		} else if (pkg.substr(0, 2) === './') {
			pkg = pkg.substr(1);
		}


		var server = {
			host: null,
			port: null
		};

		if (project.server !== null) {
			server.host = project.server.host;
			server.port = project.server.port;
		}


		return {
			'identifier': project.id,
			'root':       root,
			'package':    pkg,
			'sorbet':     project.sorbet,
			'server':     server,
			'builds':     project.builds
		};

	};

	var _get_projects = function(vhost, filters) {

		var filtered = [];

		for (var pid in vhost.projects) {

			var blob = _serialize_project(vhost.projects[pid]);
			if (blob.root.substr(0, 2) === '..') continue;

			filtered.push(blob);

		}


		filtered.sort(function(a, b) {
			if (a.identifier < b.identifier) return -1;
			if (a.identifier > b.identifier) return  1;
			return 0;
		});


		return filtered;

	};

	var _get_project = function(vhost, filters) {

		for (var pid in vhost.projects) {

			if (vhost.projects[pid].id === filters.identifier) {
				return _serialize_project(vhost.projects[pid]);
			}

		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id   = 'Project';
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
				data = _get_projects.call(this, vhost, filters);
			} else {
				data = _get_project.call(this, vhost, filters);
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

