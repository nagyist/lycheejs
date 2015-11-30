
lychee.define('harvester.serve.api.Server').requires([
	'lychee.data.JSON'
]).exports(function(lychee, harvester, global, attachments) {

	var _JSON = lychee.data.JSON;



	/*
	 * HELPERS
	 */

	var _HEADER = {
		'status':                      200,
		'access-control-allow-origin': '*',
		'content-control':             'no-transform',
		'content-type':                'application/json'
	};


	var _get_host = function(data) {

		var host    = null;
		var rawhost = data.headers.host || null;

		if (rawhost.match(/\[.*\]+/g)) {
			host = rawhost.match(/([0-9a-f\:]+)/g)[0];
		} else if (rawhost.indexOf(':')) {
			host = rawhost.split(':')[0];
		} else {
			host = rawhost;
		}


		return host;

	};

	var _get_remotes = function(project) {

		var remotes = [];

		var info = project.filesystem.info('/lychee.store');
		if (info !== null) {

			var database = JSON.parse(project.filesystem.read('/lychee.store'));
			if (database instanceof Object) {

				if (database['server'] instanceof Object) {

					if (database['server']['@objects'] instanceof Array) {

						remotes.push.apply(remotes, database['server']['@objects'].map(function(remote) {

							return {
								id:   remote.host + ':' + remote.port,
								mode: remote.mode,
								host: remote.host,
								port: remote.port
							};

						}));

					}

				}

			}

		}


		return remotes;

	};

	var _serialize = function(project) {

		var remotes     = _get_remotes(project);
		var server_host = null;
		var server_port = null;

		if (project.server !== null) {
			server_host = project.server.host;
			server_port = project.server.port;
		}


		return {
			identifier: project.identifier,
			host:       server_host,
			port:       server_port,
			remotes:    remotes
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
				'reference': 'harvester.serve.api.Server',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		process: function(host, url, data, ready) {

			var identifier = null;
			var parameters = data.headers.parameters;
			if (parameters instanceof Object) {
				identifier = parameters.identifier || null;
			}


			var method = data.headers.method;
			if (method === 'OPTIONS') {

				ready({
					headers: {
						'status':                       200,
						'access-control-allow-headers': 'Content-Type',
						'access-control-allow-origin':  '*',
						'access-control-allow-methods': 'GET',
						'access-control-max-age':       60 * 60
					},
					payload: ''
				});

			} else if (method === 'GET') {

				if (identifier !== null) {

					var project = host.getProject(identifier);
					if (project !== null) {

						var raw = _serialize(project);
						if (raw !== null) {
							raw.host = _get_host(data);
						}


						ready({
							headers: _HEADER,
							payload: _JSON.encode(raw)
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
						return !project.identifier.match(/projects\/cultivator/);
					}).map(_serialize);


					ready({
						headers: _HEADER,
						payload: _JSON.encode(projects)
					});

				}

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

