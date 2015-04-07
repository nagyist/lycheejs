
lychee.define('sorbet.serve.api.Server').requires([
	'lychee.data.JSON'
]).exports(function(lychee, sorbet, global, attachments) {

	var _JSON = lychee.data.JSON;


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
						'Access-Control-Allow-Origin':  data.headers['Host'],
						'Access-Control-Allow-Methods': 'GET',
						'Access-Control-Max-Age':       60 * 60
					},
					payload: ''
				});

			} else if (method === 'GET') {

				if (identifier !== null) {

					var project = host.getProject(identifier);
					if (project !== null) {

						var server_host = data.headers['Host'].split(':')[0];
						var server_port = null;

						if (project.server !== null) {
							server_host = project.server.host || server_host;
							server_port = project.server.port || null;
						}


						ready({
							status: 200,
							headers: {
								'Content-Control': 'no-transform',
								'Content-Type':    'application/json'
							},
							payload: _JSON.encode({
								host: server_host,
								port: server_port
							})
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

					var projects = host.projects.map(function(project) {

						var server_host = null;
						var server_port = null;

						if (project.server !== null) {
							server_host = project.server.host;
							server_port = project.server.port;
						}


						return {
							identifier: project.identifier,
							host:       server_host,
							port:       server_port
						};

					});


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

