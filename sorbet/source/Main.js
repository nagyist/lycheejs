
lychee.define('sorbet.Main').requires([
	'lychee.Input',
	'sorbet.api.remote.Debugger',
	'sorbet.api.remote.Log',
	'sorbet.api.remote.Project',
	'sorbet.api.remote.Server',
	'sorbet.api.remote.VirtualHost',
	'sorbet.module.Blacklist',
	'sorbet.module.Error',
	'sorbet.module.Fertilizer',
	'sorbet.module.File',
	'sorbet.module.Honey',
	'sorbet.module.Log',
	'sorbet.module.Redirect',
	'sorbet.module.Server',
	'sorbet.data.Filesystem',
	'sorbet.data.Map',
	'sorbet.data.Storage',
	'sorbet.data.VHost'
]).exports(function(lychee, sorbet, global, attachments) {

	var http = require('http');
	var zlib = require('zlib');

	var _filesystem = sorbet.data.Filesystem;
	var _map        = sorbet.data.Map;
	var _vhost      = sorbet.data.VHost;



	/*
	 * HELPERS
	 */

	var _resolve_constructor = function(identifier, scope) {

		var pointer = scope;

		var ns = identifier.split('.');
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = null;
				break;
			}

		}

		if (pointer === scope) {
			pointer = null;
		}


		return pointer;

	};

	var _protected = [
		'/sorbet/lychee.pkg',
		'/sorbet/index.js',
		'/sorbet/init.js',
		'/sorbet/asset/',
		'/sorbet/profile/',
		'/sorbet/source/'
	];

	var _is_protected = function(url) {

		for (var p = 0, pl = _protected.length; p < pl; p++) {

			var entry = _protected[p];
			if (entry === url.substr(0, entry.length)) {
				return true;
			}

		}


		return false;

	};

	var _parse_host = function() {

		var tmp = (this + '').split(':');
		if (tmp[0] === 'http' || tmp[0] === 'https') {
			return tmp[1].substr(2);
		} else {
			return tmp[0];
		}

	};

	var _parse_port = function() {

		var tmp = (this + '').split(':');
		if (tmp[0] === 'http' || tmp[0] === 'https') {
			return parseInt(tmp[2] || '80', 10);
		} else {
			return parseInt(tmp[1] || '80', 10);
		}

	};

	var _response_handler = function(request, response, data) {

		if (data.status === 304) {

			response.writeHead(data.status);
			response.end();

		} else {

			var accept_encoding = request.headers['accept-encoding'] || "";
			if (accept_encoding.match(/\bgzip\b/)) {

				zlib.gzip(data.content, function(err, buffer) {

					if (!err) {

						data.header['Content-Encoding'] = 'gzip';
						data.header['Content-Length']   = buffer.length;

						response.writeHead(data.status, data.header);
						response.write(buffer);

					} else {

						data.header['Content-Length'] = data.content.length;

						response.writeHead(data.status, data.header);
						response.write(data.content);

					}

					response.end();

				});

			} else {

				data.header['Content-Length'] = data.content.length;

				response.writeHead(data.status, data.header);
				response.write(data.content);

				response.end();

			}

		}

	};

	var _request_handler = function(rawrequest, rawresponse) {

		var that    = this;
		var rawbody = '';

		rawrequest.on('data', function(chunk) {
			rawbody += chunk;
		});

		rawrequest.on('end', function() {

			var response = {
				async:   false,
				status:  0,
				header:  {},
				content: '',
				ready:   function() {
					_response_handler(rawrequest, rawresponse, response);
				}
			};


			that.process(rawrequest, response, rawbody);


			if (response.async === false) {
				response.ready();
			}

		});

	};



	/*
	 * IMPLEMENTATION
	 */

	var _cmd  = 'sorbet ' + [].slice.call(process.argv, 2).join(' ');
	var _root = require('path').resolve(__dirname, '../../');


	var Class = function(profile) {

		profile = profile instanceof Object ? profile : {};


		this.fs      = new _filesystem(_root);
		this.port    = null;
		this.root    = _root;
		this.servers = new _map();

		this.vhosts  = new _map();
		this.apis    = new _map();
		this.modules = new _map();



		/*
		 * PID STORAGE
		 */

		this.storage = new sorbet.data.Storage({
			id: 'servers'
		});


		this.status      = this.storage.create();
		this.status.id   = 'sorbet';
		this.status.type = 'web';
		this.status.pid  = process.pid;
		this.status.cmd  = _cmd;


		this.storage.insert(this.status);



		/*
		 * DYNAMIC VHOSTS
		 */

		if (profile.vhosts instanceof Array) {

			for (var v = 0, vl = profile.vhosts.length; v < vl; v++) {

				var blob       = profile.vhosts[v];
				var identifier = blob.hosts[0] || null;
				if (identifier !== null) {

					var vhost = new _vhost({
						id:        identifier,
						root:      blob.config.root.replace('%root%', this.root),
						redirects: blob.config.redirects || {},
						aliases:   [].slice.call(blob.hosts, 1)
					}, this);


					this.vhosts.set(identifier, vhost);

					for (var h = 1, hl = blob.hosts.length; h < hl; h++) {
						var alias = blob.hosts[h];
						this.vhosts.alias(identifier, alias);
					}

				}

			}

		}



		/*
		 * STATIC MODULES
		 */

		this.modules.set('Error',    new sorbet.module['Error'](this));
		this.modules.set('File',     new sorbet.module['File'](this));
		this.modules.set('Redirect', new sorbet.module['Redirect'](this));



		/*
		 * DYNAMIC MODULES
		 */

		if (profile.api instanceof Object) {

			for (var aid in profile.api) {

				var apiconstruct = _resolve_constructor(profile.api[aid], global);
				if (apiconstruct instanceof Function) {

					if (this.apis.get(aid) === null) {

						if (lychee.debug === true) {
							console.info('sorbet.Main: Spawning API "' + aid + '" from "' + profile.api[aid] + '"');
						}

						this.apis.set(aid.toLowerCase(), new apiconstruct(this));

					}

				}

			}

		}


		if (profile.module instanceof Object) {

			for (var mid in profile.module) {

				var modconstruct = _resolve_constructor(profile.module[mid], global);
				if (modconstruct instanceof Function) {

					if (this.modules.get(mid) === null) {

						if (lychee.debug === true) {
							console.info('sorbet.Main: Spawning Module "' + mid + '" from "' + profile.module[mid] + '"');
						}

						this.modules.set(mid, new modconstruct(this));

					}

				}

			}

		}



		/*
		 * INITIALIZATION
		 */

		this.refresh();

	};


	Class.VERSION = 'lycheeJS ' + lychee.VERSION + ' Sorbet (running on NodeJS ' + process.version + ')';


	Class.prototype = {

		refresh: function() {

			this.fs.refresh(false);
			this.storage.trigger('sync', []);


			var vhosts = this.vhosts.values();
			for (var v = 0, vl = vhosts.length; v < vl; v++) {
				vhosts[v].fs.refresh(false);
				vhosts[v].refresh();
			}

		},

		listen: function(port) {

			port = typeof port === 'number' ? port : 8080;


			var that   = this;
			var server = new http.Server();

			server.on('request', function(request, response) {
				_request_handler.call(that, request, response);
			});

			server.on('error', function(err) {

				console.error('sorbet.Main: Error "' + err + '" on null:' + port);

				that.port = null;
				that.servers.set(null, null);

				process.exit(1);

			});

			server.listen(port);


			this.port = port;
			this.servers.set(null, server);

			this.status.port = this.port;
			this.storage.update(this.status);

		},

		process: function(request, response, blob) {

			var _blacklist = this.modules.get('Blacklist');
			var _error     = this.modules.get('Error');
			var _file      = this.modules.get('File');
			var _honey     = this.modules.get('Honey');
			var _log       = this.modules.get('Log');
			var _redirect  = this.modules.get('Redirect');


			var rawhost    = _parse_host.call(request.headers.host || '');
			var rawport    = _parse_port.call(request.headers.host || '');
			var rawreferer = request.headers.referer || null;
			var rawremote  = request.connection.remoteAddress || null;
			var raworigin  = _parse_host.call(request.headers.origin || '');

			var vhost      = this.vhosts.get(rawhost);
			var url        = request.url.split('?')[0];
			var fs         = null;
			var resolved   = null;



			/*
			 * 0. Honeypots for Intruders
			 * 0. Blacklist for Intruders
			 * 0. Logging of Requests
			 */

			if (_log !== null && vhost !== null) {

				_log.report(vhost, {
					host:       rawhost,
					port:       rawport,
					remote:     rawremote,
					useragent:  request.headers['user-agent'],
					url:        url,
					parameters: request.url.split('?')[1] || null
				});

			}

			if (_honey !== null) {

				if (_honey.process(vhost, response, {
					host:      rawhost,
					port:      rawport,
					referer:   rawreferer,
					remote:    rawremote,
					useragent: request.headers['user-agent'],
					url:       url
				})) {
					return response;
				}

			}

			if (_blacklist !== null) {

				if (_blacklist.process(vhost, response, {
					host:      rawhost,
					port:      rawport,
					referer:   rawreferer,
					remote:    rawremote,
					useragent: request.headers['user-agent'],
					url:       url
				})) {
					return response;
				}

			}



			/*
			 * 1. Valid VHost
			 */

			if (vhost !== null) {

				// 1.1 VHost Redirects
				var redirecturl = vhost.getRedirect(url);
				if (redirecturl !== null) {

					if (_redirect.process(vhost, response, {
						url: redirecturl
					})) {
						return response;
					}

				}


				// 1.2a Sorbet API
				if (url.substr(0, 5) === '/api/') {

					var moduleid = url.split('/')[2] || null;
					if (moduleid !== null) {

						moduleid = moduleid.toLowerCase();

						var module = this.apis.get(moduleid);
						if (module !== null) {

							if (lychee.debug === true) {
								console.info('sorbet.Main: Calling API "' + moduleid + '"');
							}

							if (module.process(vhost, response, {
								method:     (request.method || '').toUpperCase(),
								identifier: url.split('/')[3] || null,
								referer:    rawreferer,
								host:       rawhost,
								port:       rawport,
								origin:     raworigin,
								blob:       blob,
								url:        request.url
							})) {
								return response;
							}

						}

					}


					if (_error.process(vhost, response, {
						status: 403,
						type:   'application/json',
						host:   rawhost,
						url:    url
					})) {
						return response;
					}


				// 1.2b Dashboard Integration and static assets
				} else if (vhost.root === this.root) {

					if (url === '/') {

						if (_redirect.process(vhost, response, {
							url: vhost.root + '/Dashboard/index.html'
						})) {
							return response;
						}

					} else if (_is_protected(url) === false) {

						// Allow overwrites via public directory
						fs       = this.fs;
						resolved = fs.resolve(this.root + '/sorbet/public' + url);


						if (resolved === null) {
							fs       = this.fs;
							resolved = fs.resolve(this.root + url);
						}

					}


				// 1.2c VHost Integration
				} else {

					fs       = vhost.fs;
					resolved = fs.resolve(vhost.root + url);

				}



				// 1.3a Valid Filesystem Request
				if (fs !== null && resolved !== null) {

					// 1.3.1. Redirects for directory URLs
					if (fs.isDirectory(resolved) === true && fs.isFile(resolved + '/index.html') === true) {

						if (_redirect.process(vhost, response, {
							url: resolved + '/index.html'
						})) {
							return response;
						}


					// 1.3.2. File Serving
					} else if (fs.isFile(resolved) === true) {

						if (_file.process(vhost, response, {
							url:       url,
							resolved:  resolved,
							range:     request.headers.range || null,
							version:   parseFloat(request.httpVersion, 10) || 1.0,
							timestamp: request.headers['if-modified-since'] || null
						})) {
							return response;
						}


					// 1.3.3. File Not Found
					} else {

						if (_error.process(vhost, response, {
							status:   404,
							host:     rawhost,
							url:      url
						})) {
							return response;
						}

					}


				// 1.3b Invalid Filesystem Request
				} else {

					if (fs !== null) {
						fs.refresh();
					}

				}



			/*
			 * 2. Invalid Host, might be an Error page
			 */

			} else {

				vhost = { fs: this.fs };


				// 2.1a Sorbet Asset Integration
				if (_is_protected(url) === false) {

					// Allow overwrites via public directory
					fs       = this.fs;
					resolved = fs.resolve(this.root + '/sorbet/public' + url);


					if (resolved !== null) {

						if (_file.process(vhost, response, {
							url:      url,
							resolved: resolved
						})) {
							return response;
						}

					}

				}

			}



			/*
			 * 3. Exploit Prevention
			 */

			if (_blacklist !== null) {

				_blacklist.report(vhost, {
					host:      rawhost,
					port:      rawport,
					referer:   rawreferer,
					remote:    rawremote,
					useragent: request.headers['user-agent'],
					url:       url
				});

			}


			_error.process(null, response, {
				status:   404,
				host:     rawhost,
				url:      url
			});

			return response;

		},

		destroy: function() {

			var sids = this.servers.ids();

			for (var s = 0, sl = sids.length; s < sl; s++) {

				var sid    = sids[s];
				var server = this.servers.get(sid);
				if (server !== null) {

					if (lychee.debug === true) {
						console.warn('sorbet.Main: Terminating Server "' + server.status.id + '" (' + server.status.pid + ')');
					}


					if (typeof server.destroy === 'function') {
						server.destroy();
					}

				}

			}


			var mids = this.modules.ids();

			for (var m = 0, ml = mids.length; m < ml; m++) {

				var mid    = mids[m];
				var module = this.modules.get(mid);
				if (module !== null) {

					if (lychee.debug === true) {
						console.warn('sorbet.Main: Terminating Module "' + module.id + '"');
					}


					if (typeof module.destroy === 'function') {
						module.destroy();
					}

				}

			}


			this.storage.remove(null, this.status);
			this.storage.trigger('sync', []);

		}

	};


	return Class;

});

