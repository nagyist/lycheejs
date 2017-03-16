
lychee.define('ranger.state.Welcome').requires([
	'lychee.ui.entity.Helper',
	'lychee.ui.entity.Label',
	'lychee.ui.layer.Table',
	'ranger.ui.entity.Identifier',
	'ranger.ui.layer.Control',
	'ranger.ui.layer.Web'
]).includes([
	'lychee.ui.State'
]).exports(function(lychee, global, attachments) {

	const _Helper = lychee.import('lychee.ui.entity.Helper');
	const _State  = lychee.import('lychee.ui.State');
	const _BLOB   = attachments["json"].buffer;
	const _helper = new _Helper();



	/*
	 * HELPERS
	 */

	let _on_sync = function(projects) {

		this.queryLayer('ui', 'welcome > dialog').setVisible(false);
		this.queryLayer('ui', 'welcome > status').setVisible(true);


		if (projects instanceof Array) {

			let value = projects.map(function(project) {

				let control = {
					label: [],
					value: []
				};

				let web     = {
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


				if (project.web.length > 0) {

					project.web.forEach(function(value) {

						web.label.push('Web');
						web.value.push('web=' + value);

					});

				}


				return {
					identifier: project.identifier,
					control:    control,
					web:		web
				};

			});


			if (value.length > 0) {

				let table = this.queryLayer('ui', 'welcome > status > 0');
				if (table !== null) {
					table.setValue(value);
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		_State.call(this, main);


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			this.queryLayer('ui', 'menu').setHelpers([
				'refresh',
				'unboot'
			]);


			this.queryLayer('ui', 'welcome > dialog').bind('change', function(value) {

				if (value === 'boot') {

					let profile = this.queryLayer('ui', 'welcome > dialog > profile');
					if (profile !== null) {

						_helper.setValue('boot=' + profile.value);
						_helper.trigger('touch');

						this.queryLayer('ui', 'welcome > dialog').setVisible(false);

						this.loop.setTimeout(3000, function() {
							this.changeState('welcome');
						}, this.main);

					}

				}

			}, this);


			let entity   = null;
			let viewport = this.viewport;
			if (viewport !== null) {

				entity = this.queryLayer('ui', 'welcome');
				entity.bind('#relayout', function(blueprint) {

					let element = this.queryLayer('ui', 'welcome > status');
					if (element !== null) {
						element.width  = blueprint.width - 64;
						element.height = blueprint.height;
						element.trigger('relayout');
					}

					let entity = element.getEntity('0');
					if (entity !== null && element !== null) {
						entity.width  = element.width  - 32;
						entity.height = element.height - 96;
					}

				}, this);

			}

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'ranger.state.Welcome';


			return data;

		},

		enter: function(oncomplete, data) {

			this.queryLayer('ui', 'welcome > dialog').setVisible(true);
			this.queryLayer('ui', 'welcome > status').setVisible(false);


			let client = this.client;
			if (client !== null) {

				let service = client.getService('project');
				if (service !== null) {
					service.bind('sync', _on_sync, this);
					service.sync();
				}

			}


			_State.prototype.enter.call(this, oncomplete, data);

		},

		leave: function(oncomplete) {

			let client = this.client;
			if (client !== null) {

				let service = client.getService('project');
				if (service !== null) {
					service.unbind('sync', _on_sync, this);
				}

			}


			_State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});
