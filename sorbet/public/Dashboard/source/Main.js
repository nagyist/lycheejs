
lychee.define('dashboard.Main').requires([
	'dashboard.net.Client',
	'dashboard.net.Storage',
	'dashboard.state.Font',
	'dashboard.state.Project',
	'dashboard.state.Sprite',
	'dashboard.state.Welcome'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, dashboard, global, attachments) {

	/*
	 * HELPERS
	 */

	var _sync_storage = function() {

		var storage = this.storage;
		if (storage !== null) {

			for (var identifier in storage.storages) {

				var service = this.client.getService(identifier);
				if (service !== null) {
					service.sync();
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({

			title: 'Dashboard',

			client: null,

			input: {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       false,
				swipe:       false
			},

			jukebox: {
				music: true,
				sound: true
			},

			loop: {
				update: 60,
				render: 0
			},

			renderer: null,

			storage: {

			},

			viewport: {
				fullscreen: false
			}

		}, data);


		this.downloads = {};
		this.storage   = null;

		this.__initialized   = false;
		this.__synchronizing = false;


		lychee.game.Main.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * MAIN API
		 */

		load: function() {

			if (this.client !== null && this.storage !== null) {

				if (this.__synchronizing === false) {

					ui.notify('Synchronizing Storages ...');

					this.__synchronizing = true;
					_sync_storage.call(this);

					this.loop.setTimeout(5000, function() {
						this.__synchronizing = false;
					}, this);

				}

			}

		},

		init: function() {

			if (this.__initialized === true) {
				return;
			}


			var settings = this.settings;

			if (settings.client !== null) {

				this.client = new dashboard.net.Client(settings.client, this);


				var port = settings.client.port || null;
				var host = settings.client.host || null;
				if (port !== null && host !== null) {
					this.client.listen(port, host);
				}


				// Not managed by lychee.game.Main
				settings.client = null;

			}

			if (settings.storage !== null) {

				this.storage = new dashboard.net.Storage(settings.storage, this);


				// Not managed by lychee.game.Main
				settings.storage = null;

			}


			lychee.game.Main.prototype.init.call(this);


			this.setState('font',    new dashboard.state.Font(this));
			this.setState('project', new dashboard.state.Project(this));
			this.setState('sprite',  new dashboard.state.Sprite(this));
			this.setState('welcome', new dashboard.state.Welcome(this));

			this.changeState('welcome');
			this.render();


			ui.bind('menu > li:nth-child(1)', function() {
				ui.toggle('main > nav, main > section', [ 'default', 'active' ]);
			}, this, true);

			ui.bind('menu > li:nth-child(2)', function() {
				this.load();
			}, this, true);

			ui.bind('main > nav > ul.projects li', function(identifier) {

				if (identifier !== null) {

					this.changeState('project', {
						identifier: identifier
					});

					this.render();

				}

			}, this, true);

			ui.bind('main > nav > ul.tools li', function(identifier) {

				if (identifier !== null) {

					var state = this.getState(identifier);
					if (state !== null) {

						this.changeState(identifier);
						this.render();

						ui.refresh();

					} else {

						this.changeState('welcome');
						this.render();

						ui.refresh();

					}

				}

			}, this, true);


			var storage = this.storage.storages.project || null;
			if (storage !== null) {

				storage.bind('sync', function(projects) {

					var content = [];

					for (var p = 0, pl = projects.length; p < pl; p++) {

						var identifier = projects[p].identifier;
						if (identifier !== null) {
							content.push(identifier);
						}

					}

					ui.render('main > nav > ul.projects', content);

				});

				storage.sync(true);

			}


			ui.render('footer > ul', '');
			ui.notify('Loading REST data ...');

			this.__initialized = true;
			this.load();

		},



		/*
		 * CUSTOM API
		 */

		setDownload: function(identifier, buffer) {

			identifier = typeof identifier === 'string' ? identifier : null;
			buffer     = buffer instanceof Buffer       ? buffer     : null;


			if (identifier !== null) {

				this.downloads[identifier] = buffer;

				return true;

			}


			return false;

		},

		getDownload: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				var buffer = this.downloads[identifier] || null;
				if (buffer !== null) {
					return buffer;
				}

			}


			return null;

		}

	};


	return Class;

});

