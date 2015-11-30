
lychee.define('fertilizer.template.node.Application').requires([
	'lychee.data.JSON',
	'fertilizer.data.Filesystem',
	'fertilizer.data.Shell'
]).includes([
	'fertilizer.Template'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _JSON     = lychee.data.JSON;
	var _template = attachments["tpl"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		fertilizer.Template.call(this, data);



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

				var id      = env.id;
				var version = ('' + lychee.VERSION);

				var profile = this.profile;
				var blob  = _JSON.encode(env.serialize());
				var core  = this.getCore('node');
				var info  = this.getInfo(true);

				var index = _template.toString();


				core  = this.getInfo(false) + '\n\n' + core;
				index = this.replace(index, {
					blob:    blob,
					core:    core,
					id:      id,
					init:    init,
					profile: profile
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

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = fertilizer.Template.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.template.node.Application';


			return data;

		}

	};


	return Class;

});

