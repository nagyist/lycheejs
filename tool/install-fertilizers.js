#!/usr/bin/env nodejs

(function() {

	/*
	 * START OF CUSTOM SETTINGS
	 */

	var _fertilizers_zip = 'https://codeload.github.com/LazerUnicorns/lycheeJS-fertilizers/zip/master';

	/*
	 * END OF CUSTOM SETTINGS
	 */



	(function() {

		if (typeof String.prototype.trim !== 'function') {

			String.prototype.trim = function() {
				return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
			};

		}

		if (typeof String.prototype.replacetemplate !== 'function') {

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

		}

	})();



	var _fs   = require('fs');
	var _path = require('path');
	var _root = _path.resolve(process.cwd(), '.');
	var _user = process.env.USER;



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

	var _execSync = require('child_process').execSync || function(command) {

		require('child_process').exec(command + ' 2>&1 1>/tmp/.exec-stdout 2>/tmp/.exec-stderr; echo "$?" > /tmp/.exec-exitcode');

		while (!_fs.existsSync('/tmp/.exec-exitcode')) {
			// Do Nothing
		}

		var stdout   = _fs.readFileSync('/tmp/.exec-stdout').toString().trim();
		var stderr   = _fs.readFileSync('/tmp/.exec-stderr').toString().trim();
		var exitcode = _fs.readFileSync('/tmp/.exec-exitcode').toString().trim();


		_fs.unlinkSync('/tmp/.exec-stdout');
		_fs.unlinkSync('/tmp/.exec-stderr');
		_fs.unlinkSync('/tmp/.exec-exitcode');


		if (exitcode !== '0') {
			throw new Error('Command failed: ' + command + (stderr !== '' ? '\n' + stderr : ''));
		} else {
			return stdout;
		}

	};

	var _exec_sync = function(command) {

		var result = null;

		try {
			result = _execSync(command);
		} catch(e) {
			result = null;
		}


		if (result !== null) {
			return result.toString();
		}


		return null;

	};



	/*
	 * 0: ENVIRONMENT CHECK
	 */

	(function() {

		var errors = 0;

		console.log('> Checking Environment');


		if (_fs.existsSync(_path.resolve(_root, './lychee/build')) === true) {
			console.log('\tprocess cwd: OKAY');
		} else {
			console.log('\tprocess cwd: FAIL (' + _root + ' is not the lycheeJS directory)');
			errors++;
		}


		if (_user !== 'root') {
			console.log('\tprocess user: OKAY');
		} else {
			console.log('\tprocess user: FAIL (You are root)');
			errors++;
		}


		if (_fs.existsSync(_path.resolve(_root, './fertilizers')) === true) {
			console.log('\t./fertilizers: OKAY');
		} else {
			console.log('\t./fertilizers: FAIL (Does not exist)');
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
	 * 1: FERTILIZERS DOWNLOAD
	 */

	(function() {

		var errors = 0;

		console.log('> Downloading Fertilizers');


		var wget  = _exec_sync('which wget');
		var unzip = _exec_sync('which unzip');

		var file   = './fertilizers/lycheeJS-fertilizers-master.zip';
		var folder = './fertilizers/lycheeJS-fertilizers-master';

		var file_result   = _fs.existsSync(file);
		var folder_result = _fs.existsSync(folder);

		if (file_result === false && wget !== null) {

			wget = wget.split('\n')[0];

			var wget_out = _exec_sync(wget + ' ' + _fertilizers_zip + ' -q -O ' + file);
			if (wget_out !== null) {
				file_result = _fs.existsSync(file);
			}

		}


		if (file_result === true) {
			console.log('\t' + file + ': OKAY');
		} else {
			console.log('\t' + file + ': FAIL');
			errors++;
		}


		if (file_result === true && folder_result === false && unzip !== null) {

			unzip = unzip.split('\n')[0];

			var unzip_out = _exec_sync(unzip + ' ' + file + ' -d ./fertilizers');
			if (unzip_out !== null) {
				folder_result = _fs.existsSync(folder);
			}

		}


		if (folder_result === true) {
			console.log('\t' + folder + ': OKAY');
		} else {
			console.log('\t' + folder + ': FAIL');
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
	 * 2: FERTILIZERS INTEGRATION
	 */

	(function(fertilizers) {

		var errors = 0;

		console.log('> Integrating Fertilizers');


		var folder = _path.resolve(_root, './fertilizers');
		if (_fs.existsSync(folder) === false) {
			_mkdir_p(folder);
		}


		if (_fs.existsSync(folder) === true) {

			Object.keys(fertilizers).forEach(function(fertilizerid) {

				var source = fertilizers[fertilizerid];
				var target = _path.resolve(_root, './fertilizers/' + fertilizerid);

				var result = false;

				if (_fs.existsSync(target) === false) {
					result = _exec_sync('cp ' + source + ' -R ' + target);
				}


				if (result === true) {
					console.log('\t' + fertilizerid + ': OKAY');
				} else {
					console.log('~\t' + fertilizerid + ': SKIP');
				}

			});

		}



		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})((function(files) {

		var fertilizers = {};

		files.forEach(function(file) {

			var name = file;
			var path = _path.resolve(_root, './fertilizers/lycheeJS-fertilizers-master');
			var stat = _fs.statSync(path + '/' + file);

			if (stat.isDirectory() === true && _fs.existsSync(path + '/' + file + '/index.js')) {
				fertilizers[name] = path + '/' + file;
			}

		});

		return fertilizers;

	})(_fs.readdirSync(_path.resolve(_root, './fertilizers/lycheeJS-fertilizers-master'))));

})();

