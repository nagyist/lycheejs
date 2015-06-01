
lychee.define('sorbet.serve.Redirect').exports(function(lychee, sorbet, global, attachments) {

	var Module = {

		can: function(host, url) {

			// lychee + <a> + <b> + <c>
			if (url.substr(0, 9) === '/projects') {

				var identifier = url.split('/')[2];
				var project    = host.getProject(identifier);
				if (project !== null) {

					var path = '/' + url.split('/').slice(1).join('/');
					var info = project.filesystem.info(path);

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

				var project = [].slice.call(host.projects, -1)[0] || null;
				if (project !== null) {

					var path = url;
					var info = project.filesystem.info(path);
					if (info !== null && info.type === 'directory') {

						var file = project.filesystem.info(path + '/index.html');
						if (file !== null && info.type === 'file') {
							return true;
						}

					}

				}

			}


			return false;

		},

		process: function(host, url, data, ready) {

			// lychee + <a> + <b> + <c>
			if (url.substr(0, 9) === '/projects') {

				var identifier = url.split('/')[2];
				var project    = host.getProject(identifier);
				if (project !== null) {

					var path = '/' + url.split('/').slice(1).join('/');
					var info = project.filesystem.info(path);

					var dir = '/projects/' + identifier;
					if (path === dir || path === (dir + '/') || path === (dir + '/index.html')) {

						ready({
							status: 301,
							headers: {
								location: dir + '/source/index.html'
							},
							payload: ''
						});

					}

				}

			// <cultivator> || <project>
			} else if (url === '/') {

				if (host.projects.length > 2 && host.getProject('cultivator') !== null) {

					ready({
						status:  301,
						headers: {
							location: '/projects/cultivator/index.html'
						},
						payload: ''
					});

				} else {

					ready({
						status:  301,
						headers: {
							location: '/index.html'
						},
						payload: ''
					});

				}

			} else if (host.projects.length === 2) {

				var project = [].slice.call(host.projects, -1)[0] || null;
				if (project !== null) {

					var path = url;
					var info = project.filesystem.info(path);
					if (info !== null && info.type === 'directory') {

						var file = project.filesystem.info(path + '/index.html');
						if (file !== null && info.type === 'file') {

							ready({
								status:  301,
								headers: {
									location: path + '/index.html'
								},
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

