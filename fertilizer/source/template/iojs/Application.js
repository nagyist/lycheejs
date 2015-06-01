
lychee.define('fertilizer.template.iojs.Application').requires([
	'lychee.data.JSON'
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
				var core  = this.getCore('iojs');
				var info  = this.getInfo(true);
				var index = _template.toString();

				if (core !== null && index !== null) {

					index = this.replace(index, '{{core}}',  core);
					index = this.replace(index, '{{blob}}',  blob);
					index = this.replace(index, '{{id}}',    env.id);
					index = this.replace(index, '{{info}}',  info);
					index = this.replace(index, '{{build}}', env.build);


					fs.write('/index.js', index);

					oncomplete(true);

				} else {

					oncomplete(false);

				}

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('package', function(oncomplete) {
			oncomplete(true);
		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

