
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
]).exports(function(lychee, sorbet, global, attachments) {

	var _lychee = lychee;
	var _path   = require('path');
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

		var that = this;


		this.bind('load', function() {

			var identifier = this.settings.identifier || null;
			var project    = this.settings.project    || null;
			var data       = this.settings.settings   || null;

			if (identifier !== null && project !== null && data !== null) {

				var platform = data.tags.platform[0] || null;
				var variant  = data.variant || null;
				var settings = _JSON.decode(_JSON.encode(lychee.extend({}, data, {
					debug:   false,
					sandbox: true,
					type:    'export'
				})));


				if (platform !== null && variant.match(/application|library/)) {

					if (settings.packages instanceof Array) {

						settings.packages = settings.packages.map(function(pkg, index) {

							var id   = pkg[0];
							var path = _path.resolve('/projects/' + project, pkg[1]);

							return [ id, path ];

						});

					}


					var that        = this;
					var environment = new lychee.Environment(settings);


					_lychee.setEnvironment(environment);

					_lychee.init(function(sandbox) {

						if (sandbox !== null) {

							// IMPORTANT: Don't use Environment's imperative API here!

							environment.id      = project;
							environment.type    = 'build';
							environment.debug   = that.defaults.settings.debug;
							environment.sandbox = that.defaults.settings.sandbox;


							_lychee.setEnvironment(null);


							that.trigger('init', [ project, identifier, platform, variant, environment ]);

						} else {

							if (lychee.debug === true) {
								console.error('fertilizer: FAILURE ("' + project + '/' + identifier + '") at "load" event');
							}

							that.destroy();

						}

					});


					return true;

				}

			}


			console.error('fertilizer: FAILURE ("' + project + '/' + identifier + '") at "load" event');

			this.destroy();


			return false;

		}, this, true);

		this.bind('init', function(project, identifier, platform, variant, environment) {

			if (typeof fertilizer.template[platform] === 'object') {

				var construct = fertilizer.template[platform][variant.charAt(0).toUpperCase() + variant.substr(1).toLowerCase()] || null;
				if (construct !== null) {

					var root = '/projects/' + project;
					if (project.match(/breeder|fertilizer|lychee|sorbet/g)) {
						root = '/lib/' + project;
					}


					var template = new construct(
						environment,
						new fertilizer.data.Filesystem(root + '/build/' + identifier),
						new fertilizer.data.Shell(root + '/build/' + identifier)
					);

					template.then('configure');
					template.then('build');
					template.then('package');

					template.bind('complete', function() {

						if (lychee.debug === true) {
							console.info('fertilizer: SUCCESS ("' + project + '/' + identifier + '")');
						}

						this.destroy();

					}, this);

					template.bind('error', function(event) {

						if (lychee.debug === true) {
							console.error('fertilizer: FAILURE ("' + project + '/' + identifier + '") at "' + event + '" event');
						}

						this.destroy();

					}, this);

					template.init();


					return true;

				}

			}


			this.destroy();

			return false;

		}, this, true);

	};


	Class.prototype = {

		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load', []);

		},

		destroy: function() {

			this.trigger('destroy', []);

		}

	};


	return Class;

});

