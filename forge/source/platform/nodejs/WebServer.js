
lychee.define('game.WebServer').tags({
	platform: 'nodejs'
}).requires([
	'game.webserver.mod.FS',
	'game.webserver.mod.Error',
	'game.webserver.mod.File',
	'game.webserver.mod.Redirect',
	'game.webserver.mod.Welcome'
]).supports(function(lychee, global) {

	if (
		typeof process !== 'undefined'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var http = require('http');
	var zlib = require('zlib');

	var _mod      = game.webserver.mod;
	var _template = game.webserver.Template;



	/*
	 * AUTONOMOUS WEBSERVER
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.root    = typeof settings.root === 'string' ? settings.root : '/var/www';
		this.port    = null;
		this.version = Class.VERSION;

		this.fs = new _mod['FS'](this);
		this.fs.watch(this.root);


		this.__mods      = {};
		this.__hosts     = {};
		this.__server    = null;

		this.__mods.error    = new _mod['Error'](this);
		this.__mods.file     = new _mod['File'](this);
		this.__mods.redirect = new _mod['Redirect'](this);
		this.__mods.welcome  = new _mod['Welcome'](this);


		if (settings.hosts instanceof Array) {

			for (var h = 0, hl = settings.hosts.length; h < hl; h++) {

				var host = settings.hosts[h][0] || null;
				var raw  = settings.hosts[h][1] || {};

				var config = {
					root:      raw.root      || this.root,
					aliases:   raw.aliases   || {},
					redirects: raw.redirects || {}
				};

				if (typeof host === 'string') {

					this.setHost(host, config);

				} else if (host instanceof Array) {

					var defaulthost = host[0];
					if (typeof defaulthost === 'string') {

						this.setHost(defaulthost, config);

						for (var h1 = 1; h1 < host.length; h1++) {
							this.setHostAlias(defaulthost, host[h1]);
						}

					}

				}

			}

		}


/*

		this.__mods.fs.add(
			this.root, 'forge/backend.sjs',
			game.webserver.mod.FS.TYPE.link,
			'backend'
		);
*/

	};


	Class.VERSION = 'lycheeJS ' + lychee.VERSION + ' Forge (running on NodeJS ' + process.version + ')';


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		listen: function(port) {

			port = typeof port === 'number' ? port : 80;


			if (lychee.debug === true) {
				console.log('game.WebServer: Listening on null:' + port);
			}


			var that = this;


			var server = new http.Server();

			server.on('request', function(request, response) {

				var accept_encoding = request.headers['accept-encoding'] || "";

				that.__handleRequest(request, function(data) {

					if (accept_encoding.match(/\bgzip\b/)) {

						zlib.gzip(data.body, function(err, buffer) {

							data.header['Content-Encoding'] = 'gzip';
							data.header['Content-Length']   = buffer.length;
							response.writeHead(data.status, data.header);

							if (!err) {
								response.write(buffer);
								response.end();
							} else {
								response.end();
							}

						});

					} else {

						data.header['Content-Length'] = data.body.length;

						response.writeHead(data.status, data.header);
						response.write(data.body);
						response.end();

					}

				});

			});


			try {

				server.listen(port);

				that.port     = port;
				that.__server = server;

			} catch(e) {

				that.__server = null;
				that.port     = null;

				server.close();

			}


			return this.__server !== null;

		},

		getHost: function(host) {

			host = typeof host === 'string' ? host : null;


			if (this.__hosts[host] !== undefined) {
				return this.__hosts[host];
			}


			return null;

		},

		setHostAlias: function(host, alias) {

			alias = typeof alias === 'string' ? alias : null;


			var settings = this.getHost(host);
			if (
				settings !== null
				&& this.getHost(alias) === null
			) {

				this.__hosts[alias] = settings;

				return true;

			}


			return false;

		},

		setHost: function(host, data) {

			host = typeof host === 'string' ? host : null;


			if (host !== null) {

				var config = lychee.extend({}, data);


				var settings = {
					fs:        new _mod['FS'](this),
					host:      host,
					root:      typeof config.root === 'string' ? config.root : this.root
				};

				settings.fs.watch(settings.root);


				for (var alias in config.aliases) {

					var tmp    = config.aliases[alias].split('/');
					var ref    = tmp.pop();
					var folder = tmp.join('/');

					settings.fs.add(
						folder, ref,
						_mod['FS'].TYPE.link,
						alias
					);

				}

				settings.redirects = {};

				for (var url in config.redirects) {

					var target = config.redirects[url];
					if (typeof target === 'string') {
						settings.redirects[url] = target;
					}

				}


				this.__hosts[host] = settings;


				return true;

			}


			return false;

		},

		getMod: function(id, type) {

			type = typeof type === 'string' ? type : null;


			if (this.__mods[id]) {

				if (type !== null) {
					return this.__mods[id][type] || null;
				} else {
					return this.__mods[id];
				}

			}


			return null;

		},

		getRedirectURL: function(host, url) {

			var redirecturl = null;

			for (var rurl in host.redirects) {

				if (
					rurl.substr(-1) === '*'
					&& rurl.substr(0, rurl.length - 1) === url.substr(0, rurl.length - 1)
				) {

					var tmp = url.substr(rurl.length - 1, url.length - (rurl.length - 1));

					redirecturl = host.redirects[rurl].replace('*', tmp);

				} else if (rurl === url) {

					redirecturl = host.redirects[rurl];

				}

			}


			return redirecturl;

		},



		/*
		 * PRIVATE API
		 */

		__handleRequest: function(request, callback) {

			var error    = this.getMod('error');
			var file     = this.getMod('file');
			var redirect = this.getMod('redirect');
			var welcome  = this.getMod('welcome');


			var url     = request.url;
			var rawhost = (request.headers.host || '').split(':')[0];


			var host = this.getHost(rawhost);
			if (host !== null) {

				var redirecturl = this.getRedirectURL(host, url);
				if (redirecturl !== null) {

					if (lychee.debug === true) {
						console.log('game.webserver.mod.Redirect: ' + url + ' to ' + redirecturl);
					}

					redirect.execute(host, redirecturl, callback);
					return;

				}


				var fs       = null;
				var resolved = null;

				if (
					(host.root === this.root && url === '/')
					|| url.substr(0, 12) === '/favicon.ico'
					|| url.substr(0,  7) === '/lychee'
					|| url.substr(0,  6) === '/forge'
				) {

					if (url === '/') {

						welcome.execute(host, url, callback);
						return;

					} else {

						fs       = this.fs;
						resolved = fs.resolve(this.root + url);

					}

				} else {

					fs       = host.fs;
					resolved = fs.resolve(host.root + url);

				}


				if (
					   fs !== null
					&& resolved !== null
				) {

					if (
						   fs.isDirectory(resolved) === true
						&& fs.isFile(resolved + '/index.html') === true
					) {

						redirect.execute(host, resolved + '/index.html', callback);

					} else if (fs.isFile(resolved) === true) {

						file.execute(host, resolved, callback);

					} else if (fs.isFile(resolved) === false) {

						error.execute(404, host, url + ' (' + resolved + ')', callback);

					} else {

						error.execute(403, host, url + ' (' + resolved + ')', callback);

					}

				} else {

					error.execute(404, host, url + ' (' + resolved + ')', callback);

					if (fs !== null) {
						fs.refresh();
					}

				}

			} else {

				// Fallback for unknown hosts:
				// Allow Errors to be served properly.

				if (url.substr(0, 12) === '/forge/asset') {

					var resolved = this.fs.resolve(this.root + url);
					if (resolved !== null) {
						file.execute({ fs: this.fs }, resolved, callback);
					} else {
						error.execute(404, null, url, callback);
					}

				} else {

					if (lychee.debug === true) {

						console.error('game.WebServer: Illegal Request for "'   + rawhost + ' , ' + url            + '"');
						console.error('game.WebServer: Remote Address is "'     + request.connection.remoteAddress + '"');
						console.error('game.WebServer: User Agent is "'         + request.headers['user-agent']    + '"');

					}

					error.execute(404, null, url, callback);

				}

			}

		}

	};


	return Class;

});

