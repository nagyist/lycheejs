
lychee.define('tool.state.Profiles').includes([
	'lychee.game.State',
	'lychee.event.Emitter'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	/*
	 * HELPERS
	 */

	var _profiles = {};

	var _save_config = function(config) {

		var url    = config.url;
		var buffer = config.buffer;

		if (buffer instanceof Object) {

			var xhr = new XMLHttpRequest();

			xhr.open('PUT', url, true);

			xhr.onload = function() {

				ui.enable('#profiles-save-boot');

			};

			xhr.onerror = xhr.ontimeout = function() {

				ui.disable('#profiles-save-boot');

			};

			xhr.send(JSON.stringify(buffer));

		}

	};

	var _ui_update = function() {

		var config = new Config('http://localhost:4848/api/Profile?timestamp=' + Date.now());
		var that   = this;

		config.onload = function(result) {

			if (this.buffer instanceof Array) {

				this.buffer.forEach(function(profile) {

					var id = profile.identifier;

					if (_profiles[id] instanceof Object) {
						_profiles[id].port  = profile.port;
						_profiles[id].hosts = profile.hosts;
					} else {
						_profiles[id] = profile;
					}

				});

			}

			_ui_render_select.call(that, this.buffer);

		};

		config.load();

	};

	var _ui_render_select = function(profiles) {

		if (profiles instanceof Array) {

			var code = '';
			var that = this;
			var id   = this.__profile.identifier;


			code = profiles.map(function(profile, index) {

				var checked = id === profile.identifier;
				var chunk   = '';

				chunk += '<li>';
				chunk += '<input name="profiles-profile" type="radio" onclick="MAIN.state.trigger(\'select\', [this.value]);" value="' + profile.identifier + '"' + (checked ? ' checked' : '') + '>';
				chunk += '<span>' + profile.identifier + '</span>';
				chunk += '</li>';

				return chunk;

			}).join('');

			code += '<li><input name="profiles-profile" type="radio" onclick="MAIN.state.trigger(\'select\', [this.value]);" value="new-profile"><span>new profile</span></li>';

			ui.render(code, '#profiles-select ul.select');

		}

	};

	var _ui_render_settings = function(profile) {

		if (profile instanceof Object) {

			var code = '';


			Object.keys(profile.hosts).forEach(function(host, index) {

				var project = profile.hosts[host] === null ? '*' : profile.hosts[host];

				code += '<tr>';
				code += '<td><input name="host-' + index + '" type="text" value="' + host + '"></td>';
				code += '<td><input name="project-' + index + '" type="text" value="' + project + '"></td>';
				code += '<td><button class="ico-remove ico-only" onclick="MAIN.state.trigger(\'remove\', [\'' + host + '\']);return false;"></button></td>';
				code += '</tr>';

			});


			ui.render(code,               '#profiles-settings table tbody');
			ui.render(profile.identifier, '#profiles-save-identifier');
			ui.render(profile.port,       '#profiles-save-port');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.__profile = {
			identifier: 'development',
			port:       8080,
			hosts:      { localhost: null }
		};


		lychee.game.State.call(this, main);
		lychee.event.Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('select', function(identifier) {

			ui.disable('#profiles-save-boot');


			var profile = _profiles[identifier];
			if (profile instanceof Object) {

				this.__profile = profile;
				_ui_render_settings.call(this, this.__profile);

			} else if (identifier === 'new-profile') {

				this.__profile = {
					identifier: 'new-profile',
					port:       8080,
					hosts:      { localhost: null }
				};
				_ui_render_settings.call(this, this.__profile);

			}

		}, this);

		this.bind('submit', function(id, settings) {

			if (id === 'settings') {

				this.__profile.hosts = {};


				var length = (Object.keys(settings).length / 2) - 1;

				for (var i = 0; i < length; i++) {

					var host    = settings['host-' + i];
					var project = settings['project-' + i];

					this.__profile.hosts[host] = project === '*' ? null : project;

				}

			}

		}, this);

		this.bind('add', function(host, project) {

			if (host.length > 0 && project.length > 0) {

				if (this.__profile.hosts[host] === undefined) {
					this.__profile.hosts[host] = project === '*' ? null : project;
					_ui_render_settings.call(this, this.__profile);
				}

			}

		}, this);

		this.bind('remove', function(host) {

			if (this.__profile.hosts[host] !== undefined) {
				delete this.__profile.hosts[host];
				_ui_render_settings.call(this, this.__profile);
			}

		}, this);

		this.bind('save', function(identifier, port) {

			this.__profile.identifier = identifier;
			this.__profile.port       = port;


			var config = lychee.deserialize({
				constructor: 'Config',
				arguments:   [ 'http://localhost:4848/api/Profile?timestamp=' + Date.now() ],
				blob:        {
					buffer: 'data:application/json;base64,' + new Buffer(JSON.stringify(this.__profile), 'utf8').toString('base64')
				}
			});


			_save_config.call(this, config);

// TODO: PUT request to API to store profile
// TODO: Relocate to lycheejs://boot=identifier afterwards
// TODO: Error integration if API requests fail (or are they failsafe?)

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

