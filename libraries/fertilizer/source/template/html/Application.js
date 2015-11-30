
lychee.define('fertilizer.template.html.Application').requires([
	'lychee.data.JSON'
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

				var profile = _JSON.encode(this.profile);
				var blob    = _JSON.encode(env.serialize());
				var core    = this.getCore('html');
				var info    = this.getInfo(true);

				var index   = _template.toString();


				core  = this.getInfo(false) + '\n\n' + core;
				index = this.replace(index, {
					blob:    blob,
					id:      id,
					info:    info,
					profile: profile
				});


				fs.write('/core.js',    core);
				fs.write('/index.html', index);

				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('package', function(oncomplete) {
			oncomplete(true);
		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = fertilizer.Template.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.template.html.Application';


			return data;

		}

	};


	return Class;

});

