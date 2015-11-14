
lychee.define('fertilizer.template.html-nwjs.Application').requires([
	'lychee.data.JSON',
	'fertilizer.data.Filesystem'
]).includes([
	'fertilizer.Template'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _JSON      = lychee.data.JSON;
	var _icon      = attachments['png'];
	var _templates = {
		config: attachments['config.tpl'].buffer,
		index:  attachments['index.tpl'].buffer,
		main:   attachments['main.tpl'].buffer
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(env, fs, sh) {

		fertilizer.Template.call(this, env, fs, sh);

		this.__config = _templates['config'].toString();
		this.__index  = _templates['index'].toString();
		this.__main   = _templates['main'].toString();



		/*
		 * INITIALIZATION
		 */

		this.bind('configure', function(oncomplete) {

			var fs = this.filesystem;
			if (fs !== null) {

				console.log('fertilizer: CONFIGURE');


				var tmp        = new fertilizer.data.Filesystem(fs.root + '/../../../source');
				var has_config = tmp.info('/package.json');
				var has_main   = tmp.info('/index.html');

				if (has_config !== null) {

					this.__config = tmp.read('/package.json').toString();

				}

				if (has_main !== null) {

					this.__main = tmp.read('/index.html').toString();
					this.__main = this.__main.replace('/lib/lychee/build/html/core.js', './core.js');

				}

			}

			oncomplete(true);

		}, this);

		this.bind('build', function(oncomplete) {

			var env = this.environment;
			var fs  = this.filesystem;

			if (env !== null && fs !== null) {

				console.log('fertilizer: BUILD ' + env.id);

				var id      = env.id.split('/').pop(); id = id.charAt(0).toUpperCase() + id.substr(1);
				var blob    = _JSON.encode(env.serialize());
				var core    = this.getCore('html-nwjs');
				var info    = this.getInfo(true);
				var init    = this.getInit(env.packages.map(function(pkg) { return pkg.id; }));
				var version = ('' + lychee.VERSION).replace(/\./g, '').split('').join('.');
				var icon    = _icon.buffer;
				var config  = this.__config;
				var index   = this.__index;
				var main    = this.__main;


				config = this.replace(config, {
					debug:   env.debug === true ? 'true' : 'false',
					id:      id,
					version: version
				});
				core   = this.getInfo(false) + '\n\n' + core;
				index  = this.replace(index, {
					blob:  blob,
					build: env.build,
					id:    id,
					info:  info,
					init:  init
				});
				main   = this.replace(main, {
					id: env.id
				});


				fs.write('/icon.png',     icon);
				fs.write('/package.json', config);
				fs.write('/core.js',      core);
				fs.write('/index.js',     index);
				fs.write('/index.html',   main);

				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('package', function(oncomplete) {

			var runtime_fs = new fertilizer.data.Filesystem('/bin/runtime/html-nwjs');
			var runtime_sh = new fertilizer.data.Shell('/bin/runtime/html-nwjs');
			var project_fs = this.filesystem;
			var project_id = this.environment.id.split('/').pop();

			if (project_fs !== null) {

				console.log('fertilizer: PACKAGE ' + project_fs.root + ' ' + project_id);

				if (runtime_fs.info('/package.sh') !== null) {

					var result = runtime_sh.exec('/package.sh ' + project_fs.root + ' ' + project_id);
					if (result === true) {

						oncomplete(true);

					} else {

						runtime_sh.trace();
						oncomplete(false);

					}

				} else {

					oncomplete(false);

				}

			} else {

				oncomplete(false);

			}

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

