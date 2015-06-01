
lychee.define('fertilizer.template.html.Application').requires([
	'lychee.data.JSON'
]).includes([
	'fertilizer.Template'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _JSON      = lychee.data.JSON;
	var _templates = {
		main:  attachments['main.tpl'].buffer,
		index: attachments['index.tpl'].buffer
	};



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
				var core  = this.getCore('html');
				var info  = this.getInfo(true);
				var index = _templates['index'].toString();
				var main  = _templates['main'].toString();


				index = this.replace(index, '{{blob}}',  blob);
				index = this.replace(index, '{{id}}',    env.id);
				index = this.replace(index, '{{info}}',  info);
				index = this.replace(index, '{{build}}', env.build);

				core  = this.getInfo(false) + '\n\n' + core;
				main  = this.replace(main,  '{{id}}',    env.id);


				fs.write('/core.js',    core);
				fs.write('/index.js',   index);
				fs.write('/index.html', main);

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

