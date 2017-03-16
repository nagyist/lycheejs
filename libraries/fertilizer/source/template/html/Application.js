
lychee.define('fertilizer.template.html.Application').includes([
	'fertilizer.Template'
]).exports(function(lychee, global, attachments) {

	const _Template  = lychee.import('fertilizer.Template');
	const _TEMPLATES = {
		config:   attachments["config.tpl"],
		appcache: attachments["appcache.tpl"],
		core:     null,
		icon:     attachments["icon.png"],
		index:    attachments["index.tpl"]
	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		_Template.call(this, data);


		this.__appcache = lychee.deserialize(lychee.serialize(_TEMPLATES.appcache));
		this.__config   = lychee.deserialize(lychee.serialize(_TEMPLATES.config));
		this.__core     = lychee.deserialize(lychee.serialize(_TEMPLATES.core));
		this.__icon     = lychee.deserialize(lychee.serialize(_TEMPLATES.icon));
		this.__index    = lychee.deserialize(lychee.serialize(_TEMPLATES.index));



		/*
		 * INITIALIZATION
		 */

		this.bind('configure', function(oncomplete) {

			console.log('fertilizer: CONFIGURE');


			let that   = this;
			let load   = 3;
			let config = this.stash.read('./manifest.json');
			let core   = this.stash.read('/libraries/lychee/build/html/core.js');
			let icon   = this.stash.read('./icon.png');

			if (config !== null) {

				config.onload = function(result) {

					if (result === true) {
						that.__config = this;
					}

					if ((--load) === 0) {
						oncomplete(true);
					}

				};

				config.load();

			}

			if (core !== null) {

				core.onload = function(result) {

					if (result === true) {
						that.__core = this;
					}

					if ((--load) === 0) {
						oncomplete(true);
					}

				};

				core.load();

			}

			if (icon !== null) {

				icon.onload = function(result) {

					if (result === true) {
						that.__icon = this;
					}

					if ((--load) === 0) {
						oncomplete(true);
					}

				};

				icon.load();

			}


			if (config === null && core === null && icon === null) {
				oncomplete(false);
			}

		}, this);

		this.bind('build', function(oncomplete) {

			let env   = this.environment;
			let stash = this.stash;

			if (env !== null && stash !== null) {

				console.log('fertilizer: BUILD ' + env.id);


				let sandbox  = this.sandbox;
				let appcache = this.__appcache;
				let config   = this.__config;
				let core     = this.__core;
				let icon     = this.__icon;
				let index    = this.__index;


				if (!(config instanceof Config)) {

					config        = new Config();
					config.buffer = JSON.parse(_TEMPLATES.config.buffer.replaceObject({
						debug:   env.debug,
						id:      env.id,
						version: lychee.VERSION
					}));

				}

				index.buffer = index.buffer.replaceObject({
					blob:    env.serialize(),
					id:      env.id,
					profile: this.profile
				});


				stash.write(sandbox + '/manifest.json',  config);
				stash.write(sandbox + '/core.js',        core);
				stash.write(sandbox + '/icon.png',       icon);
				stash.write(sandbox + '/index.appcache', appcache);
				stash.write(sandbox + '/index.html',     index);


				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('package', function(oncomplete) {
			console.log('fertilizer: PACKAGE');
			oncomplete(true);
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Template.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.template.html.Application';


			return data;

		}

	};


	return Composite;

});

