#!/usr/bin/env nodejs

(function() {

	var _fs   = require('fs');
	var _path = require('path');
	var _user = process.env.USER;



	/*
	 * HELPERS
	 */

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


		if (_user === 'root') {
			console.log('\tprocess user: OKAY');
		} else {
			console.log('\tprocess user: FAIL (You are not root)');
			errors++;
		}


		if (_fs.existsSync(_path.resolve('/etc/init.d/sorbet')) === true) {
			console.log('\t/etc/init.d: OKAY');
		} else {
			console.log('\t/etc/init.d: SKIP (Does not exist)');
		}


		if (_fs.existsSync(_path.resolve('/etc/sorbet')) === true) {
			console.log('\t/etc/sorbet: OKAY');
		} else {
			console.log('\t/etc/sorbet: SKIP (Does not exist)');
		}



		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})();



	/*
	 * 1: UPDATE DISINTEGRATION
	 */

	(function() {

		var errors = 0;

		console.log('> Disintegrating Daily Updates');


		var cron_result = false;

		if (_fs.existsSync('/etc/cron.daily/sorbet') === true) {

			try {
				_fs.unlinkSync('/etc/cron.daily/sorbet');
				cron_result = true;
			} catch(e) {
				cron_result = false;
			}

		}

		if (cron_result === true) {
			console.log('\t/etc/cron.daily/sorbet: OKAY');
		} else {
			console.log('\t/etc/cron.daily/sorbet: SKIP');
		}



		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})();



	/*
	 * 2: SERVICE DISINTEGRATION
	 */

	(function() {

		var errors = 0;

		console.log('> Disintegrating Sorbet Service');


		if (_exec_sync('update-rc.d -f sorbet remove') !== null) {
			console.log('\tupdate-rc.d: OKAY');
		} else {
			console.log('\tupdate-rc.d: SKIP');
		}


		var user_result = false;

		if (_exec_sync('getent passwd lycheejs') !== null) {

			if (_exec_sync('userdel lycheejs') !== null) {
				user_result = true;
			}

		} else {
			user_result = true;
		}

		if (user_result === true) {
			console.log('\tlycheejs user: OKAY');
		} else {
			console.log('\tlycheejs user: SKIP');
		}


		var script_result = false;

		if (_fs.existsSync('/etc/init.d/sorbet') === true) {

			try {
				_fs.unlinkSync('/etc/init.d/sorbet');
				script_result = true;
			} catch(e) {
				script_result = false;
			}

		}

		if (script_result === true) {
			console.log('\t/etc/init.d/sorbet: OKAY');
		} else {
			console.log('\t/etc/init.d/sorbet: SKIP');
		}



		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})();



	/*
	 * 3: PROFILE DISINTEGRATION
	 */

	(function() {

		var errors = 0;

		console.log('> Disintegrating Sorbet Profiles');


		var result = false;

		if (_exec_sync('rm -rf /etc/sorbet') !== null) {
			result = true;
		}


		if (result === true) {
			console.log('\t/etc/sorbet: OKAY');
		} else {
			console.log('\t/etc/sorbet: SKIP');
		}



		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})();

})();

