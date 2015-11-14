#!/usr/bin/env node


var root   = require('path').resolve(__dirname, '../');
var fs     = require('fs');
var path   = require('path');


if (fs.existsSync(root + '/lib/lychee/build/node/core.js') === false) {
	require(root + '/bin/configure.js');
}


var lychee = require(root + '/lib/lychee/build/node/core.js')(root);



/*
 * USAGE
 */

var _pretty_lines = function(str) {

	var lines  = [];
	var spacer = (function(v) {
		for (var i = 0; i < 50; i++) { v+=' '; } return v;
	})('');


	if (str.length > 50) {

		var i      = str.lastIndexOf(',', 50) + 1;
		var chunk1 = str.substr(0, i).trim();
		var chunk2 = str.substr(i).trim();

		lines.push((chunk1 + spacer).substr(0, 50));
		lines.push((chunk2 + spacer).substr(0, 50));

	} else {

		lines.push((str + spacer).substr(0, 50));

	}


	return lines;

};

var _print_help = function() {

	var profiles = _pretty_lines(fs.readdirSync(root + '/bin/sorbet').map(function(value) {
		return '"' + value.substr(0, value.indexOf('.json')) + '"';
	}).join(', '));


	console.log('                                                      ');
	console.info('lycheeJS ' + lychee.VERSION + ' Sorbet');
	console.log('                                                      ');
	console.log('Usage: sorbet [Command] [Profile]                     ');
	console.log('                                                      ');
	console.log('                                                      ');
	console.log('Commands:                                             ');
	console.log('                                                      ');
	console.log('    start                  Starts a Sorbet Instance.  ');
	console.log('    stop                   Stops a Sorbet Instance.   ');
	console.log('                                                      ');
	console.log('Available Profiles:                                   ');
	console.log('                                                      ');
	profiles.forEach(function(line) { console.log('    ' + line);      });
	console.log('                                                      ');
	console.log('Examples:                                             ');
	console.log('                                                      ');
	console.log('    sorbet start development                          ');
	console.log('                                                      ');

};



var _settings = (function() {

	var settings = {
		command: null,
		profile: null
	};


	var args = [ process.argv[2] || '', process.argv[3] || '' ];
	if (args[0].match(/start|stop/)) {

		settings.command = args[0];
		settings.profile = args[1] || null;

	}


	if (settings.profile !== null) {

		try {

			if (fs.existsSync(root + '/bin/sorbet/' + settings.profile + '.json')) {
				settings.profile = JSON.parse(fs.readFileSync(root + '/bin/sorbet/' + settings.profile + '.json', 'utf8'));
			} else {
				settings.profile = null;
			}

		} catch(e) {
		}

	}


	return settings;

})();



(function(command, profile) {

	/*
	 * HELPERS
	 */

	var _clear_pid = function() {

		try {

			fs.unlinkSync(root + '/bin/sorbet.pid');
			return true;

		} catch(e) {

			return false;

		}

	};

	var _read_pid = function() {

		var pid = null;

		try {

			pid = fs.readFileSync(root + '/bin/sorbet.pid', 'utf8');

			if (!isNaN(parseInt(pid, 10))) {
				pid = parseInt(pid, 10);
			}

		} catch(e) {
			pid = null;
		}

		return pid;

	};

	var _write_pid = function() {

		try {

			fs.writeFileSync(root + '/bin/sorbet.pid', process.pid);
			return true;

		} catch(e) {

			return false;

		}

	};



	if (command === 'start') {

		if (profile === null) {

			console.error('Invalid Profile');
			process.exit(1);

			return false;

		} else {

			console.info('Starting Instance (' + process.pid + ') ... ');

			lychee.setEnvironment(new lychee.Environment({
				id:      'sorbet',
				debug:   false,
				sandbox: false,
				build:   'sorbet.Main',
				timeout: 10000, // 10 seconds bootup time, because we also ship lycheeOS
				packages: [
					new lychee.Package('lychee', '/lib/lychee/lychee.pkg'),
					new lychee.Package('sorbet', '/lib/sorbet/lychee.pkg')
				],
				tags:     {
					platform: [ 'node' ]
				}
			}));


			lychee.init(function(sandbox) {

				if (sandbox !== null) {

					var lychee = sandbox.lychee;
					var sorbet = sandbox.sorbet;


					// Show more debug messages
					lychee.debug = true;


					// This allows using #MAIN in JSON files
					sandbox.MAIN = new sorbet.Main(profile);
					sandbox.MAIN.init();
					sandbox.MAIN.bind('destroy', function() {
						process.exit(0);
					});
					_write_pid();


					process.on('SIGHUP',  function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
					process.on('SIGINT',  function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
					process.on('SIGQUIT', function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
					process.on('SIGABRT', function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
					process.on('SIGTERM', function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
					process.on('error',   function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
					process.on('exit',    function() {});


					new lychee.Input({
						key:         true,
						keymodifier: true
					}).bind('escape', function() {

						console.warn('sorbet: [ESC] pressed, exiting ...');

						sandbox.MAIN.destroy();
						_clear_pid();

					}, this);

				} else {

					_clear_pid();
					process.exit(1);

				}

			});

		}

	} else if (command === 'stop') {

		var pid = _read_pid();
		if (pid !== null) {

			console.info('Stopping Instance (' + pid + ') ... ');

			var killed = false;

			try {

				process.kill(pid, 'SIGTERM');
				killed = true;

			} catch(err) {

				if (err.code === 'ESRCH') {
					killed = true;
				} else {
					console.error('Invalid process rights (try with sudo?)');
				}

			}

			if (killed === true) {
				_clear_pid();
			}

			process.exit(0);

		} else {

			process.exit(1);

		}

	} else {

		_print_help();

		process.exit(0);

	}

})(_settings.command, _settings.profile);

