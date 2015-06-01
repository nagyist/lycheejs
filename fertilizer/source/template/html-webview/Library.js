
lychee.define('fertilizer.template.html-webview.Library').includes([
	'fertilizer.Template'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _template = attachments['tpl'].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(env, fs, sh) {

		fertilizer.Template.call(this, env, fs, sh);



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
				var info  = this.getInfo(true);
				var index = _template.toString();


				index = this.replace(index, '{{blob}}', blob);
				index = this.replace(index, '{{id}}',   env.id);
				index = this.replace(index, '{{info}}', info);


				fs.write('/index.js', index);

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

	};


	return Class;

});

