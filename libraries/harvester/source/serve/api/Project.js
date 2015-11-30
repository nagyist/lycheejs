
lychee.define('harvester.serve.api.Project').requires([
	'lychee.data.JSON',
	'harvester.mod.Server'
]).exports(function(lychee, harvester, global, attachments) {

	var _JSON   = {
		encode: JSON.stringify,
		decode: JSON.parse
	};



	/*
	 * HELPERS
	 */

	var _CACHE  = {};
	var _HEADER = {
		'status':                      200,
		'access-control-allow-origin': '*',
		'content-control':             'no-transform',
		'content-type':                'application/json'
	};

	var _get_web = function(project) {

		var cache = _CACHE[project.identifier] || null;
		if (cache === null) {

			cache = _CACHE[project.identifier] = [];


			var main = global.MAIN || null;
			if (main !== null) {

				var port = main.settings.server.port;

				for (var host in main.hosts) {

					if (host === 'admin') continue;

					var entry = {
						host:       host.match(/:/) ? ('[' + host + ']:' + port) : (host + ':' + port),
						cultivator: false
					};

					var instance = main.hosts[host];
					if (instance.cultivator === true) {
						entry.cultivator = true;
					}


					cache.push(entry);

				}

			}

		}


		return cache;

	};

	var _serialize = function(project) {

		var filesystem = null;
		var server     = null;


		if (project.filesystem !== null) {

			filesystem = project.filesystem.root;

		}


		if (project.server !== null) {

			server = {
				host: project.server.host,
				port: project.server.port
			};

		}


		return {
			identifier: project.identifier,
			details:    project.details || null,
			filesystem: filesystem,
			server:     server,
			web:        _get_web(project),
			harvester:  project.harvester
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			return {
				'reference': 'harvester.serve.api.Project',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		process: function(host, url, data, ready) {

			var method     = data.headers.method;
			var parameters = data.headers.parameters;
			var action     = null;
			var identifier = null;
			var project    = null;


			if (parameters instanceof Object) {
				action     = parameters.action     || null;
				identifier = parameters.identifier || null;
			}



			/*
			 * 1: OPTIONS
			 */

			if (method === 'OPTIONS') {

				ready({
					headers: {
						'status':                       200,
						'access-control-allow-headers': 'Content-Type',
						'access-control-allow-origin':  '*',
						'access-control-allow-methods': 'GET, PUT',
						'access-control-max-age':       60 * 60
					},
					payload: ''
				});



			/*
			 * 2: GET
			 */

			} else if (method === 'GET') {

				if (identifier !== null) {

					project = host.getProject(identifier);

					if (project !== null) {

						ready({
							headers: _HEADER,
							payload: _JSON.encode(_serialize(project))
						});

					} else {

						ready({
							headers: { 'status': 404, 'content-type': 'application/json' },
							payload: _JSON.encode({
								error: 'Project not found.'
							})
						});

					}

				} else {

					var projects = host.projects.filter(function(project) {
						return !project.identifier.match(/cultivator/);
					}).map(_serialize);

					ready({
						headers: _HEADER,
						payload: _JSON.encode(projects)
					});

				}



			/*
			 * 3: PUT
			 */

			} else if (method === 'PUT') {

				if (identifier === 'harvester') {

					ready({
						headers: { 'status': 501, 'content-type': 'application/json' },
						payload: _JSON.encode({
							error: 'Action not implemented.'
						})
					});

				} else if (identifier !== null) {

					project = host.getProject(identifier);

					if (project !== null) {

						var server = project.server;
						if (server === null && action === 'start') {

							harvester.mod.Server.process(project);

							ready({
								headers: _HEADER,
								payload: ''
							});

						} else if (server !== null && action === 'stop') {

							project.server.destroy();
							project.server = null;

							ready({
								headers: _HEADER,
								payload: ''
							});

						} else {

							ready({
								headers: { 'status': 405, 'content-type': 'application/json' },
								payload: _JSON.encode({
									error: 'Action not allowed.'
								})
							});

						}

					} else {

						ready({
							headers: { 'status': 404, 'content-type': 'application/json' },
							payload: _JSON.encode({
								error: 'Project not found.'
							})
						});

					}


				} else {

					ready({
						headers: { 'status': 501, 'content-type': 'application/json' },
						payload: _JSON.encode({
							error: 'Action not implemented.'
						})
					});

				}



			/*
			 * X: OTHER
			 */

			} else {

				ready({
					headers: { 'status': 405, 'content-type': 'application/json' },
					payload: _JSON.encode({
						error: 'Method not allowed.'
					})
				});

			}

		}

	};


	return Module;

});

