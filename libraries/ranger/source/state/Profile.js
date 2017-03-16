
lychee.define('ranger.state.Profile').requires([
	'lychee.codec.JSON',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.entity.Helper',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Switch'
]).includes([
	'lychee.ui.State'
]).exports(function(lychee, global, attachments) {

	const _Helper = lychee.import('lychee.ui.entity.Helper');
	const _State  = lychee.import('lychee.ui.State');
	const _JSON   = lychee.import('lychee.codec.JSON');
	const _BLOB   = attachments["json"].buffer;
	const _CACHE  = {};
	const _helper = new _Helper();



	/*
	 * HELPERS
	 */

	const _on_sync = function(profiles) {

		if (profiles instanceof Array) {

			let layer = this.queryLayer('ui', 'profile');
			let that  = this;


			profiles.forEach(function(profile) {

				_CACHE[profile.identifier] = profile;


				let entity = layer.getEntity(profile.identifier);
				if (entity === null) {
					entity = lychee.deserialize(lychee.serialize(layer.getEntity('development')));
					entity.bind('#change', _on_change, that);
					layer.setEntity(profile.identifier, entity);
				}


				entity.setLabel(profile.identifier);
				entity.getEntity('host').setValue(profile.host);
				entity.getEntity('port').setValue(profile.port);
				entity.getEntity('debug').setValue(profile.debug === true ? 'on' : 'off');
				entity.getEntity('sandbox').setValue(profile.sandbox === true ? 'on' : 'off');

			});

		}

	};

	const _on_change = function(entity, action) {

		if (action === 'save') {

			let identifier = entity.label;
			let host       = entity.getEntity('host').value;
			let port       = entity.getEntity('port').value;
			let debug      = entity.getEntity('debug').value;
			let sandbox    = entity.getEntity('sandbox').value;
			let profile    = _CACHE[identifier] || null;
			if (profile !== null) {

				profile = _CACHE[identifier] = {
					identifier: identifier,
					host:       host,
					port:       port,
					debug:      debug   === 'on',
					sandbox:    sandbox === 'on'
				};


				let data = _JSON.encode(profile);
				if (data !== null) {
					_helper.setValue('profile=' + identifier + '?data=' + data.toString('base64'));
					_helper.trigger('touch');
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


			let entity = this.queryLayer('ui', 'profile > development');
			if (entity !== null) {
				entity.bind('#change', _on_change, this);
			}

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'ranger.state.Profile';


			return data;

		},

		enter: function(oncomplete, data) {

			let client = this.client;
			if (client !== null) {

				let service = client.getService('profile');
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

				let service = client.getService('profile');
				if (service !== null) {
					service.unbind('sync', _on_sync, this);
				}

			}


			_State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});

