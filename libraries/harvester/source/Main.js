
lychee.define('harvester.Main').requires([
	'lychee.Input',
	'harvester.net.Admin',
	'harvester.net.Server',
	'harvester.mod.Fertilizer',
	'harvester.mod.Packager',
	'harvester.mod.Server',
//	'harvester.mod.Strainer',
	'harvester.mod.Updater'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _harvester   = lychee.import('harvester');
	const _mod         = {
		Fertilizer: lychee.import('harvester.mod.Fertilizer'),
		Packager:   lychee.import('harvester.mod.Packager'),
		Server:     lychee.import('harvester.mod.Server'),
		Strainer:   lychee.import('harvester.mod.Strainer'),
		Updater:    lychee.import('harvester.mod.Updater')
	};
	const _setInterval = global.setInterval;
	const _setTimeout  = global.setTimeout;
	const _Emitter     = lychee.import('lychee.event.Emitter');
	const _LIBRARIES   = {};
	const _PROJECTS    = {};
	const _PUBLIC_IPS  = (function() {

		let os = null;

		try {
			os = require('os');
		} catch(err) {
		}


		if (os !== null) {


			let candidates = [];

			Object.values(os.networkInterfaces()).forEach(function(iface) {

				iface.forEach(function(alias) {

					if (alias.internal === false) {

						if (alias.family === 'IPv6' && alias.scopeid === 0) {
							candidates.push(alias.address);
						} else if (alias.family === 'IPv4') {
							candidates.push(alias.address);
						}

					}

				});

			});

			return candidates.unique();

		}


		return [];

	})();



	/*
	 * HELPERS
	 */

	const _initialize = function(sandbox) {

		let libraries  = Object.values(_LIBRARIES);
		let projects   = Object.values(_PROJECTS);
		let Fertilizer = _mod.Fertilizer;
		let Packager   = _mod.Packager;
		let Server     = _mod.Server;
		let Strainer   = _mod.Strainer;
		let Updater    = _mod.Updater;


		if (sandbox === true) {

			console.info('harvester: SANDBOX mode active');
			console.info('harvester: Software bots disabled');
			console.log('\n\n');

			Fertilizer = null;
			Strainer   = null;
			Updater    = null;

		} else {

			console.info('harvester: SANDBOX mode inactive');
			console.info('harvester: Software bots enabled');
			console.log('\n\n');

		}



		/*
		 * BOOTUP: LIBRARIES
		 */

		libraries.forEach(function(library, l) {

			if (Packager !== null && Packager.can(library) === true) {
				Packager.process(library);
			}

			if (Server !== null && Server.can(library) === true) {
				Server.process(library);
			}

			if (Updater !== null && Updater.can(library) === true) {
				Updater.process(library);
			}

			if (Fertilizer !== null && Fertilizer.can(library) === true) {
				Fertilizer.process(library);
			}

		});



		/*
		 * BOOTUP: PROJECTS
		 */

		_setTimeout(function() {

			projects.forEach(function(project, p) {

				if (Packager !== null && Packager.can(project) === true) {
					Packager.process(project);
				}

				if (Server !== null && Server.can(project) === true) {
					Server.process(project);
				}

				if (Updater !== null && Updater.can(project) === true) {
					Updater.process(project);
				}

				if (Fertilizer !== null && Fertilizer.can(project) === true) {

					_setTimeout(function() {
						Fertilizer.process(project);
					}, p * 2000);

				}

			});

		}, 3000);



		/*
		 * INTERVAL
		 */

		_setInterval(function() {

			libraries.forEach(function(library) {

				if (Packager !== null && Packager.can(library) === true) {
					Packager.process(library);
				}

			});

			projects.forEach(function(project) {

				if (Packager !== null && Packager.can(project) === true) {
					Packager.process(project);
				}

			});

		}, 30000);


	};



	/*
	 * FEATURE DETECTION
	 */

	(function(libraries, projects) {

		let filesystem = new _harvester.data.Filesystem();


		filesystem.dir('/libraries').filter(function(value) {
			return /README\.md/.test(value) === false;
		}).map(function(value) {
			return '/libraries/' + value;
		}).forEach(function(identifier) {

			let info1 = filesystem.info(identifier + '/lychee.pkg');
			if ((info1 !== null && info1.type === 'file')) {
				libraries[identifier] = new _harvester.data.Project(identifier);
			}

		});

		filesystem.dir('/projects').filter(function(value) {
			return /cultivator|README\.md/.test(value) === false;
		}).map(function(value) {
			return '/projects/' + value;
		}).forEach(function(identifier) {

			let info1 = filesystem.info(identifier + '/index.html');
			let info2 = filesystem.info(identifier + '/lychee.pkg');
			if ((info1 !== null && info1.type === 'file') || (info2 !== null && info2.type === 'file')) {
				projects[identifier] = new _harvester.data.Project(identifier);
			}

		});

		filesystem.dir('/projects/cultivator').filter(function(value) {
			return /design|index\.html|robots\.txt/.test(value) === false;
		}).map(function(value) {
			return '/projects/cultivator/' + value;
		}).forEach(function(identifier) {

			let info1 = filesystem.info(identifier + '/index.html');
			let info2 = filesystem.info(identifier + '/lychee.pkg');
			if ((info1 !== null && info1.type === 'file') || (info2 !== null && info2.type === 'file')) {
				projects[identifier] = new _harvester.data.Project(identifier);
			}

		});

	})(_LIBRARIES, _PROJECTS);



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.settings = lychee.assignunlink({ host: null, port: null, sandbox: false }, settings);
		this.defaults = lychee.assignunlink({}, this.settings);


		this.admin  = null;
		this.server = null;


		this._libraries = _LIBRARIES;
		this._projects  = _PROJECTS;


		settings.host    = typeof settings.host === 'string' ? settings.host       : null;
		settings.port    = typeof settings.port === 'number' ? (settings.port | 0) : 8080;
		settings.sandbox = settings.sandbox === true;


		_Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			this.admin  = new _harvester.net.Admin({
				host: 'localhost',
				port: 4848
			});

			this.server = new _harvester.net.Server({
				host: settings.host === 'localhost' ? null : settings.host,
				port: settings.port
			});

		}, this, true);

		this.bind('init', function() {

			this.admin.connect();
			this.server.connect();


			console.log('\n');
			console.info('+-------------------------------------------------------+');
			console.info('| Open one of these URLs with a Blink-based Web Browser |');
			console.info('+-------------------------------------------------------+');
			console.log('\n');
			this.getHosts().forEach(function(host) {
				console.log(host);
			});
			console.log('\n\n');

		}, this, true);


		this.bind('init', function() {
			_initialize.call(this, settings.sandbox);
		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let admin = lychee.deserialize(blob.admin);
			if (admin !== null) {
				this.admin = admin;
			}


			let server = lychee.deserialize(blob.server);
			if (server !== null) {
				this.server = server;
			}

		},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'harvester.Main';


			let settings = lychee.assignunlink({}, this.settings);
			let blob     = data['blob'] || {};


			if (this.admin !== null)  blob.admin  = lychee.serialize(this.admin);
			if (this.server !== null) blob.server = lychee.serialize(this.server);


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load');
			this.trigger('init');

		},

		destroy: function() {

			for (let identifier in _PROJECTS) {

				let project = _PROJECTS[identifier];
				if (project.server !== null) {

					if (typeof project.server.destroy === 'function') {
						project.server.destroy();
					}

				}

			}


			if (this.admin !== null) {
				this.admin.disconnect();
				this.admin = null;
			}

			if (this.server !== null) {
				this.server.disconnect();
				this.server = null;
			}


			this.trigger('destroy');

		},



		/*
		 * CUSTOM API
		 */

		getHosts: function() {

			let hosts  = [];
			let server = this.server;

			if (server !== null) {

				let host = server.host || null;
				let port = server.port;

				if (host === null) {
					hosts.push.apply(hosts, _PUBLIC_IPS);
					hosts.push('localhost');
				} else {
					hosts.push(host);
				}


				hosts = hosts.map(function(host) {

					if (host.indexOf(':') !== -1) {
						return 'http://[' + host + ']:' + port;
					} else {
						return 'http://' + host + ':' + port;
					}

				});

			}


			return hosts;

		}

	};


	return Composite;

});

