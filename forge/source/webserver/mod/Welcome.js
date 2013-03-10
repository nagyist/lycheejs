
lychee.define('game.webserver.mod.Welcome').requires([
	'game.webserver.Template'
]).exports(function(lychee, game, global, attachments) {

	var _html     = attachments['html'] || null;
	var _template = game.webserver.Template;


	var Class = function(webserver) {

		this.__template  = null;
		this.__webserver = webserver;


		if (_html !== null) {
			this.__template = new _template(_html);
		}

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		execute: function(host, url, callback) {

			var webserver = this.__webserver;


			var content = '';

			if (this.__template !== null) {

				try {

					content = this.__template.render({

						internal_projects: this.__generateInternalProjects(host),
						external_projects: this.__generateExternalProjects(host),
						sockets:           this.__generateSockets(host),

						webserver_version: webserver.version

					});

				} catch(e) {

					content = '';

					var errormod = webserver.getMod('error');
					if (errormod !== null) {
						errormod.execute(500, host, url, callback);
						return;
					}

				}

			}


			callback({
				status: 200,
				header: {
					'Content-Type':   'text/html'
				},
				body: content
			});

		},



		/*
		 * PRIVATE API
		 */

		__generateInternalProjects: function(host) {

			var projects = [];

			var fs   = host.fs;
			var root = host.root;

			var files = fs.filter(
				root + '/game',
				'index.html',
				game.webserver.mod.FS.TYPE.file
			);


			for (var f = 0, fl = files.length; f < fl; f++) {

				var url = files[f].substr(root.length);
				var tmp = url.split('/');
				tmp.splice(tmp.length - 1, 1); // remove index.html

				projects.push({
					url:   url,
					title: tmp[tmp.length - 1]
				});

			}


			return projects;

		},

		__generateExternalProjects: function(host) {

			var projects = [];

			var fs   = host.fs;
			var root = host.root;

			var files = fs.filter(
				root + '/external',
				'index.html',
				game.webserver.mod.FS.TYPE.file
			);


			for (var f = 0, fl = files.length; f < fl; f++) {

				var url = files[f].substr(root.length);
				var tmp = url.split('/');
				tmp.splice(tmp.length - 1, 1); // remove index.html

				projects.push({
					url:   url,
					title: tmp[tmp.length - 1]
				});

			}


			return projects;

		},

		__generateSockets: function(host) {

			var webserver = this.__webserver;


			var sockets = [];

			sockets.push({
				url:  'http://' + host.host + ':' + webserver.port,
				host: host.host,
				port: webserver.port,
				services: 'WebService'
			});


			return sockets;

		}

	};


	return Class;

});

