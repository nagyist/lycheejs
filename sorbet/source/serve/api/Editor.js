
lychee.define('sorbet.serve.api.Editor').requires([
	'lychee.data.JSON'
]).exports(function(lychee, sorbet, global, attachments) {

	// var _JSON = lychee.data.JSON;
	var _JSON = {
		encode: JSON.stringify,
		decode: JSON.parse
	};



	/*
	 * HELPERS
	 */

	var _to_header = function(status, data) {

		return {
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Allow-Origin':  data.headers.origin || '*',
			'Access-Control-Allow-Methods': 'GET, PUT, POST',
			'Access-Control-Max-Age':       60 * 60,
			'Content-Control':              'no-transform',
			'Content-Type':                 'application/json'
		};

	};


	var _walk_source = function(filesystem, files) {

		var root = {};


		files.forEach(function(file) {

			var pointer = root;
			var path    = file.split('/').slice(1);
			if (path[path.length - 1].indexOf('.') !== -1) {
				path.push.apply(path, path.pop().split('.'));
			}


			while (path.length > 1) {

				var name = path.shift();
				if (pointer[name] !== undefined) {
					pointer = pointer[name];
				} else {
					pointer = pointer[name] = {};
				}

			}


			var ext    = path.shift();
			var asset  = filesystem.asset('/source' + file);
			if (asset !== null) {
				pointer[ext] = lychee.serialize(asset);
			}

		});


		return root;

	};


	var _serialize = function(project) {

		var source = {};


		var filesystem = project.filesystem || null;
		var package    = project.package || null;

		if (filesystem !== null && package !== null) {

			if (package.source instanceof Array) {
				source = _walk_source(filesystem, package.source);
			}

		}


		return {
			identifier: project.identifier,
			source:     source
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		process: function(host, url, data, ready) {

			var method     = data.headers.method;
			var parameters = data.headers.parameters;
			var identifier = null;
			var action     = null;


			if (parameters instanceof Object) {
				action     = parameters.action     || null;
				identifier = parameters.identifier || null;
			}



			/*
			 * 1: OPTIONS
			 */

			if (method === 'OPTIONS') {

				ready({
					status:  200,
					headers: {
						'Access-Control-Allow-Headers': 'Content-Type',
						'Access-Control-Allow-Origin':  data.headers.origin,
						'Access-Control-Allow-Methods': 'GET, PUT, POST',
						'Access-Control-Max-Age':       60 * 60
					},
					payload: ''
				});



			/*
			 * 2: GET
			 */

			} else if (method === 'GET') {

				if (identifier !== null) {

					var project = host.getProject(identifier);
					if (project !== null && identifier !== 'lychee' && identifier !== 'sorbet') {

						// XXX: Asset Serialization is asynchronous
						_serialize(project);
						setTimeout(function() {

							ready({
								status:  200,
								headers: _to_header(200, data),
								payload: _JSON.encode(_serialize(project))
							});

						}, 1000);

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
						return project.identifier !== 'lychee' && project.identifier !== 'sorbet';
					});


					// XXX: Asset Serialization is asynchronous
					projects.map(_serialize);
					setTimeout(function() {

						ready({
							status:  200,
							headers: _to_header(200, data),
							payload: _JSON.encode(projects.map(_serialize))
						});

					}, 1000);

				}



			/*
			 * 3: PUT
			 */

			} else if (method === 'PUT') {

				if (identifier === 'lychee' || identifier === 'sorbet') {

					ready({
						status:  501,
						headers: { 'Content-Type': 'application/json' },
						payload: _JSON.encode({
							error: 'Action not implemented.'
						})
					});

				} else if (identifier !== null) {


// TODO: Implement action save and export

					ready({
						status:  405,
						headers: { 'Content-Type': 'application/json' },
						payload: _JSON.encode({
							error: 'Action not allowed.'
						})
					});

				} else {

					ready({
						status:  501,
						headers: { 'Content-Type': 'application/json' },
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

