#!/usr/bin/env nodejs

(function() {

	(function() {

		if (typeof String.prototype.trim !== 'function') {

			String.prototype.trim = function() {
				return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
			};

		}

	})();



	var _fs      = require('fs');
	var _package = null;
	var _path    = require('path');
	var _root    = _path.resolve(process.cwd(), '.');



	/*
	 * HELPERS
	 */

	var _mkdir_p = function(path, mode) {

		path = _path.resolve(path);

		if (mode === undefined) {
			mode = 0777 & (~process.umask());
		}


		try {

			if (_fs.statSync(path).isDirectory()) {
				return true;
			} else {
				return false;
			}

		} catch(err) {

			if (err.code === 'ENOENT') {

				_mkdir_p(_path.dirname(path), mode);
				_fs.mkdirSync(path, mode);

				return true;

			}

		}

	};

	var _parse_documentation_line = function(text) {

		var index = text.indexOf('*');
		var open  = false;

		while (index !== -1) {

			text = text.substr(0, index) + (open === false ? '<em>' : '</em>') + text.substr(index + 1);
			open = !open;

			index = text.indexOf('*');

		}


		text = text.replace(/\[([^\]]+)\]\(([^)"]+)(?: \"([^\"]+)\")?\)/, '<a href="$2">$1</a>');


		return text;

	};

	var _parse_documentation = function(content) {

		if (content && !content.toString) {
			return null;
		}


		var open = {
			article: false,
			ul:      false,
			li:      false,
			pre:     false,
			p:       false
		};


		var source = content.toString().split('\n');
		var length = source.length;
		var result = source.map(function(line, index) {

			if (line.charAt(0) === '=') {

				line = '<article id="' + line.substr(2, line.length - 3).trim() + '">';

				if (open.article === true) {
					line = '</article>\n\n' + line;
					open.article = false;
				}

				open.article = true;

			} else if (line.substr(0, 3) === '###') {

				line = '\t<h3>' + line.substr(4) + '</h3>';

			} else if (line.substr(0, 2) === '##') {

				line = '\t<h2>' + line.substr(3) + '</h2>';

			} else if (line.substr(0, 1) === '#') {

				line = '\t<h1>' + line.substr(2) + '</h1>';

			} else if (line.substr(0, 3) === '```') {

				if (open.pre === false) {
					line = '\t<pre class="' + line.substr(3) + '">';
					open.pre = true;
				} else {
					line = '\t</pre>';
					open.pre = false;
				}

			} else if (line.charAt(0) === '-') {

				if (open.ul === false) {
					line = '\t<ul>\n\t\t<li>\n\t\t\t' + _parse_documentation_line(line.substr(2));
					// + '</li>';
					open.ul = true;
					open.li = true;
				} else {
					line = '\t\t<li>\n\t\t\t' + _parse_documentation_line(line.substr(2));
					// + '</li>';
					open.li = true;
				}

			} else if (line !== '' && open.li === true) {

				line = '\t\t\t' + line;

			} else if (line !== '' && open.pre === true) {

				line = line.replace(/\t/g, '  ');

			} else if (line !== '' && open.pre === false && open.ul === false) {

				if (open.p === false) {
					line = '\t<p>\n\t\t' + _parse_documentation_line(line);
					open.p = true;
				} else {
					// Do nothing
					line = '\t\t' + _parse_documentation_line(line);
				}

			} else if (line === '') {

				if (open.li === true) {
					line += '\t\t</li>\n';
					open.li = false;
				}

				if (open.ul === true) {
					line += '\t</ul>\n';
					open.ul = false;
				}

				if (open.p === true) {
					line += '\t</p>\n';
					open.p = false;
				}


				if (index === length - 1) {

					if (open.article === true) {
						line += '</article>';
					}

				}

			}


			return line;

		});


		return result.join('\n');

	};



	/*
	 * 0: ENVIRONMENT CHECK
	 */

	(function() {

		var errors = 0;

		console.log('> Checking Environment');


		if (_fs.existsSync(_path.resolve(_root, './lychee')) === true) {
			console.log('\tprocess cwd: OKAY');
		} else {
			console.log('\tprocess cwd: FAIL (' + _root + ' is not the lycheeJS directory)');
			errors++;
		}


		var data = null;

		if (_fs.existsSync(_path.resolve(_root, './lychee/lychee.pkg')) === true) {

			try {
				data = JSON.parse(_fs.readFileSync(_path.resolve(_root, './lychee/lychee.pkg')));
			} catch(e) {
				data = null;
			}

		}


		if (data !== null) {
			_package = data;
			console.log('\tlychee.pkg: OKAY');
		} else {
			console.log('\tlychee.pkg: FAIL (Invalid JSON)');
			errors++;
		}


		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})();



	/*
	 * 1: CORE GENERATION
	 */

	var _core      = '';
	var _bootstrap = {};

	(function(files) {

		var errors = 0;

		console.log('> Generating lycheeJS core');


		files.forEach(function(file) {

			var path = _path.resolve(_root, './lychee/source/core/' + file);
			if (_fs.existsSync(path) === true) {
				_core += _fs.readFileSync(path, 'utf8');
			} else {
				errors++;
			}

		});


		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})([
		'lychee.js',
		'Debugger.js',
		'Definition.js',
		'Environment.js',
		'Package.js'
	]);



	/*
	 * 2: PLATFORM GENERATION
	 */

	(function(platforms, files) {

		var errors = 0;

		console.log('> Generating lycheeJS platform adapters');


		platforms.forEach(function(platform) {

			_bootstrap[platform] = {};


			var base = platform.indexOf('-') ? platform.split('-')[0] : null;
			if (base !== null) {

				for (var file in _bootstrap[base]) {
					_bootstrap[platform][file] = _bootstrap[base][file];
				}

			}


			var result = true;

			files.forEach(function(file) {

				var path = _path.resolve(_root, './lychee/source/platform/' + platform + '/' + file);
				if (_fs.existsSync(path) === true) {
					_bootstrap[platform][file] = _fs.readFileSync(path, 'utf8');
				} else {
					result = false;
				}

			});


			if (result === true) {
				console.log('\t' + platform + ': OKAY');
			} else {
				console.log('~\t' + platform + ': SKIP (Empty platform adapter variant)');
			}

		});


		platforms.forEach(function(platform) {

			if (Object.keys(_bootstrap[platform]).length === 0) {
				delete _bootstrap[platform];
			}

		});


		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})([
		'html',
		'html-nw',
		'html-webgl',
		'nodejs',
		'nodejs-sdl',
		'nodejs-webgl'
	], [
		'bootstrap.js',
		'Input.js',
		'Renderer.js',
		'Storage.js',
		'Viewport.js'
	]);


	(function(core, bootstrap) {

		var errors = 0;

		console.log('> Storing lycheeJS platform adapters');


		for (var platform in bootstrap) {

			var code = '' + core;

			for (var file in bootstrap[platform]) {
				code += bootstrap[platform][file];
			}


			var dir    = _path.resolve(_root, './lychee/build/' + platform);
			var path   = _path.resolve(_root, './lychee/build/' + platform + '/core.js');
			var result = true;

			if (_fs.existsSync(dir) === false) {
				_mkdir_p(dir);
			}


			if (_fs.existsSync(dir) === true) {

				try {
					_fs.writeFileSync(path, code, 'utf8');
				} catch(e) {
					result = false;
				}

			} else {
				result = false;
			}


			if (result === false) {
				console.log('\t' + platform + ': FAIL (Could not write to "' + path + '")');
				errors++;
			} else {
				console.log('\t' + platform + ': OKAY');
			}

		}


		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
		}

	})(_core, _bootstrap);



	/*
	 * 3: API DOC GENERATION
	 */

	(function(files) {

		var errors = 0;

		console.log('> Documenting lycheeJS API');


		var platform = files.filter(function(value) { return value.substr(0, 8) === 'platform'; });
		var normal   = files.filter(function(value) { return value.substr(0, 8) !== 'platform'; });


		normal.forEach(function(file) {

			var classid = 'lychee.' + (file.substr(0, 4) === 'core' ? file.substr(5, file.length - 8) : file.substr(0, file.length - 3)).split('/').join('.');
			if (classid === 'lychee.lychee') classid = 'lychee';

			var pathid  = file.substr(0, file.length - 3).split('/').join('.');
			var apipath = _path.resolve(_root, './lychee/api/'  + pathid.split('.').join('/')  + '.md');
			var docpath = _path.resolve(_root, './lychee/docs/' + classid.split('.').join('-') + '.html');


			var result = false;

			if (_fs.existsSync(apipath) === true) {

				var content = _parse_documentation(_fs.readFileSync(apipath));
				if (content !== null) {

					if (_fs.existsSync(_path.dirname(docpath)) === false) {
						_mkdir_p(_path.dirname(docpath));
					}

					if (_fs.existsSync(_path.dirname(docpath)) === true) {

						try {
							_fs.writeFileSync(docpath, content, 'utf8');
							result = true;
						} catch(e) {
							result = false;
						}

					}

				}

			}


			if (result === true) {
				console.log('\t' + classid + ': OKAY');
			} else {
				console.log('~\t' + classid + ': SKIP');
			}

		});


		var filtered = {};

		platform.forEach(function(value) {

			var index = value.indexOf('/', 9) + 1;
			if (index !== 0) {
				filtered[value.substr(index)] = true;
			}

		});

		Object.keys(filtered).forEach(function(file) {

			var classid = 'lychee.' + file.substr(0, file.length - 3).split('/').join('.');
			var pathid  = ((file.indexOf('/') !== -1 ? '' : 'core/') + file.substr(0, file.length - 3)).split('/').join('.');

			var apipath = _path.resolve(_root, './lychee/api/'  + pathid.split('.').join('/')  + '.md');
			var docpath = _path.resolve(_root, './lychee/docs/' + classid.split('.').join('-') + '.html');


			var result = false;

			if (_fs.existsSync(apipath) === true) {

				var content = _parse_documentation(_fs.readFileSync(apipath));
				if (content !== null) {

					if (_fs.existsSync(_path.dirname(docpath)) === false) {
						_mkdir_p(_path.dirname(docpath));
					}

					if (_fs.existsSync(_path.dirname(docpath)) === true) {

						try {
							_fs.writeFileSync(docpath, content, 'utf8');
							result = true;
						} catch(e) {
							result = false;
						}

					}

				}

			}


			if (result === true) {
				console.log('\t' + classid + ': OKAY');
			} else {
				console.log('~\t' + classid + ': SKIP');
			}

		});


		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
		}

	})((function(json) {

		var files = [];

		var walk_directory = function(node, path) {

			if (node instanceof Array) {

				if (node.indexOf('js') !== -1) {
					files.push(path + '.js');
				}

			} else if (node instanceof Object) {

				Object.keys(node).forEach(function(child) {
					walk_directory(node[child], path + '/' + child);
				});

			}

		};

		if (json !== null) {

			var root = json.source.files || null;
			if (root !== null) {
				walk_directory(root, '');
			}

		}

		return files.concat([
			'/core/lychee.js',
			'/core/Debugger.js',
			'/core/Definition.js',
			'/core/Environment.js',
			'/core/Package.js'
		]).map(function(value) {
			return value.substr(1);
		}).sort(function(a, b) {
			if (a > b) return 1;
			if (a < b) return -1;
			return 0;
		});

	})(_package));

})();

