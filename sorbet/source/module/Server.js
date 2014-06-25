
lychee.define('sorbet.module.Server').requires([
	'sorbet.data.Queue'
]).exports(function(lychee, sorbet, global, attachments) {

	var _child_process = require('child_process');

	var _PORT = { min: 49152, max: 65535 };
	var _port = _PORT.min;



	/*
	 * HELPERS
	 */

	var _refresh = function(vhost) {

		if (lychee.debug === true) {
			console.log('sorbet.module.Server: Refreshing VHost "' + vhost.id + '"');
		}


		for (var id in vhost.projects) {

			var project = vhost.projects[id];
			if (
				   project.sorbet === true
				&& project.server === null
			) {
				this.queue.add(project);
			}

		}

	};

	var _build_project = function(project) {

		if (this.main.servers.get(project.id) === null) {

			var root = project.root[0];
			var host = null;
			var port = ++_port;
			var info = '(' + JSON.stringify({ host: host, port: port }) + ')';

			if (port > _PORT.min && port < _PORT.max) {

				if (lychee.debug === true) {
					console.log('sorbet.module.Server: Building Server "' + root + '" ' + info);
				}


				var server = _child_process.fork(
					root + '/sorbet.js', [
						this.main.root,
						port,
						host
					], {
						cwd: root
					}
				);

				server.id   = project.id;
				server.host = host;
				server.port = port;

				server.destroy = function() {
					this.kill('SIGTERM');
				};


				var that = this;

				server.on('exit', function() {

					if (lychee.debug === true) {
						console.log('sorbet.module.Server: Killed Server "' + this.id + '"');
					}

					that.main.servers.remove(this.id, null);

				});

				server.on('error', function() {
					this.exit(0);
				});


				this.main.servers.set(server.id, server);
				this.main.refresh();
				this.queue.flush();

				return true;

			} else {

				if (lychee.debug === true) {
					console.error('sorbet.module.Server: Invalid Server "' + root + '" ' + info);
				}

			}

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

