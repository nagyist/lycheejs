#!/usr/bin/env nodejs



var root = __dirname;
if (root.split('/').pop() === 'tool') {
	var tmp = root.split('/'); tmp.pop();
	root = tmp.join('/');
}



String.prototype.replacetemplate = function(key, value) {

	key   = typeof key === 'string'   ? key   : null;
	value = typeof value === 'string' ? value : '';


	if (key !== null) {

		var keyl = key.length;
		var keyi = this.indexOf(key);
		if (keyi !== -1) {
			return '' + this.substr(0, keyi) + value + this.substr(keyi + keyl);
		}

	}

	return this;

};



(function(lychee, arguments) {

	/*
	 * This is a hack for now.
	 * These files are required, but are not part of lycheeJS core
	 */

	var manual = (function(paths, identifiers) {

		var map = {};

		for (var p = 0, pl = paths.length; p < pl; p++) {

			require(root + '/' + paths[p]);

			var identifier  = identifiers[p];
			var definition  = lychee.environment.definitions[identifier];

			map[identifier] = definition._exports.call(definition._exports, lychee, global, definition._attaches);

		}

		return map;

	})([
		'lychee/source/event/Emitter.js'
	], [
		'lychee.event.Emitter'
	]);



	var _fs   = require('fs');
	var _path = require('path');



	/*
	 * HELPERS
	 */

	var _is_directory = function(path) {

		var result = false;

		if (typeof path === 'string') {

			try {

				var stat = _fs.statSync(path);
				if (stat.isDirectory()) {
					result = true;
				}

			} catch(e) {
			}

		}

		if (result === false) {
			console.error('tool.Fertilizer: Invalid Directory "' + path + '"');
		}

		return result;

	};

	var _is_file = function(path) {

		var result = false;

		if (typeof path === 'string') {

			try {

				var stat = _fs.statSync(path);
				if (stat.isFile()) {
					result = true;
				}

			} catch(e) {
			}

		}

		if (result === false) {
			console.error('tool.Fertilizer: Invalid File "' + path + '"');
		}

		return result;

	};

	var _EVENTS = [
		'configure',
		'make',
		'package',
		'install',
		'clean'
	];

	var _next_event = function() {

		var that    = this;
		var current = this.__current;
		var next    = null;

		if (current === null) {
			next = 'configure';
		} else {
			next = _EVENTS[_EVENTS.indexOf(current) + 1] || null;
		}


		if (next !== null) {

			this.__current = next;

			var result = this.trigger(next, [ function() {
				_next_event.call(that);
			}]);

			if (result === false) {
				_next_event.call(that);
			}

		}

	};


	var _Filesystem = function(data) {

		var settings = lychee.extend({}, data);


		this.sandbox           = '/tmp/lycheejs';
		this.__templatesandbox = '/tmp/lycheejs';


		this.setSandbox(settings.sandbox);

		settings = null;

	};


	_Filesystem.prototype = {

		copy: function(path1, path2) {

			path1 = typeof path1 === 'string' ? path1 : null;
			path2 = typeof path2 === 'string' ? path2 : null;


			if (path1 !== null && path2 !== null) {

				var result = false;
				try {

					if (_fs.existsSync(this.sandbox + '/' + path1)) {

						var buffer = _fs.readFileSync(this.sandbox + '/' + path1);
						_fs.writeFileSync(this.sandbox + '/' + path2, buffer);

						result = true;

					}

				} catch(e) {

				}

				if (result === true) {
					return true;
				}

			}


			return false;

		},

		copytemplate: function(path1, path2) {

			path1 = typeof path1 === 'string' ? path1 : null;
			path2 = typeof path2 === 'string' ? path2 : null;


			if (path1 !== null && path2 !== null) {

				var result = false;
				try {

					if (_fs.existsSync(this.__templatesandbox + '/' + path1)) {

						var buffer = _fs.readFileSync(this.__templatesandbox + '/' + path1);
						_fs.writeFileSync(this.sandbox + '/' + path2, buffer);

						result = true;

					}

				} catch(e) {

				}

				if (result === true) {
					return true;
				}

			}


			return false;

		},

		read: function(path, encoding) {

			path     =  typeof path === 'string' ? path     : null;
			encoding = encoding === 'binary'     ? 'binary' : 'utf8';


			if (path !== null) {

				var data = null;
				try {
					data = _fs.readFileSync(this.sandbox + '/' + path, encoding);
				} catch(e) {

				}

				return data;

			}


			return null;

		},

		write: function(path, data, encoding) {

			path     =  typeof path === 'string'                            ? path   : null;
			data     = (typeof data === 'string' || data instanceof Buffer) ? data   : null;
			encoding =  typeof data === 'string'                            ? 'utf8' : (encoding || 'binary');


			if (path !== null && data !== null) {

				if (path.charAt(0) === '.') {
					return false;
				}


				if (encoding === 'utf8') {

					var result = false;
					try {
						_fs.writeFileSync(this.sandbox + '/' + path, data, 'utf8');
						result = true;
					} catch(e) {

					}

					if (result === true) {
						return true;
					}

				} else if (encoding === 'binary') {

					var result = false;
					try {
						_fs.writeFileSync(this.sandbox + '/' + path, data.toString('binary'), 'binary');
						result = true;
					} catch(e) {

					}

					if (result === true) {
						return true;
					}

				}

			}


			return false;

		},

		remove: function(path) {

			path = typeof path === 'string' ? path : null;


			if (path !== null) {

				if (path.charAt(0) === '.') {
					return false;
				}


				var result = false;
				try {
					_fs.unlinkSync(this.sandbox + '/' + path);
					result = true;
				} catch(e) {

				}

				if (result === true) {
					return true;
				}

			}


			return false;

		},

		setSandbox: function(sandbox) {

			sandbox = typeof sandbox === 'string' ? sandbox : null;


			if (sandbox !== null) {

				this.sandbox = sandbox;

				return true;

			}


			return false;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Template = function(data) {

		var settings = lychee.extend({}, data);


		this.environment = null;
		this.filesystem  = new _Filesystem();
		this.mode        = 'file';
		this.sandbox     = null;

		this.__current   = null;


		// TODO: How to do this with cleaner API?
		this.filesystem.__templatesandbox = settings.template.substr(0, settings.template.length - 9);

		this.setEnvironment(settings.environment);
		this.setMode(settings.mode);
		this.setSandbox(settings.sandbox);


		manual['lychee.event.Emitter'].call(this);

		settings = null;

	};


	Template.prototype = lychee.extend({}, manual['lychee.event.Emitter'].prototype, {

		/*
		 * CUSTOM API
		 */

		build: function() {

			var current = this.__current;
			if (current === null) {
				_next_event.call(this);
			}

		},

		setEnvironment: function(environment) {

			if (environment instanceof Object) {

				this.environment = environment;

				return true;

			}


			return false;

		},

		setMode: function(mode) {

			if (mode === 'library' || mode === 'file' || mode === 'folder') {

				this.mode = mode;

				return true;

			}


			return false;

		},

		setSandbox: function(sandbox) {

			if (_is_directory(sandbox)) {

				this.filesystem.setSandbox(sandbox);
				this.sandbox = sandbox;

				return true;

			}


			return false;

		}

	});



	/*
	 * INITIALIZATION
	 */

	var settings = {
		environment: null,
		mode:        'file',
		template:    null,
		sandbox:     null,
		silent:      false
	};


	for (var a = 0, al = arguments.length; a < al; a++) {

		var argument = arguments[a].substr(2, arguments[a].length - 2).split('=');
		if (argument[0].match(/environment|sandbox|template/)) {
			settings[argument[0]] = _path.resolve(root, argument[1].replace(/"/g, ''));
		} else if (argument[0] === 'mode' && argument[1].match(/library|file|folder/g)) {
			settings[argument[0]] = argument[1].replace(/"/g, '');
		} else if (argument[0] === 'silent') {
			settings.silent = true;
		}

	}


	if (_is_file(settings.environment) && _is_file(settings.template) && _is_directory(settings.sandbox)) {

		var environment = null;
		try {
			environment = JSON.parse(_fs.readFileSync(settings.environment));
		} catch(e) {
			console.error('tool.Fertilizer: Invalid Environment File');
			environment = null;
		}


		var template = new Template({
			environment: environment,
			mode:        settings.mode,
			sandbox:     settings.sandbox,
			template:    settings.template
		});


		// Sets up bindings externally
		var supported = require(settings.template)(template);
		if (supported === true) {

			template.bind('clean', function() {

				var mode = this.mode;
				if (mode === 'library' || mode === 'file') {

					// TODO: Cache all filesystem write() actions and detect if it was an index.<ext>

					try {

						if (_fs.existsSync(settings.sandbox + '/index.html') === true) {

							var buffer = _fs.readFileSync(settings.sandbox + '/index.html');
							_fs.writeFileSync(settings.sandbox + '.html', buffer);

						} else if (_fs.existsSync(settings.sandbox + '/index.js') === true) {

							var buffer = _fs.readFileSync(settings.sandbox + '/index.js');
							_fs.writeFileSync(settings.sandbox + '.js', buffer);

						}

					} catch(e) {

					}

				}

				process.exit(0);

			}, template);

			template.build();

		} else {

			process.exit(1);

		}

	} else {

		if (settings.silent === false) {

			console.log('                                                                                        ');
			console.log('========================================================================================');
			console.log('             ,   _                                                                      ');
			console.log('            { \\/`o;====-  ,_(\'--,              lycheeJS v0.8 Fertilizer               ');
			console.log('       .----\'-/`-/          (.--; ,--\')_,                                             ');
			console.log('        `\'-..-| /               | ;--.)     @     (Project Builder)                    ');
			console.log('             /\\/\\           .-. |.| .-.    <|>                             *O*        ');
			console.log('             `--`               \|\|/         |                              \\|/       ');
			console.log('  ^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^   ');
			console.log('                                                                                        ');
			console.log('                                                                                        ');
			console.log('Parameters:                                                                             ');
			console.log('                                                                                        ');
			console.log('   --environment="./path/to/lychee.env"          lychee.Environment File     (required) ');
			console.log('   --sandbox="./projects/boilerplate/sandbox"    Build Sandbox Folder        (required) ');
			console.log('   --template="./templates/nodejs/index.js"      Build Template              (required) ');
			console.log('   --mode=<library | file | folder>              Build Mode                  (optional) ');
			console.log('                                                                                        ');
			console.log('Important:                                                                              ');
			console.log('                                                                                        ');
			console.log('- lychee.Environment File has to have the same platform-specific tags as Build Template.');
			console.log('- "library" Build Mode will output a compressed file ready for inclusion.               ');
			console.log('- "file" Build Mode will output a compressed file containing all assets and boot code.  ');
			console.log('- "folder" Build Mode will output a folder with subfolders for all assets and boot code.');
			console.log('                                                                                        ');
			console.log('Examples:                                                                               ');
			console.log('                                                                                        ');
			console.log('./tool/fertilizer.js --environment="./lychee/build/main.nodejs/lychee.env" --template="./templates/nodejs/index.js" --sandbox="./example"');
			console.log('                                                                                        ');

		}


		process.exit(1);

	}

})(require(root + '/lychee/build/nodejs/core.js')(root), [].slice.call(process.argv, 2));

