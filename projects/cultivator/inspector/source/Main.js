
lychee.define('inspector.Main').requires([
	'inspector.state.Overview',
	'inspector.state.Asset',
	'inspector.state.Definition'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, inspector, global, attachments) {

	/*
	 * HELPERS
	 */

	var _parse_environment = function(environment) {

		var packages = [];

		environment.blob.packages.forEach(function(data) {

			packages.push({
				id:  data.arguments[0],
				url: data.arguments[1]
			});

		});


		var assets = [];

		Object.keys(environment.blob.definitions).forEach(function(id) {

			if (environment.blob.definitions[id].blob.attaches instanceof Object) {

				var attachments = Object.keys(environment.blob.definitions[id].blob.attaches);
				if (attachments.length > 0) {

					attachments.forEach(function(ext) {

						var asset = environment.blob.definitions[id].blob.attaches[ext];
						if (asset instanceof Object) {

							if (typeof asset.constructor === 'string') {

								if (asset.constructor === 'Object') {

									assets.push({
										type:   asset.constructor,
										url:    asset.arguments[0].url    || '(unknown URL)',
										buffer: asset.arguments[0].buffer || null
									});

								} else {

									assets.push({
										type:   asset.constructor,
										url:    asset.arguments[0] || '(injected Buffer)',
										buffer: (asset.blob instanceof Object) ? (asset.blob.buffer || null) : null
									});

								}

							}

						}

					});

				}

			}

		});


		var definitions = [];

		Object.keys(environment.blob.definitions).forEach(function(id) {

			var data     = environment.blob.definitions[id];
			var attaches = [];

			if (data.blob.attaches instanceof Object) {

				Object.keys(data.blob.attaches).forEach(function(assetid) {
					attaches.push(data.blob.attaches[assetid].arguments[0]);
				});

			}

			definitions.push({
				id:       id,
				origin:   data.arguments[0],
				tags:     data.blob.tags     || null,
				attaches: attaches           || null,
				includes: data.blob.includes || null,
				requires: data.blob.requires || null,
				supports: data.blob.supports || null,
				exports:  data.blob.exports  || null
			});

		});


		var settings = {};

		Object.keys(environment.arguments[0]).forEach(function(key) {
			settings[key] = environment.arguments[0][key];
		});


		return {
			url:         environment.url,
			settings:    settings,
			assets:      assets,
			definitions: definitions,
			packages:    packages
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(parameters) {


		this.environment = null;


		lychee.game.Main.call(this, {

			client:   null,
			server:   null,
			renderer: null,

			input: {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       true,
				swipe:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			viewport: {
				fullscreen: false
			}

		});


		this.bind('load', function() {
			this.settings.client     = null;
		}, this, true);

		this.bind('init', function() {

			this.setState('asset',      new inspector.state.Asset(this));
			this.setState('definition', new inspector.state.Definition(this));
			this.setState('overview',   new inspector.state.Overview(this));


			var url = parameters.url;
			if (typeof url === 'string') {

				var that        = this;
				var environment = new Config(url);

				environment.onload = function(result) {

					if (result === true) {
						this.buffer.url = url;
						that.setEnvironment(this.buffer);
						that.changeState('overview');
					} else {
						that.getState('overview').deserialize(null);
						that.changeState('overview');
					}

				};

				environment.load();

			} else {
				this.getState('overview').deserialize(null);
				this.changeState('overview');
			}

		}, this, true);

	};


	Class.prototype = {

		/*
		 * MAIN API
		 */

		changeState: function(id) {

			var result = lychee.game.Main.prototype.changeState.call(this, id);
			if (result === true) {

				var navi = [].slice.call(document.querySelectorAll('body > menu > li > a'));
				if (navi.length > 0) {

					navi.forEach(function(item) {

						var label = item.innerHTML + '';
						if (label === id.charAt(0).toUpperCase() + id.substr(1) + 's') {
							item.className = 'active';
						} else {
							item.className = '';
						}

					});

				}

			}


			return result;

		},



		/*
		 * CUSTOM API
		 */

		setEnvironment: function(environment) {

			if (environment instanceof Object) {

				if (environment.constructor === 'lychee.Environment' && environment.arguments instanceof Array) {

					var data = _parse_environment(environment);
					if (data !== null) {

						for (var id in this.__states) {
							this.__states[id].deserialize(data);
						}

					}


					return true;

				}

			}


			return false;

		}

	};


	return Class;

});
