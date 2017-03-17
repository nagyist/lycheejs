
lychee.define('harvester.net.server.Redirect').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		/*
		 * MODULE API
		 */

		serialize: function() {

			return {
				'reference': 'harvester.net.server.Redirect',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		receive: function(payload, headers) {

			let tunnel = this.tunnel;
			let url    = headers['url'];


			// Single-project mode
			if (lychee.ROOT.lychee !== lychee.ROOT.project) {

				let identifier = lychee.ROOT.project;
				let project    = lychee.import('MAIN')._projects[identifier] || null;
				if (project !== null) {

					let path = url;
					if (path === '' || path === '/') {

						let info = project.filesystem.info('/index.html');
						if (info !== null) {

							tunnel.send('', {
								'status':   '301 Moved Permanently',
								'location': '/index.html'
							});

							return true;

						}

					}

				}


			// Multi-project mode /index.html
			} else if (url === '/') {

				tunnel.send('SHIT', {
					'status':   '301 Moved Permanently',
					'location': '/index.html'
				});

				return true;


			// Multi-project mode /projects/*
			} else if (url.substr(0, 9) === '/projects') {

				let identifier = url.split('/').slice(0, 3).join('/');
				let project    = lychee.import('MAIN')._projects[identifier] || null;
				if (project !== null) {

					let path = '/' + url.split('/').slice(3).join('/');
					if (path === identifier || path === identifier + '/' || path === '/') {

						let info = project.filesystem.info('/index.html');
						if (info !== null) {

							tunnel.send('', {
								'status':   '301 Moved Permanently',
								'location': identifier + '/index.html'
							});

							return true;

						}

					}

				}

			}


			return false;

		}

	};


	return Module;

});

