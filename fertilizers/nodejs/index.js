(function(global) {

	/*
	 * HELPERS
	 */

	var _generate_info = function(environment) {

		var info = [];

		info.push('/*');
		info.push(' * lycheeJS ' + lychee.VERSION);
		info.push(' * ');
		info.push(' * ' + JSON.stringify(environment.arguments[0].tags));
		info.push(' * ');

		var definitions = Object.keys(environment.blob.definitions);
		if (definitions.length > 0) {

			definitions.sort(function(a, b) {
				if (a < b) return -1;
				if (a > b) return  1;
				return 0;
			});

			for (var d = 0, dl = definitions.length; d < dl; d++) {
				info.push(' * ' + definitions[d]);
			}

		}

		info.push(' */');

		return info.join('\n');

	};



	/*
	 * IMPLEMENTATION
	 */

	module.exports = function(template) {

		if (template.mode === 'library') {

			template.bind('configure', function(done) {

				var environment = this.environment;
				if (environment.arguments[0].type === 'build') {
					delete environment.blob.packages;
				}


				if (environment.arguments[0].sandbox === true) {
					environment.arguments[0].sandbox = false;
				}


				this.filesystem.copytemplate('index.library.js', 'index.js');


				var data = {
					blob: JSON.stringify(environment),
					info: _generate_info(environment),
					id:   environment.arguments[0].id || ''
				};


				var index = this.filesystem.read('index.js');

				index = index.replacetemplate('{{blob}}', data.blob);
				index = index.replacetemplate('{{info}}', data.info);
				index = index.replacetemplate('{{id}}',   data.id);

				this.filesystem.write('index.js', index);


				done();

			}, template);


			return true;

		} else if (template.mode === 'file') {

			template.bind('configure', function(done) {


				var environment = this.environment;
				if (environment.arguments[0].type === 'build') {
					delete environment.blob.packages;
				}


				this.filesystem.copytemplate('index.file.js', 'index.js');


				var data = {
					blob:  JSON.stringify(environment),
					info:  _generate_info(environment),
					build: environment.arguments[0].build || 'game.Main'
				};


				var index = this.filesystem.read('index.js');

				index = index.replacetemplate('{{blob}}',  data.blob);
				index = index.replacetemplate('{{info}}',  data.info);
				index = index.replacetemplate('{{build}}', data.build);

				this.filesystem.write('index.js', index);


				done();

			}, template);


			return true;

		}


		return false;

	};

})(this);

