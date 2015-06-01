
lychee.define('sorbet.serve.api.Server').requires([
	'lychee.data.JSON'
]).exports(function(lychee, sorbet, global, attachments) {

	var _JSON = lychee.data.JSON;



	/*
	 * HELPERS
	 */

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

		process: function(host, url, data, ready) {

			var identifier = null;
			var parameters = data.headers.parameters;
			if (parameters instanceof Object) {
				identifier = parameters.identifier || null;
			}


			var method = data.headers.method;
			if (method === 'OPTIONS') {

				ready({
					status:  200,
					headers: {
						'Access-Control-Allow-Headers': 'Content-Type',
						'Access-Control-Allow-Origin':  data.headers.host,
						'Access-Control-Allow-Methods': 'GET',
						'Access-Control-Max-Age':       60 * 60
					},
					payload: ''
				});

			} else if (method === 'GET') {

				if (identifier !== null) {

					var project = host.getProject(identifier);
					if (project !== null) {

						var raw = _serialize(project);
						if (raw !== null) {

							var rawhost = (data.headers.host || '');
							if (rawhost.match(/\[.*\]+/g)) {
								rawhost = rawhost.match(/([0-9a-f\:]+)/g)[0];
							} else if (rawhost.indexOf(':')) {
								rawhost = rawhost.split(':')[0];
							}

						}


						ready({
							status: 200,
							headers: {
								'Content-Control': 'no-transform',
								'Content-Type':    'application/json'
							},
							payload: _JSON.encode(raw)
						});

					} else {

						ready({
							status:  404,
							headers: { 'Content-Type': 'application/json' },
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
						status:  200,
						headers: { 'Content-Type': 'application/json' },
						payload: _JSON.encode(projects)
					});

				}

			} else {

				ready({
					status:  405,
					headers: { 'Content-Type': 'application/json' },
					payload: _JSON.encode({
						error: 'Method not allowed.'
					})
				});

			}

		}

	};


	return Module;

});

