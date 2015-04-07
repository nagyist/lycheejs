#!/usr/bin/env iojs


var root   = require('path').resolve(__dirname, '../');
var fs     = require('fs');
var path   = require('path');


if (fs.existsSync(root + '/lychee/build/nodejs/core.js') === false) {
	require(root + '/lychee/configure.js');
}


var lychee = require(root + '/lychee/build/nodejs/core.js')(root);



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

	var projects = _pretty_lines(fs.readdirSync(root + '/projects').filter(function(value) {
		return fs.existsSync(root + '/projects/' + value + '/lychee.pkg');
	}).join(', '));


	console.log('                                                      ');
	console.info('lycheeJS ' + lychee.VERSION + ' Fertilizer');
	console.log('                                                      ');
	console.log('Usage: fertilizer [Project] [Environment]             ');
	console.log('                                                      ');
	console.log('                                                      ');
	console.log('Available Fertilizers:                                ');
	console.log('                                                      ');
	console.log('   html, html-nwjs, nodejs                            ');
	console.log('                                                      ');
	console.log('Available Projects:                                   ');
	console.log('                                                      ');
	projects.forEach(function(line)    { console.log('    ' + line);   });
	console.log('                                                      ');
	console.log('Examples:                                             ');
	console.log('                                                      ');
	console.log('    fertilizer boilerplate "html-nwjs/main"           ');
	console.log('    fertilizer boilerplate "nodejs/server"            ');
	console.log('                                                      ');

};



var _settings = (function() {

	var settings = {
		project:     null,
		identifier:  null,
		environment: null
	};


	var args = [ process.argv[2] || '', process.argv[3] || '' ];

	if (fs.existsSync(root + '/projects/' + args[0] + '/lychee.pkg') === true) {

		settings.project = args[0];


		var json = null;

		try {
			json = JSON.parse(fs.readFileSync(root + '/projects/' + args[0] + '/lychee.pkg', 'utf8'));
		} catch(e) {
			json = null;
		}


		if (json !== null) {

			if (json.build instanceof Object && json.build.environments instanceof Object) {

				if (json.build.environments[args[1]] instanceof Object) {
					settings.identifier  = args[1];
					settings.environment = json.build.environments[args[1]];
				}

			}

		}

	}


	return settings;

})();



(function(project, identifier, settings) {

	/*
	 * IMPLEMENTATION
	 */

	if (project !== null && identifier !== null && settings !== null) {

		console.info('Starting Instance (' + process.pid + ') ... ');

		lychee.setEnvironment(new lychee.Environment({
			id:      'fertilizer',
			debug:   false,
			sandbox: false,
			build:   'fertilizer.Main',
			timeout: 1000,
			packages: [
				new lychee.Package('lychee', '/lychee/lychee.pkg'),
				new lychee.Package('fertilizer', '/fertilizer/lychee.pkg')
			],
			tags:     {
				platform: [ 'nodejs' ]
			}
		}));


		lychee.init(function(sandbox) {

			if (sandbox !== null) {

				var lychee     = sandbox.lychee;
				var fertilizer = sandbox.fertilizer;


				// Show less debug messages
				lychee.debug = true;


				// This allows using #MAIN in JSON files
				sandbox.MAIN = new fertilizer.Main({
					project:    project,
					identifier: identifier,
					settings:   settings
				});
				sandbox.MAIN.init();
				sandbox.MAIN.bind('destroy', function() {
					process.exit(0);
				});


				process.on('SIGHUP',  function() { sandbox.MAIN.destroy(); this.exit(1); });
				process.on('SIGINT',  function() { sandbox.MAIN.destroy(); this.exit(1); });
				process.on('SIGQUIT', function() { sandbox.MAIN.destroy(); this.exit(1); });
				process.on('SIGABRT', function() { sandbox.MAIN.destroy(); this.exit(1); });
				process.on('SIGTERM', function() { sandbox.MAIN.destroy(); this.exit(1); });
				process.on('error',   function() { sandbox.MAIN.destroy(); this.exit(1); });
				process.on('exit',    function() {});


				new lychee.Input({
					key:         true,
					keymodifier: true
				}).bind('escape', function() {

					console.warn('fertilizer: [ESC] pressed, exiting ...');
					sandbox.MAIN.destroy();

				}, this);

			} else {

				process.exit(1);

			}

		});

	} else {

		_print_help();

		process.exit(0);

	}

})(_settings.project, _settings.identifier, _settings.environment);

