
lychee.define('harvester.serve.Redirect').exports(function(lychee, harvester, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			return {
				'reference': 'harvester.serve.Redirect',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(host, url) {

			var identifier = null;
			var project    = null;
			var path       = null;
			var info       = null;


			// <a> + <b> + <c>
			if (url.substr(0, 9) === '/projects') {

				identifier = url.split('/').slice(0, 3).join('/');
				project    = host.getProject(identifier);

				if (project !== null) {

					path = '/' + url.split('/').slice(3).join('/');
					info = project.filesystem.info(path);

					if (path === identifier || path === (identifier + '/') || path === '/') {
						return true;
					}

				}

			// <cultivator> || <project>
			} else if (url === '/') {

				return true;

			}


			return false;

		},

		process: function(host, url, data, ready) {

			var identifier = null;
			var project    = null;
			var path       = null;
			var info       = null;


			// /projects/*
			if (url.substr(0, 9) === '/projects') {

				identifier = url.split('/').slice(0, 3).join('/');
				project    = host.getProject(identifier);

				if (project !== null) {

					path = '/' + url.split('/').slice(3).join('/');
					info = project.filesystem.info(path);

					if (path === identifier || path === (identifier + '/') || path === '/') {

						if (project.filesystem.info('/index.html') !== null) {

							ready({
								headers: { 'status': 301, 'location': identifier + '/index.html' },
								payload: ''
							});

						}

					}

				}


			// / to /projects/cultivator/index.html or /index.html
			} else if (url === '/') {

				if (host.cultivator === true) {

					ready({
						headers: { 'status': 301, 'location': '/projects/cultivator/index.html' },
						payload: ''
					});

				} else {

					ready({
						headers: { 'status': 301, 'location': '/index.html' },
						payload: ''
					});

				}

			} else {

				ready({
					headers: { 'status': 301, 'location': '/index.html' },
					payload: ''
				});

			}

		}

	};


	return Module;

});

