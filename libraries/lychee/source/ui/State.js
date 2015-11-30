
lychee.define('lychee.ui.State').requires([
	'lychee.effect.Position',
	'lychee.effect.Visible',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.Menu',
	'lychee.ui.element.Input',
	'lychee.ui.element.Jukebox',
	'lychee.ui.element.Network',
	'lychee.ui.element.Stash',
	'lychee.ui.element.Storage',
	'lychee.ui.element.Viewport',
	'lychee.ui.sprite.Background',
	'lychee.ui.sprite.Emblem'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	var _BLOB = attachments["json"].buffer;
	var _MENU = null;



	/*
	 * HELPERS
	 */

	var _on_fade = function(id) {

		var fade_offset = -3/2 * this.getLayer('ui').height;
		var entity      = this.queryLayer('ui', id);
		var layers      = this.getLayer('ui').entities.filter(function(layer) {
			return lychee.interfaceof(lychee.ui.Menu, layer) === false;
		});


		if (entity !== null && entity.visible === false) {

			layers.forEach(function(layer) {

				if (entity === layer) {

					layer.setVisible(true);
					layer.setPosition({
						y: fade_offset
					});

					layer.addEffect(new lychee.effect.Position({
						type:     lychee.effect.Position.TYPE.easeout,
						duration: 300,
						position: {
							y: 0
						}
					}));

				} else {

					layer.setPosition({
						y: 0
					});

					layer.addEffect(new lychee.effect.Position({
						type:     lychee.effect.Position.TYPE.easeout,
						duration: 300,
						position: {
							y: fade_offset
						}
					}));

					layer.addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: false
					}));

				}

			});

		} else if (entity === null) {

			layers.forEach(function(layer) {

				layer.setPosition({
					y: 0
				});

				layer.addEffect(new lychee.effect.Position({
					type:     lychee.effect.Position.TYPE.easeout,
					duration: 300,
					position: {
						y: fade_offset
					}
				}));

				layer.addEffect(new lychee.effect.Visible({
					delay:   300,
					visible: false
				}));

			});

		}

	};

	var _on_relayout = function() {

		var viewport = this.viewport;
		if (viewport !== null) {

			var entity = null;
			var width  = viewport.width;
			var height = viewport.height;
			var menu   = this.queryLayer('ui', 'menu');


			entity = this.getLayer('ui');
			entity.width      = width;
			entity.height     = height;


			for (var e = 0, el = entity.entities.length; e < el; e++) {

				var blueprint = entity.entities[e];
				if (blueprint !== menu) {

					blueprint.width      = width - menu.width;
					blueprint.height     = height;
					blueprint.position.x = menu.width / 2;
					blueprint.trigger('relayout');

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.app.State.call(this, main);


		this.deserialize(_BLOB);



		/*
		 * INITIALIZATION
		 */

		var input = this.input;
		if (input !== null) {

			input.bind('escape', function(delta) {

				var menu = this.queryLayer('ui', 'menu');
				if (menu !== null) {

					if (menu.state === 'active') {

						if (this.__focus !== null) {
							this.__focus.trigger('blur');
						}

						this.__focus = this.queryLayer('ui', menu.value.toLowerCase());
						this.__focus.trigger('focus');

					} else {

						if (this.__focus !== null) {
							this.__focus.trigger('blur');
						}

						this.__focus = menu;
						this.__focus.trigger('focus');

					}

				}

			}, this);

		}

		var viewport = this.viewport;
		if (viewport !== null) {

			viewport.relay('reshape', this.queryLayer('bg', 'background'));
			viewport.relay('reshape', this.queryLayer('bg', 'emblem'));
			viewport.relay('reshape', this.queryLayer('ui', 'menu'));

			viewport.relay('reshape', this.queryLayer('ui', 'welcome'));
			viewport.relay('reshape', this.queryLayer('ui', 'settings'));


			this.queryLayer('ui', 'menu').bind('relayout', function() {
				_on_relayout.call(this);
			}, this);

			viewport.bind('reshape', function(orientation, rotation, width, height) {
				_on_relayout.call(this);
			}, this);

		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.State.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.State';


			return data;

		},

		deserialize: function(blob) {

			lychee.app.State.prototype.deserialize.call(this, blob);


			var menu = this.queryLayer('ui', 'menu');
			if (_MENU === null && menu !== null) {

				_MENU = menu;

			} else if (_MENU !== null && menu !== null) {

				var welcome = this.queryLayer('ui', 'welcome');
				if (welcome !== null) {
					this.getLayer('ui').removeEntity(welcome);
				}

				var settings = this.queryLayer('ui', 'settings');
				if (settings !== null) {
					this.getLayer('ui').removeEntity(settings);
				}

				this.getLayer('ui').removeEntity(menu);
				this.getLayer('ui').setEntity('menu', _MENU);

			}


			this.queryLayer('ui', 'menu').bind('change', function(value) {

				var entity = this.queryLayer('ui', value.toLowerCase());
				if (entity !== null) {

					_on_fade.call(this, value.toLowerCase());


					var menu = this.queryLayer('ui', 'menu');
					if (menu.state === 'default') {

						if (this.__focus !== null) {
							this.__focus.trigger('blur');
						}

						this.__focus = this.queryLayer('ui', menu.value.toLowerCase());
						this.__focus.trigger('focus');

					}

				}

			}, this);

		},



		/*
		 * STATE API
		 */

		enter: function(oncomplete, data) {

			if (data !== null) {
				_on_fade.call(this, data);
			} else {
				_on_fade.call(this, 'welcome');
			}


			var menu = this.queryLayer('ui', 'menu');
			if (menu !== null) {

				this.__focus = this.queryLayer('ui', menu.value.toLowerCase());
				this.__focus.trigger('focus');

			}


			this.loop.setTimeout(400, function() {
				lychee.app.State.prototype.enter.call(this, oncomplete);
			}, this);

		},

		leave: function(oncomplete) {

			_on_fade.call(this, null);

			this.loop.setTimeout(400, function() {
				lychee.app.State.prototype.leave.call(this, oncomplete);
			}, this);

		}

	};


	return Class;

});
