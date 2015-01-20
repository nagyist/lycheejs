#!/usr/bin/env nodejs

var _cli = require(__dirname + '/cli.js');



/*
 * USAGE
 */

var _print_help = function() {

	console.log('                                                                                            ');
	console.log('============================================================================================');
	console.log('                   _                                                                        ');
	console.log('              {+~/`o;==-    ,_(+--,                     lycheeJS v0.8 Sorbet                ');
	console.log('         .----+-/`-/          (+--; ,--+)_,                                                 ');
	console.log('          `+-..-| /               | ;--+)     @      (Web-, WS- & CI-Server, CDN)           ');
	console.log('               /|/|           .-. |.| .-.    <|>                                            ');
	console.log('               `--`              ~| |~        |                                             ');
	console.log('    ^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^     ');
	console.log('                                                                                            ');
	console.log('                                                                                            ');
	console.log('Usage: sorbet [Command] [Parameter, ...]                                                    ');
	console.log('                                                                                            ');
	console.log('                                                                                            ');
	console.log('Commands:                                                                                   ');
	console.log('                                                                                            ');
	console.log('   init                                       Creates a profile for modification.           ');
	console.log('   start                                      Starts a sorbet server                        ');
	console.log('   stop                                       Stops a sorbet server                         ');
	console.log('   status                                     Shows an overview of running instances        ');
	console.log('                                                                                            ');
	console.log('Parameters:                                                                                 ');
	console.log('                                                                                            ');
	console.log('   --id="boilerplate"                         The project identifier of the server.         ');
	console.log('   --pid="1337"                               The process identifier of the server.         ');
	console.log('   --profile="./path/to/profile.json"         The static configuration file.                ');
	console.log('                                                                                            ');
	console.log('   --port="8080"                              The dynamic configuration port number.        ');
	console.log('   --sandbox="./path/to/project"              The dynamic configuration root directory.     ');
	console.log('   --virtualhost="cosmo.lycheejs.org"         The dynamic virtualhost identifier.           ');
	console.log('                                                                                            ');
	console.log('Important:                                                                                  ');
	console.log('                                                                                            ');
	console.log('- Profiles are static configuration. They setup ports, root folders and virtualhosts.       ');
	console.log('- If no Profile is set, it will default to using the dynamic configuration settings.        ');
	console.log('- If no Sandbox Directory is set, it will default to the current working directory.         ');
	console.log('- If no VirtualHost is set, it will default to "localhost".                                 ');
	console.log('                                                                                            ');
	console.log('Examples:                                                                                   ');
	console.log('                                                                                            ');
	console.log('cd ~/lycheeJS; sorbet start --profile="./sorbet/profile/localhost.json"                     ');
	console.log('                                                                                            ');
	console.log('                                                                                            ');
	console.log('cd ~/myproject; sorbet start --port="8081"                                                  ');
	console.log('cd ~; sorbet start --port="8082" --sandbox="./myproject" --virtualhost="foo.lycheejs.org"   ');
	console.log('                                                                                            ');
	console.log('                                                                                            ');
	console.log('cd ~; sorbet start --port="8083" --sandbox="./myproject"                                    ');
	console.log('cd ~; sorbet status; # lists previously started server with PID 1337                        ');
	console.log('cd ~; sorbet stop --pid="1337"                                                              ');
	console.log('                                                                                            ');

};


var _command  = null;
var _settings = {};
var _profile  = null;

