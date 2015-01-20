#!/usr/bin/env nodejs

(function() {

	/*
	 * START OF CUSTOM SETTINGS
	 */

	var _sorbet_profile = 'localhost.json';
	var _sorbet_user    = 'lycheejs';
	var _sorbet_group   = 'lycheejs';

	(function(args) {

		for (var a = 0, al = process.argv.length; a < al; a++) {

			var arg = process.argv[a].replace(/"/g, '');
			if (arg.substr(0, 2) === '--' && arg.indexOf('=') !== -1) {

				var key = arg.substr(2).split('=')[0];
				var val = arg.substr(2).split('=')[1];

				if (!isNaN(parseInt(val, 10))) {
					val = parseInt(val, 10);
				}


				if (key === 'profile') {
					_sorbet_profile = val;
				}

			}

		}

	})();

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

					var indexes = [];
					var index   = this.indexOf(key);

					while (index !== -1) {
						indexes.push(index);
						index = this.indexOf(key, index + 1);
					}


					var keyo   = 0;
					var keyl   = key.length;
					var vall   = value.length;
					var buffer = '' + this;

					indexes.forEach(function(keyi) {

						buffer  = buffer.substr(0, keyi + keyo) + value + buffer.substr(keyi + keyo + keyl);
						keyo   += (vall - keyl);

					});


					return buffer;

				}


				return this;

			};

		}

	})();



	var _fs   = require('fs');
	var _path = require('path');
	var _root = _path.resolve(process.cwd(), '.');
	var _user = process.env.USER;

	var _profiles = [];



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


		if (_user === 'root') {
			console.log('\tprocess user: OKAY');
		} else {
			console.log('\tprocess user: FAIL (You are not root)');
			errors++;
		}


		if (_fs.existsSync(_path.resolve(_root, './sorbet/profile')) === true) {
			console.log('\t./sorbet/profile: OKAY');
		} else {
			console.log('\t./sorbet/profile: FAIL');
			errors++;
		}


		if (_fs.existsSync(_path.resolve('/etc/init.d')) === true) {
			console.log('\t/etc/init.d: OKAY');
		} else {
			console.log('\t/etc/init.d: FAIL (Does not exist)');
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
	 * 1: PROFILE INTEGRATION
	 */

	(function(profiles) {

		var errors = 0;

		console.log('> Integrating Sorbet Profiles');


		var folder = _path.resolve('/etc/sorbet/');

		if (_fs.existsSync(folder) === false) {
			_mkdir_p(folder);
		}


		if (_fs.existsSync(folder) === true) {

			Object.keys(profiles).forEach(function(profileid) {

				var path   = _path.resolve('/etc/sorbet', './' + profileid + '.json');
				var buffer = profiles[profileid];


				var result = false;

				try {
					_fs.writeFileSync(path, buffer, 'utf8');
					result = true;
				} catch(e) {
					result = false;
				}


				if (result === true) {
					console.log('\t' + profileid + ': OKAY');
				} else {
					console.log('~\t' + profileid + ': SKIP');
				}

			});

		} else {
			errors++;
		}



		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
		}

	})((function(files) {

		var profiles = {};

		files.forEach(function(file) {

			if (file.substr(file.length - 5, 5) === '.json') {

				var name = file.substr(0, file.length - 5);
				var buffer = null;

				try {
					buffer = _fs.readFileSync(_path.resolve(_root, './sorbet/profile/' + file));
				} catch(e) {
					buffer = null;
				}


				if (buffer !== null) {
					profiles[name] = buffer.toString();
				}

			}

		});

		return profiles;

	})(_fs.readdirSync(_path.resolve(_root, './sorbet/profile'))));



	/*
	 * 2: SERVICE INTEGRATION
	 */

	(function() {

		var errors = 0;

		console.log('> Integrating Sorbet Service');


		var nodejs = _exec_sync('which nodejs');
		if (nodejs !== null) {

			nodejs = nodejs.split('\n')[0];

			var capabilities = _exec_sync('getcap ' + nodejs) || '';
			if (capabilities.indexOf('cap_net_bind_service+ep') !== -1) {
				console.log('\t' + nodejs + ': OKAY');
			} else {

				if (_exec_sync('setcap cap_net_bind_service=+ep ' + nodejs) !== null) {
					console.log('\t' + nodejs + ': OKAY');
				} else {
					console.log('\t' + nodejs + ': FAIL (Could not set capabilities via setcap)');
					errors++;
				}

			}

		}


		var script_folder = _path.resolve('/etc/init.d');
		var script_result = false;

		if (_fs.existsSync(script_folder) === true) {

			var buffer = null;
			try {
				buffer = _fs.readFileSync(_path.resolve(__dirname, './_etc_init_d_sorbet.sh'), 'utf8');
				buffer = buffer.toString();
			} catch(e) {
				buffer = null;
			}


			if (buffer !== null) {

				buffer = buffer.replacetemplate('{{lycheejs_root}}',  _root);
				buffer = buffer.replacetemplate('{{sorbet_user}}',    _sorbet_user);
				buffer = buffer.replacetemplate('{{sorbet_group}}',   _sorbet_group);
				buffer = buffer.replacetemplate('{{sorbet_profile}}', _sorbet_profile);


				try {

					_fs.writeFileSync(_path.resolve(script_folder, './sorbet'), buffer, 'utf8');

					if (_exec_sync('chmod 755 ' + _path.resolve(script_folder, './sorbet')) !== null) {
						script_result = true;
					} else {
						script_result = false;
					}

				} catch(e) {
					script_result = false;
				}

			}

		}

		if (script_result === true) {
			console.log('\t/etc/init.d/sorbet: OKAY');
		} else {
			console.log('\t/etc/init.d/sorbet: FAIL');
			errors++;
		}


		var user_result = false;

		if (_exec_sync('getent passwd ' + _sorbet_user) === null) {

			if (_exec_sync('useradd --system ' + _sorbet_user) !== null) {
				user_result = true;
			}

		} else {
			user_result = true;
		}

		if (user_result === true) {
			console.log('\t' + _sorbet_user + ' user: OKAY');
		} else {
			console.log('\t' + _sorbet_user + ' user: FAIL');
			errors++;
		}


		if (_exec_sync('update-rc.d sorbet defaults') !== null) {
			console.log('\tupdate-rc.d: OKAY');
		} else {
			console.log('\tupdate-rc.d: FAIL');
			errors++;
		}



		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
		}

	})();



	/*
	 * 3: UPDATE INTEGRATION
	 */

	(function() {

		var errors = 0;

		console.log('> Integrating Daily Updates');


		var cron_folder = _path.resolve('/etc/cron.daily');
		var cron_result = false;

		if (_fs.existsSync(cron_folder) === true) {

			var buffer = null;
			try {
				buffer = _fs.readFileSync(_path.resolve(__dirname, './_etc_cron_daily_sorbet.sh'), 'utf8');
				buffer = buffer.toString();
			} catch(e) {
				buffer = null;
			}


			if (buffer !== null) {

				buffer = buffer.replacetemplate('{{lycheejs_root}}',  _root);
				buffer = buffer.replacetemplate('{{sorbet_user}}',    _sorbet_user);
				buffer = buffer.replacetemplate('{{sorbet_group}}',   _sorbet_group);


				try {

					_fs.writeFileSync(_path.resolve(cron_folder, './sorbet'), buffer, 'utf8');

					if (_exec_sync('chmod 755 ' + _path.resolve(cron_folder, './sorbet')) !== null) {
						cron_result = true;
					} else {
						cron_result = false;
					}

				} catch(e) {
					cron_result = false;
				}

			}

		}

		if (cron_result === true) {
			console.log('\t/etc/cron.daily/sorbet: OKAY');
		} else {
			console.log('\t/etc/cron.daily/sorbet: FAIL');
			errors++;
		}



		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
		}

	})();

})();

