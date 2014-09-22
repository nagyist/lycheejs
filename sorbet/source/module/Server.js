
lychee.define('sorbet.module.Server').requires([
	'sorbet.data.Queue'
]).exports(function(lychee, sorbet, global, attachments) {

	var _child_process = require('child_process');

	var _MIN_PORT = 49152;
	var _MAX_PORT = 65534;



	/*
	 * HELPERS
	 */

	var _get_port = function() {

		var port  = _MIN_PORT;
		var ports = [];

		this.main.storage.filter(function(index, object) {
			ports.push(object.port);
		}, this);

		while (ports.indexOf(port) !== -1) {
			port++;
		}


		return port;

	};

	var _refresh = function(vhost) {

		if (lychee.debug === true) {
			console.log('sorbet.module.Server: Refreshing VHost "' + vhost.id + '"');
		}


		for (var id in vhost.projects) {

			var project = vhost.projects[id];
			if (project.sorbet === true && project.server === null) {
				this.queue.add(project);
			}

		}

	};

	var _build_project = function(project) {

		if (this.main.servers.get(project.id) === null) {

			var root = project.root[0];
			var host = null;
			var port = _get_port.call(this);
			var info = '(' + JSON.stringify({ host: host, port: port }) + ')';
			var args = [ this.main.root, port, host ];


			if (lychee.debug === true) {
				console.log('sorbet.module.Server: Building Server "' + root + '" ' + info);
			}


			var server = _child_process.fork(root + '/sorbet.js', args, {
				cwd: root
			});


			server.status      = this.main.storage.create();
			server.status.id   = project.id;
			server.status.type = 'websocket';
			server.status.port = port;
			server.status.pid  = server.pid;
			server.status.cmd  = 'node ' + root + '/sorbet.js ' + args.join(' ');


			var that = this;

			server.destroy = function() {

				that.main.storage.remove(null, this.status);
				that.main.servers.remove(this.status.id, null);

				this.kill('SIGTERM');

			};

			server.on('exit', function() {

				var id = this.status.id;

				if (lychee.debug === true) {
					console.log('sorbet.module.Server: Killed Server "' + id + '"');
				}

				that.main.storage.remove(null, this.status);
				that.main.servers.remove(id, null);

			});

			server.on('error', function(err) {
				this.exit(0);
			});


			this.main.storage.insert(server.status);
			this.main.servers.set(project.id, server);

			this.main.refresh();
			this.queue.flush();


			return true;

		}


		this.queue.flush();

		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id    = 'Server';
		this.main  = main || null;

		this.queue = new sorbet.data.Queue();
		this.queue.bind('update', _build_project, this);


		var vhosts = this.main.vhosts.values();
		for (var v = 0, vl = vhosts.length; v < vl; v++) {
			vhosts[v].bind('#refresh', _refresh, this);
		}

	};


	Class.prototype = {

		destroy: function() {

			var vhosts = this.main.vhosts.values();
			for (var v = 0, vl = vhosts.length; v < vl; v++) {
				vhosts[v].unbind('refresh', _refresh, this);
			}

			this.queue.destroy();

		},

		process: function(host, response, data) {
			return false;
		}

	};


	return Class;

});

