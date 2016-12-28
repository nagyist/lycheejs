
lychee.define('harvester.Main').requires([
	'lychee.Input',
	'harvester.net.Admin',
	'harvester.net.Server',
	'harvester.Watcher'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _harvester     = lychee.import('harvester');
	const _clearInterval = global.clearInterval || function() {};
	const _setInterval   = global.setInterval;
	const _Emitter       = lychee.import('lychee.event.Emitter');
	const _PUBLIC_IPS    = (function() {

		let os = null;

		try {
			os = require('os');
		} catch (err) {
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
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.settings = lychee.assignunlink({ host: null, port: null, sandbox: false }, settings);
		this.defaults = lychee.assignunlink({}, this.settings);


		// Updated by Watcher instance
		this._libraries = {};
		this._projects  = {};

		this.admin   = null;
		this.server  = null;
		this.watcher = new _harvester.Watcher(this);

		this.__interval = null;


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

			let watcher = this.watcher || null;
			if (watcher !== null) {

				watcher.init(settings.sandbox);

				this.__interval = _setInterval(function() {
					watcher.update();
				}.bind(this), 30000);

			}

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

			for (let pid in this._projects) {

				let project = this._projects[pid];
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

			if (this.__interval !== null) {
				_clearInterval(this.__interval);
				this.__interval = null;
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

