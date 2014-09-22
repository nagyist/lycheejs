
lychee.define('sorbet.module.Fertilizer').requires([
	'sorbet.data.Queue'
]).exports(function(lychee, sorbet, global, attachments) {

	var _child_process = require('child_process');
	var _fs            = require('fs');
	var _lychee        = global.lychee;



	/*
	 * HELPERS
	 */

	var _remove_directory = function(path) {

		if (_fs.existsSync(path)) {

			_fs.readdirSync(path).forEach(function(file, index) {

				var subpath = path + '/' + file;
				if (_fs.lstatSync(subpath).isDirectory()) {
					_remove_directory(subpath);
				} else {
					_fs.unlinkSync(subpath);
				}

			});

			_fs.rmdirSync(path);

		}

	};

	var _refresh = function(vhost) {

		if (lychee.debug === true) {
			console.log('sorbet.module.Fertilizer: Refreshing VHost "' + vhost.id + '"');
		}


		var found = false;

		for (var id in vhost.projects) {

			var project = vhost.projects[id];
			if (Object.keys(project.builds).length > 0) {

				if (vhost.fs.isDirectory(project.root[0] + '/build') === false) {
					vhost.fs.mkdir(project.root[0] + '/build');
				}


				for (var name in project.builds) {

					this.queue.add({
						id:       project.id + '/' + name,
						vhost:    vhost,
						root:     project.root[0],
						name:     name,
						settings: project.builds[name]
					});

				}


				if (Object.keys(project.builds).length > 0) {
					found = true;
				}

			}

		}


		// This disables spoofing the CI process whilst requesting a 404 file
		if (found === true) {
			vhost.unbind('refresh', _refresh, this);
		}

	};

	var _build_project = function(project) {

		var mode = project.settings.type === 'library' ? 'library' : 'file';

		// Unlinking is necessary, so the lychee.Environment instance can't link internals to the settings
		var settings = JSON.parse(JSON.stringify(lychee.extend({}, project.settings, {
			debug:   true,
			sandbox: true,
			type:    'export'
		})));


		var fertilizerpath = this.main.root + '/fertilizers/' + settings.tags.platform[0] + '/index.js';
		if (_fs.existsSync(fertilizerpath) === true) {

			if (lychee.debug === true) {
				console.log('sorbet.module.Fertilizer: Building Environment "' + project.id + '" as "' + mode + '"');
			}


			var that        = this;
			var environment = new lychee.Environment(settings);


			_lychee.setEnvironment(environment);

			_lychee.init(function(sandbox) {

				environment.id      = project.id;
				environment.type    = 'build';
				environment.debug   = project.settings.debug;
				environment.sandbox = project.settings.sandbox;


				_build_project_via_template.call(that, {
					project:     project,
					environment: environment
				}, mode);


				_lychee.setEnvironment(null);

			});


			return true;

		} else {

			this.queue.flush();

		}


		return false;

	};

	var _build_project_via_template = function(data, mode) {

		if ('platform' in data.environment.tags) {

			var platform         = data.environment.tags.platform[0];
			var fertilizerdaemon = this.main.root    + '/tool/Fertilizer.js';
			var environmentpath  = data.project.root + '/build/' + data.project.name + '/lychee.env';
			var sandboxpath      = data.project.root + '/build/' + data.project.name;
			var fertilizerpath   = this.main.root    + '/fertilizers/' + platform;


			data.project.vhost.fs.remove(sandboxpath);
			data.project.vhost.fs.mkdir(sandboxpath);


			if (_fs.existsSync(fertilizerdaemon) && _fs.existsSync(sandboxpath) && _fs.existsSync(fertilizerpath + '/index.js')) {

				var that = this;
				var root = this.main.root;
				var json = JSON.stringify(data.environment.serialize(), null, '\t');


				// 1. Execute Fertilizer Daemon in File Mode
				_fs.writeFileSync(environmentpath,             json);
				_fs.writeFileSync(sandboxpath + '.lychee.env', json);

				_child_process.fork(fertilizerdaemon, [
					mode,
					'--environment="' + environmentpath + '"',
					'--fertilizer="'  + fertilizerpath  + '"',
					'--sandbox="'     + sandboxpath     + '"'
				], {
					cwd: root
				}).on('exit', function(code) {

					if (code === 1) {

						if (lychee.debug === true) {
							console.warn('sorbet.module.Fertilizer: Environment "' + data.project.id + '" has no support for (' + platform + ' / ' + mode + ')');
						}

					}


					// 3 Build Modes: library, file and folder
					// - file triggers auto-build for folder
					// - library doesn't trigger auto-build for folder
					if (mode === 'library') {

						_remove_directory(sandboxpath);

						that.queue.flush();

					} else if (mode === 'file') {

						_remove_directory(sandboxpath);
						_build_project_via_template.call(that, data, 'folder');

					} else if (mode === 'folder') {

						if (code === 1) {
							_remove_directory(sandboxpath);
						}

						that.queue.flush();

					}

				});


				return true;

			} else {

				if (lychee.debug === true) {
					console.warn('sorbet.module.Fertilizer: Invalid Environment "' + data.project.name + '" (' + platform + ' / ' + mode + ')');
				}

			}

		}


		this.queue.flush();

		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id    = 'Fertilizer';
		this.main  = main || null;

		this.queue = new sorbet.data.Queue();
		this.queue.bind('update', _build_project, this);



		/*
		 * INITIALIZATION
		 */

		var vhosts = this.main.vhosts.values();
		for (var v = 0, vl = vhosts.length; v < vl; v++) {
			vhosts[v].bind('#refresh', _refresh, this);
		}

	};


	Class.prototype = {

		destroy: function() {

			var vhosts = this.main.vhosts.values();
			for (var v = 0, vl = vhosts.length; v < vl; v++) {
				vhosts[v].unbind('refresh', _refresh, this);
			}

			this.queue.destroy();

		},

		process: function(host, response, data) {
			return false;
		}

	};


	return Class;

});

