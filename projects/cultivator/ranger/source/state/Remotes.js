
lychee.define('tool.state.Remotes').includes([
	'lychee.app.State',
	'lychee.event.Emitter'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	/*
	 * HELPERS
	 */

	var _servers = {};

	var _ui_update = function() {

		var config = new Config('http://localhost:8080/api/Server?timestamp=' + Date.now());
		var that   = this;

		config.onload = function(result) {

			if (this.buffer instanceof Array) {

				var servers = this.buffer.filter(function(server) {
					return server.port !== null && server.remotes.length > 0;
				});

				servers.forEach(function(server) {

					_servers[server.identifier] = {
						identifier: server.identifier,
						host:       server.host,
						port:       server.port,
						remotes:    server.remotes
					};

				});

				_ui_render.call(that);

			}

		};

		config.load();

	};

	var _ui_render = function() {

		var code    = '';
		var servers = Object.values(_servers);

		if (servers.length > 0) {

			code += servers.map(function(server) {
				return '<li><input type="radio" name="project" value="' + server.identifier + '"><span>' + server.identifier + '</span></li>';
			}).join('');

			ui.render(code, '#remotes-selection ul.select');


/*
			servers.forEach(function(server) {

				code += '<article class="wide">';
				code += '<h3>' + server.identifier + '</h3>';

				code += '<table>';
				code += '<tr>';
				code += '<th>Remote</th>';
				code += '<th>Status</th>';
				code += '<th>Actions</th>';
				code += '</tr>';

				server.remotes.forEach(function(remote) {

					var remote_actions = [];
					var remote_mode    = '';

					if (remote.mode === 'default') {

						remote_actions.push('<button class="ico-editor ico-only" onclick="MAIN.state.trigger(\'connect\', [\'' + server.identifier + '\', \'' + remote.id + '\', \'editor\']);"></button>');
						remote_actions.push('<button class="ico-debugger ico-only" onclick="MAIN.state.trigger(\'connect\', [\'' + server.identifier + '\', \'' + remote.id + '\', \'debugger\']);"></button>');
						remote_mode = '<label class="ico-offline" disabled>Offline</label';

					} else {

						remote_mode = '<label class="ico-online">' + remote.mode + '</label>';
						remote_actions.push('<button class="ico-debug ico-only" onclick="MAIN.state.trigger(\'disconnect\', [\'' + server.identifier + '\', \'' + remote.id + '\']);"></button>');

					}


					code += '<tr>';
					code += '<td>' + remote.id               + '</td>';
					code += '<td>' + remote_mode             + '</td>';
					code += '<td>' + remote_actions.join('') + '</td>';
					code += '</tr>';

				});

				code += '</table>';
				code += '</article>';

			});
*/

		} else {

//			code += '<article class="wide">';
//			code += '<h3>No Remote connected to any Server</h3>';
//			code += '</article>';

		}


		// ui.render(code, '#remotes-servers');

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.app.State.call(this, main);
		lychee.event.Emitter.call(this);


		lychee.debug = true;
		this.client  = new lychee.net.Client({});
		lychee.debug = false;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(project, remote, mode) {

			var server = _servers[project] || null;
			if (server !== null) {

				this.client.setHost(server.host);
				this.client.setPort(server.port);
				this.client.connect();


				var service = this.client.getService('debugger');
				if (service !== null) {
					service.setMode(mode);
					service.connect(remote);
				}


				this.client.disconnect();

			}

console.log('CONNECT', project, remote, mode, server);

		}, this);

		this.bind('disconnect', function(project, remote) {

			var server = _servers[project] || null;
			if (server !== null) {

				this.client.setHost(server.host);
				this.client.setPort(server.port);
				this.client.connect();


				var service = this.client.getService('debugger');
				if (service !== null) {
					service.disconnect(remote);
				}


				this.client.disconnect();

			}

console.log('DISCONNECT', project, remote, server);

		}, this);

		this.bind('submit', function(id, settings) {

			if (id === 'settings') {

			}

console.log(id, settings, _servers);

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize:   function() {},
		deserialize: function() {},



		/*
		 * CUSTOM API
		 */

		update: function(clock, delta) {

		},

		enter: function() {
			_ui_update.call(this);
		},

		leave: function() {

		}

	};


	return Class;

});

