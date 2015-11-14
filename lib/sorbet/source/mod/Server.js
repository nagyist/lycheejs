
lychee.define('sorbet.mod.Server').requires([
	'sorbet.data.Filesystem',
	'sorbet.data.Server'
]).exports(function(lychee, sorbet, global, attachments) {

	var _MIN_PORT      = 49152;
	var _MAX_PORT      = 65534;

	var _child_process = require('child_process');
	var _net           = require('net');
	var _port          = _MIN_PORT;
	var _root          = new sorbet.data.Filesystem().root;



	/*
	 * HELPERS
	 */

	var _scan_port = function(callback, scope) {

		callback = callback instanceof Function ? callback : null;
		scope    = scope !== undefined          ? scope    : this;


		if (callback !== null) {

			var socket = new _net.Socket();
			var status = null;
			var port   = _port++;


			socket.setTimeout(100);

			socket.on('connect', function() {
				status = 'used';
				socket.destroy();
			});

			socket.on('timeout', function(err) {
				status = 'free';
				socket.destroy();
			});

			socket.on('error', function(err) {

				if (err.code === 'ECONNREFUSED') {
					status = 'free';
				} else {
					status = 'used';
				}

				socket.destroy();

			});

			socket.on('close', function(err) {

				if (status === 'free') {
					callback.call(scope, port);
				} else if (status === 'used') {
					_scan_port(callback, scope);
				} else {
					callback.call(scope, null);
				}

			});


			socket.connect(port, '127.0.0.1');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'sorbet.mod.Server',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (project.server === null) {

				var info = project.filesystem.info('/sorbet.js');
				if (info !== null && info.type === 'file') {
					return true;
				}

			}


			return false;

		},

		process: function(project) {

			if (project.server === null) {

				var info = project.filesystem.info('/sorbet.js');
				if (info !== null && info.type === 'file') {

					_scan_port(function(port) {

						var server_host = null;
						var server_port = port;

						if (server_port !== null && server_port >= _MIN_PORT && server_port <= _MAX_PORT) {

							var program_bin  = project.filesystem.root + '/sorbet.js';
							var program_args = [ _root, server_port, server_host ];
							var program_cwd  = project.filesystem.root;


							var server_process = _child_process.fork(program_bin, program_args, {
								cwd: program_cwd
							});


							if (lychee.debug === true) {
								console.log('sorbet.mod.Server: Launched Server for "' + project.identifier + '" (' + server_process.pid + ' / ' + server_host + ':' + server_port + ')');
							}


							server_process.on('SIGTERM', function() { this.exit(1); });
							server_process.on('error',   function() { this.exit(1); });
							server_process.on('exit',    function() {});

							server_process.destroy = function() {

								if (lychee.debug === true) {
									console.warn('sorbet.mod.Server: Destroyed Server for "' + project.identifier + '"');
								}

								this.kill('SIGTERM');

							};


							project.setServer(new sorbet.data.Server({
								process: server_process,
								host:    server_host,
								port:    server_port
							}));

						}

					}, this);

				}

			}

		}

	};


	return Module;

});

