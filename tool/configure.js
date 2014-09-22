#!/usr/bin/env nodejs

(function() {

	var _fs   = require('fs');
	var _path = require('path');

	var _root      = _path.resolve(process.cwd(), '.');
	var _core      = '';
	var _bootstrap = {};
	var _validated = {};



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

	var _log = function(message, result) {

		var line;

		line  = message;
		line += ' ... ';

		if (result === true) {
			line += 'SUCCESS';
		} else {
			line += 'ERROR';
		}

		console.log(line);

	};



	/*
	 * GET CORE
	 */

	(function(files) {

		for (var f = 0, fl = files.length; f < fl; f++) {

			var file = _path.resolve(_root, files[f]);
			if (_fs.existsSync(file) === true) {
				_core += _fs.readFileSync(file, 'utf8');
			}

		}

	})([
		'./lychee/source/core/lychee.js',
		'./lychee/source/core/Debugger.js',
		'./lychee/source/core/Definition.js',
		'./lychee/source/core/Environment.js',
		'./lychee/source/core/Package.js'
	]);



	/*
	 * GET PLATFORM-SPECIFIC BOOTSTRAP
	 */

	(function(platforms, files) {

		var p, pl, platform;

		for (p = 0, pl = platforms.length; p < pl; p++) {

			platform = platforms[p];

			_bootstrap[platform] = {};
			_validated[platform] = false;


			if (platform.indexOf('-') !== -1) {

				var baseplatform = platform.split('-')[0];
				for (var basefile in _bootstrap[baseplatform]) {
					_bootstrap[platform][basefile] = _bootstrap[baseplatform][basefile];
				}

			}


			for (var f = 0, fl = files.length; f < fl; f++) {

				var file = files[f];
				var path = _path.resolve(_root, './lychee/source/platform/' + platform + '/' + file);
				if (_fs.existsSync(path) === true) {
					_bootstrap[platform][file] = _fs.readFileSync(path, 'utf8');
					_validated[platform]       = true;
				}

			}

		}


		for (p = 0, pl = platforms.length; p < pl; p++) {

			platform = platforms[p];

			if (Object.keys(_bootstrap[platform]).length === 0) {
				delete _bootstrap[platform];
			}

		}

	})([
		'html',
		'html-cordova',
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



	/*
	 * GENERATE CODE (CORE + BOOTSTRAP)
	 */

	(function(core, bootstrap, validated) {

		for (var platform in bootstrap) {

			if (validated[platform] === false) continue;


			var code = '' + core;

			for (var file in bootstrap[platform]) {
				code += bootstrap[platform][file];
			}


			var path    = _path.resolve(_root, './lychee/build/' + platform + '/core.js');
			var message = 'Building "' + path + '"';
			var result  = false;

			if (_fs.existsSync(path) === true) {

				result = true;

				try {
					_fs.writeFileSync(path, code, 'utf8');
				} catch(e) {
					result = false;
				} finally {
					_log(message, result);
				}

			} else {

				if (_mkdir_p(_path.resolve(_root, './lychee/build/' + platform)) === true) {

					result = true;

					try {
						_fs.writeFileSync(path, code, 'utf8');
					} catch(e) {
						result = false;
					} finally {
						_log(message, result);
					}

				}

			}

		}

	})(_core, _bootstrap, _validated);

})();

