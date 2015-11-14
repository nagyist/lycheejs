
lychee.define('fertilizer.template.node.Application').requires([
	'lychee.data.JSON',
	'fertilizer.data.Filesystem',
	'fertilizer.data.Shell'
]).includes([
	'fertilizer.Template'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _JSON     = lychee.data.JSON;
	var _template = attachments['tpl'].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(env, fs) {

		fertilizer.Template.call(this, env, fs);



		/*
		 * INITIALIZATION
		 */

		this.bind('configure', function(oncomplete) {
			oncomplete(true);
		}, this);

		this.bind('build', function(oncomplete) {

			var env = this.environment;
			var fs  = this.filesystem;

			if (env !== null && fs !== null) {

				console.log('fertilizer: BUILD ' + env.id);

				var blob  = _JSON.encode(env.serialize());
				var core  = this.getCore('node');
				var info  = this.getInfo(true);
				var init  = this.getInit(env.packages.map(function(pkg) { return pkg.id; }));
				var index = _template.toString();


				index = this.replace(index, {
					blob:  blob,
					build: env.build,
					core:  core,
					id:    env.id,
					info:  info,
					init:  init
				});


				fs.write('/index.js', index);

				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('package', function(oncomplete) {

			var runtime_fs = new fertilizer.data.Filesystem('/bin/runtime/node');
			var runtime_sh = new fertilizer.data.Shell('/bin/runtime/node');
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

