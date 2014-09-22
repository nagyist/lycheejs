#!/usr/bin/env nodejs

var _cli = require(__dirname + '/cli.js');



/*
 * USAGE
 */

var _print_help = function() {

	console.log('                                                                                            ');
	console.log('============================================================================================');
	console.log('                   _                                                                        ');
	console.log('              {+~/`o;==-    ,_(+--,                 lycheeJS v0.8 Fertilizer                ');
	console.log('         .----+-/`-/          (+--; ,--+)_,                                                 ');
	console.log('          `+-..-| /               | ;--+)     @   (Cross-Compiler and CI-Builder)           ');
	console.log('               /|/|           .-. |.| .-.    <|>                                            ');
	console.log('               `--`              ~| |~        |                                             ');
	console.log('    ^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^=^-.-^     ');
	console.log('                                                                                            ');
	console.log('                                                                                            ');
	console.log('Usage: fertilizer [Mode] [Parameter, ...]                                                   ');
	console.log('                                                                                            ');
	console.log('                                                                                            ');
	console.log('Modes:                                                                                      ');
	console.log('                                                                                            ');
	console.log('   file                                       Builds the lychee.env to a single file        ');
	console.log('   folder                                     Builds the lychee.env to a folder             ');
	console.log('   library                                    Builds the lychee.env to a single library file');
	console.log('                                                                                            ');
	console.log('Parameters:                                                                                 ');
	console.log('                                                                                            ');
	console.log('   --environment="./path/to/lychee.env"       The lychee.Environment\'s serialize() output. ');
	console.log('   --fertilizer="./fertilizers/nodejs"        The platform-specific Fertilizer.             ');
	console.log('   --sandbox="./myproject/sandbox"            The isolated sandbox folder.                  ');
	console.log('                                                                                            ');
	console.log('Important:                                                                                  ');
	console.log('                                                                                            ');
	console.log('- File and Folder Mode produce static code that includes bootstrap.js and lychee.init().    ');
	console.log('- Library Mode produces dynamic code that is ready for inclusion or injection.              ');
	console.log('- If Environment has not the same platform-specific tags as the Fertilizer, it will fail.   ');
	console.log('                                                                                            ');
	console.log('Examples:                                                                                   ');
	console.log('                                                                                            ');
	console.log('fertilizer file --environment="./lychee/build/nodejs/main.lychee.env" --fertilizer="./fertilizers/nodejs" --sandbox="./example"');
	console.log('                                                                                            ');

};



var _mode        = null;
var _environment = null;
var _fertilizer  = null;
var _sandbox     = null;

(function() {

	var settings = {
		mode:        null,
		environment: null,
		fertilizer:  null,
		sandbox:     null
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

		} else if (arg.match(/file|folder|library/)) {

			settings['mode'] = arg;

		}

	}


	if (settings.environment !== null) {

		if (_cli.isFile(settings.environment)) {
			settings.environment = _cli.read(settings.environment);
		} else {
			settings.environment = null;
		}

		_environment = settings.environment;

	}

	if (settings.fertilizer !== null) {

		if (_cli.isDirectory(settings.fertilizer) === false) {
			settings.fertilizer = null;
		}

		_fertilizer = settings.fertilizer;

	}

	if (settings.sandbox !== null) {

		if (_cli.isDirectory(settings.sandbox) === false) {
			settings.sandbox = null;
		}

		_sandbox = settings.sandbox;

	}

	if (settings.mode !== null) {
		_mode = settings.mode;
	}


	settings = null;

})();



/*
 * IMPLEMENTATION
 */

(function(cli, mode, environment, fertilizer, sandbox) {

	var lychee = cli.lychee;
	var global = cli.global;

	lychee.event         = lychee.event || {};
	lychee.event.Emitter = cli.include('lychee/source/event/Emitter.js', 'lychee.event.Emitter');



	/*
	 * HELPERS
	 */

	var _EVENTS = [
		'configure',
		'make',
		'package',
		'install',
		'clean'
	];

	var _trigger_next_event = function() {

		var that    = this;
		var current = this.___event;
		var next    = null;

		if (current === null) {
			next = 'configure';
		} else {
			next = _EVENTS[_EVENTS.indexOf(current) + 1] || null;
		}


		if (next !== null) {

			this.___event = next;

			var result = this.trigger(next, [ function() {
				_trigger_next_event.call(that);
			}]);

			if (result === false) {
				_trigger_next_event.call(that);
			}


			return true;

		}


		return false;

	};

	var Template = function(mode, environment, fertilizerpath, sandboxpath) {

		mode           = (typeof mode === 'string' && mode.match(/library|file|folder/)) ? mode           : 'library';
		environment    = environment instanceof Object                                   ? environment    : null;
		fertilizerpath = typeof fertilizerpath === 'string'                              ? fertilizerpath : null;
		sandboxpath    = typeof sandboxpath === 'string'                                 ? sandboxpath    : null;


		this.environment   = environment;
		this.filesystem    = new cli.Filesystem(fertilizerpath, sandboxpath);
		this.mode          = mode;

		this.__configured  = false;
		this.__fertilizer  = fertilizerpath + '/index.js';
		this.__initialized = false;
		this.___event      = null;


		lychee.event.Emitter.call(this);

	};


	Template.prototype = lychee.extend({}, lychee.event.Emitter.prototype, {

		/*
		 * CUSTOM API
		 */

		configure: function() {

			if (this.__configured === false) {

				var result = false;

				try {
					result = require(this.__fertilizer)(this);
				} catch(e) {
				}

				this.__configured = true;

				return result;

			}


			return false;

		},

		init: function() {

			if (this.__initialized === false) {

				var event = this.___event;
				if (event === null) {
					_trigger_next_event.call(this);
				}

				this.__initialized = true;

				return true;

			}


			return false;

		}

	});



	/*
	 * INITIALIZATION
	 */

	if (mode !== null && environment !== null && fertilizer !== null && sandbox !== null) {

		var template = new Template(mode, environment, fertilizer, sandbox);
		if (template.configure() === true) {

			template.bind('clean', function() {

				var mode = this.mode;
				if (mode === 'library' || mode === 'file') {
					this.filesystem.extractindex();
				}

				process.exit(0);

			}, template);

			template.init();

		} else {

			console.error('fertilizer: Mode not supported by Template');

			process.exit(1);

		}

	} else {

		if (mode === null) {
			console.error('fertilizer: Invalid Mode');
		}

		if (environment === null) {
			console.error('fertilizer: Invalid Environment');
		}

		if (fertilizer === null) {
			console.error('fertilizer: Invalid Fertilizer');
		}

		if (sandbox === null) {
			console.error('fertilizer: Invalid Sandbox');
		}


		_print_help();
		process.exit(1);

	}

})(_cli, _mode, _environment, _fertilizer, _sandbox);