(function() {

	var settings = {
		command:     null,
		pid:         null,
		profile:     null,
		port:        null,
		sandbox:     process.cwd(),
		virtualhost: null
	};


	for (var a = 0, al = process.argv.length; a < al; a++) {

		var arg = process.argv[a].replace(/"/g, '');
		if (arg.substr(0, 2) === '--' && arg.indexOf('=') !== -1) {

			var key = arg.substr(2).split('=')[0];
			var val = arg.substr(2).split('=')[1];

			if (!isNaN(parseInt(val, 10))) {
				val = parseInt(val, 10);
			}


			if (typeof settings[key] !== undefined) {
				settings[key] = val;
			}

		} else if (arg.match(/start|stop|status/)) {

			settings['command'] = arg;

		}

	}


	if (settings.profile !== null) {

		if (_cli.isFile(settings.profile)) {

			var data = _cli.read(settings.profile);
			if (data !== null) {
				settings.profile = data;
			} else {
				settings.profile = null;
			}

		} else {
			settings.profile = null;
		}

	}


	var id   = typeof settings.id === 'string'         ? settings.id         : null;
	var pid  = typeof settings.pid === 'number'        ? settings.pid        : (settings.pid === '*' ? '*' : null);
	var cmd  = typeof settings.command === 'string'    ? settings.command    : null;
	var port = typeof settings.port === 'number'       ? settings.port       : 8080;
	var host = typeof settings.host === 'string'       ? settings.host       : 'localhost';
	var root = _cli.isDirectory(settings.sandbox)      ? settings.sandbox    : process.cwd();

	if (settings.profile === null) {

		console.warn('No Profile set, using dynamic configuration settings.');

		_command          = cmd;
		_settings.pid     = pid;
		_settings.id      = id;
		_settings.profile = {
			port:   port,
			vhosts: [{
				hosts:  [ host ],
				config: { root: root }
			}]
		};

	} else {

		console.warn('Profile set, using static configuration settings.');

		_command          = cmd;
		_settings.profile = settings.profile;

	}


	settings = null;

})();



/*
 * IMPLEMENTATION
 */

(function(cli, command, settings) {

	var lychee = cli.lychee;
	var global = cli.global;



	/*
	 * HELPERS
	 */

	var _print_status = function() {

		var storage = _cli.read('/tmp/sorbet.store');
		if (storage instanceof Object) {

			var servers = storage['servers'] || null;
			if (servers !== null) {
				cli.table(servers);
			}

		}

	};

	var _start_server = function(profile) {

		lychee.setEnvironment(new lychee.Environment({
			id:      'sorbet',
			debug:   true,
			sandbox: false,
			build:   'sorbet.Main',
			timeout: 3000,
			packages: [
				new lychee.Package('lychee', '/lychee/lychee.pkg'),
				new lychee.Package('sorbet', '/sorbet/lychee.pkg')
			],
			tags:     {
				platform: [ 'nodejs' ]
			}
		}));

		lychee.init(function(sandbox) {

			var lychee = sandbox.lychee;
			var sorbet = sandbox.sorbet;

			var main = new sorbet.Main(profile);

			main.listen(profile.port);


			process.on('SIGHUP',  function() { main.destroy(); this.exit(0); });
			process.on('SIGINT',  function() { main.destroy(); this.exit(0); });
			process.on('SIGQUIT', function() { main.destroy(); this.exit(0); });
			process.on('SIGABRT', function() { main.destroy(); this.exit(0); });
			process.on('SIGTERM', function() { main.destroy(); this.exit(0); });
			process.on('error',   function() { main.destroy(); this.exit(0); });


			new lychee.Input({
				key:         true,
				keymodifier: true
			}).bind('escape', function() {

				console.log('sorbet.Main: [ESC] pressed, exiting Sorbet ...');

				main.destroy();
				process.exit(0);

			}, this);

		});


		return true;

	};

	var _stop_server = function(filters) {

		filters = filters instanceof Object ? filters : {};

		var id  = filters.id  || null;
		var pid = filters.pid || null;


		var storage = cli.read('/tmp/sorbet.store');
		if (storage instanceof Object) {

			var servers = storage['servers'] || null;
			if (servers !== null) {

				var found = [];

				for (var s = 0, sl = servers.length; s < sl; s++) {

					if (
						   (servers[s].id === id   || id === null)
						&& (servers[s].pid === pid || pid === null)
					) {

						found.push(servers[s]);
						break;

					}

				}


				if (found.length > 0) {

					for (var f = 0, fl = found.length; f < fl; f++) {

						var f_pid = found[f].pid;
						if (f_pid > 0) {

							try {
								process.kill(pid, 'SIGINT');
							} catch(e) {
							}

						}

					}


					if (id === null && pid === null) {
						cli.write('/tmp/sorbet.store', '{}');
					}


					return true;

				}

			}

		}


		return false;

	};



	/*
	 * INITIALIZATION
	 */

	var result = false;

	switch(command) {

		case 'start':

			var profile = settings.profile;

			if (profile !== null) {

				console.log('Starting Instance ... ');

				result = _start_server(profile);

				if (result === true) {
					console.info('SUCCESS');
				} else {
					console.error('FAILURE');
				}

			} else {

				console.error('Invalid Profile');
				process.exit(1);

			}

		break;

		case 'stop':

			var id  = settings.id;
			var pid = settings.pid;

			if (id !== null || pid !== null) {

				console.log('Stopping Instances ... ');

				if (pid === '*') {

					result = _stop_server({
						id:  null,
						pid: null
					});

				} else {

					result = _stop_server({
						id:  id,
						pid: pid
					});

				}

				if (result === true) {
					console.info('SUCCESS');
				} else {
					console.error('FAILURE');
				}

			} else {

				console.error('Invalid Identifier');
				process.exit(1);

			}

		break;

		case 'status':

			_print_status();

		break;

		default:
		case 'help':

			_print_help();

			process.exit(1);

		break;

	}

})(_cli, _command, _settings);

