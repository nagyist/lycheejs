
lychee.define('fertilizer.template.html-nwjs.Application').requires([
	'lychee.data.JSON',
	'fertilizer.data.Filesystem'
]).includes([
	'fertilizer.Template'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _JSON      = lychee.data.JSON;
	var _templates = {
		config: attachments["config.tpl"].buffer,
		icon:   attachments["icon.png"].buffer,
		index:  attachments["index.tpl"].buffer
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		fertilizer.Template.call(this, data);

		this.__config = _templates['config'].toString();
		this.__icon   = _templates['icon'];
		this.__index  = _templates['index'].toString();



		/*
		 * INITIALIZATION
		 */

		this.bind('configure', function(oncomplete) {

			var fs = this.filesystem;
			if (fs !== null) {

				console.log('fertilizer: CONFIGURE');


				var tmp        = new fertilizer.data.Filesystem(fs.root + '/../../..');
				var has_config = tmp.info('/package.json');
				var has_icon   = tmp.info('/icon.png');
				var has_index  = tmp.info('/index.html');

				if (has_config !== null) {
					this.__config = tmp.read('/package.json').toString();
				}

				if (has_icon !== null) {
					this.__icon = tmp.read('/icon.png');
				}

				if (has_index !== null) {

					this.__index = tmp.read('/index.html').toString();
					this.__index = this.__index.replace('/libraries/lychee/build/html/core.js', './core.js');

					var tmp1 = this.__index.indexOf('<script>');
					var tmp2 = this.__index.indexOf('</script>', tmp1);
					var tmp3 = _templates['index'].indexOf('<script>');
					var tmp4 = _templates['index'].indexOf('</script>', tmp3);

					if (tmp1 !== -1 && tmp2 !== -1 && tmp3 !== -1 && tmp4 !== -1) {
						var inject   = _templates['index'].substr(tmp3, tmp4 - tmp3 + 9);
						this.__index = this.__index.substr(0, tmp1) + inject + this.__index.substr(tmp2 + 9);
					}

				}

			}

			oncomplete(true);

		}, this);

		this.bind('build', function(oncomplete) {

			var env = this.environment;
			var fs  = this.filesystem;

			if (env !== null && fs !== null) {

				console.log('fertilizer: BUILD ' + env.id);

				var id      = env.id;
				var version = ('' + lychee.VERSION);

				var profile = _JSON.encode(this.profile);
				var blob    = _JSON.encode(env.serialize());
				var core    = this.getCore('html-nwjs');
				var info    = this.getInfo(true);

				var icon    = this.__icon;
				var config  = this.__config;
				var index   = this.__index;


				config = this.replace(config, {
					debug:   env.debug === true ? 'true' : 'false',
					id:      id,
					version: version
				});
				core   = this.getInfo(false) + '\n\n' + core;
				index  = this.replace(index, {
					blob:    blob,
					id:      id,
					info:    info,
					profile: profile
				});


				fs.write('/icon.png',     icon);
				fs.write('/package.json', config);
				fs.write('/core.js',      core);
				fs.write('/index.html',   index);

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

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = fertilizer.Template.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.template.html-nwjs.Application';


			return data;

		}

	};


	return Class;

});

