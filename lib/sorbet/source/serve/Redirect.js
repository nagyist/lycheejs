
lychee.define('sorbet.serve.Redirect').exports(function(lychee, sorbet, global, attachments) {

	var Module = {

		can: function(host, url) {

			var identifier = null;
			var project    = null;
			var path       = null;
			var info       = null;


			// lychee + <a> + <b> + <c>
			if (url.substr(0, 9) === '/projects') {

				identifier = url.split('/')[2];
				project    = host.getProject(identifier);

				if (project !== null) {

					path = '/' + url.split('/').slice(1).join('/');
					info = project.filesystem.info(path);

					var dir = '/projects/' + identifier;
					if (path === dir || path === (dir + '/') || path === (dir + '/index.html')) {
						return true;
					}

				}

			// <cultivator> || <project>
			} else if (url === '/') {

				return true;

			// lychee + <project>
			} else if (host.projects.length === 2) {

				project = [].slice.call(host.projects, -1)[0] || null;

				if (project !== null) {

					path = url;
					info = project.filesystem.info(path);

					if (info !== null && info.type === 'directory') {

						var file = project.filesystem.info(path + '/index.html');
						if (file !== null && file.type === 'file') {
							return true;
						}

					}

				}

			}


			return false;

		},

		process: function(host, url, data, ready) {

			var identifier = null;
			var project    = null;
			var path       = null;
			var info       = null;


			// lychee + <a> + <b> + <c>
			if (url.substr(0, 9) === '/projects') {

				identifier = url.split('/')[2];
				project    = host.getProject(identifier);

				if (project !== null) {

					path = '/' + url.split('/').slice(1).join('/');
					info = project.filesystem.info(path);

					var dir = '/projects/' + identifier;
					if (path === dir || path === (dir + '/') || path === (dir + '/index.html')) {

						if (project.filesystem.info('/source/index.html') !== null) {

							ready({
								headers: { 'status': 301, 'location': dir + '/source/index.html' },
								payload: ''
							});

						} else if (project.filesystem.info('/index.html') !== null) {

							ready({
								headers: { 'status': 301, 'location': dir + '/index.html' },
								payload: ''
							});

						}

					}

				}

			// <cultivator> || <project>
			} else if (url === '/') {

				if (host.projects.length > 2 && host.getProject('cultivator') !== null) {

					ready({
						headers: { 'status': 301, location: '/projects/cultivator/index.html' },
						payload: ''
					});

				} else {

					ready({
						headers: { 'status': 301, 'location': '/index.html' },
						payload: ''
					});

				}

			} else if (host.projects.length === 2) {

				project = [].slice.call(host.projects, -1)[0] || null;

				if (project !== null) {

					path = url;
					info = project.filesystem.info(path);

					if (info !== null && info.type === 'directory') {

						var file = project.filesystem.info(path + '/index.html');
						if (file !== null && file.type === 'file') {

							ready({
								headers: { 'status': 301, 'location': path + '/index.html' },
								payload: ''
							});

						}

					}

				}

			}

		}

	};


	return Module;

});

