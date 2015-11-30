
lychee.define('fertilizer.Main').requires([
	'lychee.Input',
	'lychee.data.JSON',
	'fertilizer.data.Filesystem',
	'fertilizer.data.Shell',
	'fertilizer.template.html.Application',
	'fertilizer.template.html.Library',
	'fertilizer.template.html-nwjs.Application',
	'fertilizer.template.html-nwjs.Library',
	'fertilizer.template.html-webview.Application',
	'fertilizer.template.html-webview.Library',
	'fertilizer.template.node.Application',
	'fertilizer.template.node.Library'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _lychee = lychee;
	var _JSON   = lychee.data.JSON;



	/*
	 * FEATURE DETECTION
	 */

	var _defaults = {

		project:    null,
		identifier: null,
		settings:   null

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		this.settings = lychee.extendunlink({}, _defaults, settings);
		this.defaults = lychee.extendunlink({}, this.settings);


		lychee.event.Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			var identifier = this.settings.identifier || null;
			var project    = this.settings.project    || null;
			var data       = this.settings.settings   || null;

			if (identifier !== null && project !== null && data !== null) {


				lychee.ROOT.project = project;


				var platform = data.tags.platform[0] || null;
				var variant  = data.variant || null;
				var settings = _JSON.decode(_JSON.encode(lychee.extend({}, data, {
					debug:   false,
					sandbox: true,
					type:    'export'
				})));


				var profile = {};
				if (settings.profile instanceof Object) {
					profile = settings.profile;
				}


				if (platform !== null && variant.match(/application|library/)) {

					if (settings.packages instanceof Array) {

						settings.packages = settings.packages.map(function(pkg) {

							var id   = pkg[0];
							var path = lychee.environment.resolve(pkg[1]);

							return [ id, path ];

						});

					}


					var that        = this;
					var environment = new lychee.Environment(settings);


					_lychee.setEnvironment(environment);


					environment.debug = true;
					environment.init(function(sandbox) {

						if (sandbox !== null) {

							// IMPORTANT: Don't use Environment's imperative API here!
							// Environment identifier is /libraries/lychee/main instead of /libraries/lychee/html/main

							environment.id      = project + '/' + identifier.split('/').pop();
							environment.type    = 'build';
							environment.debug   = that.defaults.settings.debug;
							environment.sandbox = that.defaults.settings.sandbox;


							_lychee.setEnvironment(null);


							that.trigger('init', [ project, identifier, platform, variant, environment, profile ]);

						} else {

							console.error('fertilizer: FAILURE ("' + project + ' | ' + identifier + '") at "load" event');

							if (typeof environment.global.console.serialize === 'function') {

								var debug = environment.global.console.serialize();
								if (debug.blob !== null) {

									(debug.blob.stderr || '').trim().split('\n').map(function(line) {
										return (line.indexOf(':') !== -1 ? line.split(':')[1].trim() : '');
									}).forEach(function(line) {
										console.error('fertilizer: ' + line);
									});

								}

							}


							that.destroy();

						}

					});


					return true;

				}

			}


			console.error('fertilizer: FAILURE ("' + project + ' | ' + identifier + '") at "load" event');
			this.destroy();


			return false;

		}, this, true);

		this.bind('init', function(project, identifier, platform, variant, environment, profile) {

			if (typeof fertilizer.template[platform] === 'object') {

				var construct = fertilizer.template[platform][variant.charAt(0).toUpperCase() + variant.substr(1).toLowerCase()] || null;
				if (construct !== null) {

					var template = new construct({
						environment: environment,
						profile:     profile,
						filesystem:  new fertilizer.data.Filesystem(project + '/build/' + identifier),
						shell:       new fertilizer.data.Shell(project + '/build/' + identifier)
					});

					template.then('configure');
					template.then('build');
					template.then('package');

					template.bind('complete', function() {

						console.info('fertilizer: SUCCESS ("' + project + ' | ' + identifier + '")');
						this.destroy();

					}, this);

					template.bind('error', function(event) {

						console.error('fertilizer: FAILURE ("' + project + ' | ' + identifier + '") at "' + event + '" event');
						this.destroy();

					}, this);


					template.init();

					return true;

				}

			}


			console.error('fertilizer: FAILURE ("' + project + ' | ' + identifier + '") at "init" event');
			this.destroy();


			return false;

		}, this, true);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.Main';


			var settings = lychee.extendunlink({}, this.settings);
			var blob     = data['blob'] || {};


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load');

		},

		destroy: function() {

			this.trigger('destroy');

		}

	};


	return Class;

});

