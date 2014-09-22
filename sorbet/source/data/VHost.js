
lychee.define('sorbet.data.VHost').requires([
	'sorbet.data.Filesystem'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, sorbet, global, attachments) {

	var _filesystem = sorbet.data.Filesystem;



	/*
	 * HELPERS
	 */

	var _parse_package = function(project) {

		this.fs.read(project['package'][0], function(raw) {

			var data = null;
			try {
				data = JSON.parse(raw);
			} catch(e) {
			}


			if (data !== null && data instanceof Object) {

				if (data.build instanceof Object && data.build.environments instanceof Object) {

					var environments = data.build.environments;
					for (var identifier in environments) {

						var environment = environments[identifier];
						if (environment instanceof Object) {

							var valid = true;

							if (environment.packages instanceof Array) {

								for (var p = 0, pl = environment.packages.length; p < pl; p++) {

									var pkg = environment.packages[p];
									if (pkg.length === 2) {

										var resolved = this.fs.resolve(project.root[0] + '/' + pkg[1]);
										if (resolved !== null) {
											pkg[1] = resolved.substr(this.fs.root.length);
										} else {
											valid = false;
										}

									}

								}

							}


							if (valid === true) {

								project.builds[identifier] = environment;

							} else {

								if (lychee.debug === true) {
									console.warn('sorbet.data.VHost: Package at "' + project.root[0] + '" has invalid Environment "' + identifier + '"');
								}

							}

						}

					}

				}

			}

		}, this);

	};

	var _refresh = function(force) {

		var trigger = force === true;
		var files   = this.fs.filter(
			null,
			'lychee.pkg',
			sorbet.data.Filesystem.TYPE.file
		);


		for (var f = 0, fl = files.length; f < fl; f++) {

			var tmp        = files[f].split('/'); tmp.pop();
			var absroot    = tmp.join('/');
			var abspackage = files[f];
			var identifier = tmp.pop();
			var relroot    = './' + absroot.substr(this.main.root.length + 1);
			var relpackage = './' + abspackage.substr(this.main.root.length + 1);
			var server     = null;


			if (absroot === this.main.root) continue;


			var server_process = this.main.servers.get(identifier);
			if (server_process !== null) {

				server = {
					host: server_process.status.host || null,
					port: server_process.status.port || null
				};

			}


			if (this.projects[identifier] === undefined) {

				this.projects[identifier] = {
					'id':      identifier,
					'root':    [ absroot,    relroot    ],
					'package': [ abspackage, relpackage ],
					'server':  server,
					'sorbet':  this.fs.isFile(absroot + '/sorbet.js'),
					'builds':  {},
					'vhost':   this
				};

				_parse_package.call(this, this.projects[identifier]);

				trigger = true;

			} else if (this.projects[identifier].server === null) {

				this.projects[identifier].server = server;

				trigger = true;

			}


		}


		if (trigger === true) {

			var that = this;

			setTimeout(function() {
				that.trigger('refresh', []);
			}, 1000);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var _id = 0;

	var Class = function(data, main) {

		var settings = lychee.extend({}, data);


		this.id        = 'vhost-' + _id++;
		this.main      = main || null;
		this.root      = '/var/www';
		this.fs        = new _filesystem(this.root);
		this.projects  = {};
		this.aliases   = [];
		this.redirects = {};


		this.setId(settings.id);
		this.setRoot(settings.root);

		this.setAliases(settings.aliases);
		this.setRedirects(settings.redirects);


		lychee.event.Emitter.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.fs.bind('refresh', this.refresh, this);
		this.fs.refresh();

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var settings = {};
			var main     = this.main !== null ? '#MAIN' : null;


			if (this.id.substr(0, 6) !== 'vhost-') settings.id   = this.id;
			if (this.root !== '/var/www')          settings.root = this.root;

			if (Object.keys(this.aliases).length > 0) {

				settings.aliases = [];

				for (var a = 0, al = this.aliases.length; a < al; a++) {
					settings.aliases.push(this.aliases[a]);
				}

			}

			if (Object.keys(this.redirects).length > 0) {

				settings.redirects = {};

				for (var from in this.redirects) {
					var to = this.redirects[from];
					settings.redirects[from] = to;
				}

			}


			return {
				'constructor': 'sorbet.data.VHost',
				'arguments':   [ settings, main ]
			};

		},



		/*
		 * CUSTOM API
		 */

		refresh: function() {
			_refresh.call(this, true);
		},

		getRedirect: function(url) {

			var redirect = null;

			for (var rurl in this.redirects) {

				if (rurl.substr(-1) === '*' && rurl.substr(0, rurl.length - 1) === url.substr(0, rurl.length - 1)) {

					var tmp = url.substr(rurl.length - 1, url.length - (rurl.length - 1));

					redirect = this.redirects[rurl].replace('*', tmp);

				} else if (rurl === url) {

					redirect = this.redirects[rurl];

				}

			}


			return redirect;

		},

		setAliases: function(aliases) {

			aliases = aliases instanceof Array ? aliases : null;


			if (aliases !== null) {

				for (var a = 0, al = aliases.length; a < al; a++) {

					var alias = aliases[a];
					if (typeof alias === 'string') {

						if (this.aliases.indexOf(alias) === -1) {
							this.aliases.push(alias);
						}

					}

				}


				return true;

			}


			return false;

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.id = id;

				return true;

			}


			return false;

		},

		setRedirects: function(redirects) {

			redirects = redirects instanceof Object ? redirects : null;


			if (redirects !== null) {

				for (var from in redirects) {

					var to = redirects[from];
					if (typeof to === 'string') {
						this.redirects[from] = to;
					}

				}


				return true;

			}


			return false;

		},

		setRoot: function(root) {

			root = typeof root === 'string' ? root : null;


			if (root !== null) {

				this.root = root;
				this.fs   = new _filesystem(root);

				return true;

			}


			return false;

		}

	};


	return Class;

});

