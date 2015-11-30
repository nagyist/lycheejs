
lychee.define('app.state.Welcome').includes([
	'lychee.ui.State'
]).requires([
	'lychee.ui.entity.Helper',
	'lychee.ui.entity.Label',
	'app.ui.entity.Identifier',
	'app.ui.entity.Status',
	'app.ui.layer.Control',
	'app.ui.layer.Web'
]).exports(function(lychee, app, global, attachments) {

	var _blob   = attachments["json"].buffer;
	var _helper = new lychee.ui.entity.Helper();



	/*
	 * HELPERS
	 */

	var _update_projects = function() {

		this.main.reload(function(config, profile) {

			var projects = config.buffer || null;
			if (projects instanceof Array) {

				var value = projects.map(function(project) {

					var control = {
						label: [],
						value: []
					};

					var web     = {
						label: [],
						value: []
					};


					control.label.push('Edit');
					control.value.push('edit=' + project.identifier);


					if (project.filesystem !== null) {
						control.label.push('File');
						control.value.push('file=' + project.identifier);
					}


					if (project.server !== null) {
						control.label.push('Stop');
						control.value.push('stop=' + project.identifier);
					} else if (project.harvester === true) {
						control.label.push('Start');
						control.value.push('start=' + project.identifier);
					}


					project.web.forEach(function(obj) {

						var val = 'http://' + obj.host;
						if (obj.cultivator === true) {
							val = 'http://' + obj.host + project.identifier;
						}

						web.label.push('Web');
						web.value.push('web=' + val);

					});


					return {
						identifier: project.identifier,
						status:     project.server !== null ? 'Online' : 'Offline',
						control:    control,
						web:		web
					};

				});


				if (value.length > 0) {

					var table = this.queryLayer('ui', 'welcome > status').__content[0] || null;
					if (table !== null) {
						table.setValue(value);
					}

				}

			}

		}, this);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.ui.State.call(this, main);

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			lychee.ui.State.prototype.deserialize.call(this, blob);
			lychee.app.State.prototype.deserialize.call(this, _blob);


			this.queryLayer('ui', 'menu').setOptions([
				'Welcome',
				'Profile',
				'Console',
				'Remote',
				'Settings'
			]);

			this.queryLayer('ui', 'menu').setHelpers([
				'unboot',
				'refresh'
			]);


			this.queryLayer('ui', 'welcome > dialog').bind('change', function(value) {

				if (value === 'boot') {

					var profile = this.queryLayer('ui', 'welcome > dialog > profile');
					if (profile !== null) {

						_helper.setValue('boot=' + profile.value);
						_helper.trigger('touch');

						this.queryLayer('ui', 'welcome > dialog').setVisible(false);

						this.loop.setTimeout(3000, function() {

							this.reload(function(config, profile) {
								this.changeState('welcome');
							}, this);

						}, this.main);

					}

				}

			}, this);


			var viewport = this.viewport;
			if (viewport !== null) {

				viewport.relay('reshape', this.queryLayer('ui', 'welcome > status'));


				entity = this.queryLayer('ui', 'welcome > status');
				entity.bind('#reshape', function(entity, orientation, rotation, width, height) {

					var menu = this.queryLayer('ui', 'menu');
					var w    = (((width - menu.width) / 512) | 0) * 512;
					var h    = ((height               / 128) | 0) * 128;


					entity.width  = w;
					entity.height = h;

					entity.__content[0].width  = h - 32;
					entity.__content[0].height = h - 96;

					entity.trigger('relayout');

				}, this);

			}

		},

		serialize: function() {

			var data = lychee.ui.State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Welcome';


			return data;

		},

		enter: function(oncomplete, data) {

			var config = this.main.config;
			if (config === null || config.buffer === null) {

				this.queryLayer('ui', 'welcome > dialog').setVisible(true);
				this.queryLayer('ui', 'welcome > status').setVisible(false);

			} else {

				this.queryLayer('ui', 'welcome > dialog').setVisible(false);
				this.queryLayer('ui', 'welcome > status').setVisible(true);

				_update_projects.call(this);

			}


			lychee.ui.State.prototype.enter.call(this, oncomplete, data);

		},

		leave: function(oncomplete) {

			if (this.__interval !== null) {
				this.loop.removeInterval(this.__interval);
			}


			lychee.ui.State.prototype.leave.call(this, oncomplete);

		}

	};


	return Class;

});
