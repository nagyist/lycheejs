(function(global) {

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
					blob:  JSON.stringify(environment, null, '\t'),
					info:  _generate_info(environment),
					id:    environment.arguments[0].id || ''
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


				this.filesystem.copytemplate('index.file.html', 'index.html');
				this.filesystem.copytemplate('game.js',         'game.js');
				this.filesystem.copytemplate('init.js',         'init.js');


				var data = {
					blob:  JSON.stringify(environment),
					info:  _generate_info(environment),
					build: environment.arguments[0].build || 'game.Main'
				};


				var index = this.filesystem.read('index.html');
				var game  = this.filesystem.read('game.js');
				var init  = this.filesystem.read('init.js');

				game  = game.replacetemplate('{{blob}}',   data.blob);
				game  = game.replacetemplate('{{info}}',   data.info);
				init  = init.replacetemplate('{{build}}',  data.build);

				index = index.replacetemplate('{{build}}', data.build);
				index = index.replacetemplate('{{game}}',  game);
				index = index.replacetemplate('{{init}}',  init);

				this.filesystem.write('index.html', index);
				this.filesystem.remove('game.js');
				this.filesystem.remove('init.js');


				done();

			}, template);


			return true;

		} else if (template.mode === 'folder') {

			// TODO: Walk over definitions and write attachments to physical files


			template.bind('configure', function(done) {

				var environment = this.environment;
				if (environment.arguments[0].type === 'build') {
					delete environment.blob.packages;
				}


				this.filesystem.copytemplate('index.folder.html', 'index.html');
				this.filesystem.copytemplate('game.js',           'game.js');
				this.filesystem.copytemplate('init.js',           'init.js');


				var data = {
					blob:  JSON.stringify(environment),
					info:  _generate_info(environment),
					build: environment.arguments[0].build || 'game.Main'
				};


				var game  = this.filesystem.read('game.js');
				var init  = this.filesystem.read('init.js');

				game  = game.replacetemplate('{{blob}}',  data.blob);
				game  = game.replacetemplate('{{info}}',  data.info);
				init  = init.replacetemplate('{{build}}', data.build);

				this.filesystem.write('game.js',    game);
				this.filesystem.write('init.js',    init);


				done();

			}, template);


			return true;

		}


		return false;

	};

})(this);

