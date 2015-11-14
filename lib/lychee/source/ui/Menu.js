
lychee.define('lychee.ui.Menu').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Position',
	'lychee.effect.Visible',
	'lychee.effect.Width',
	'lychee.ui.Label',
	'lychee.ui.Select'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	var _font = attachments["fnt"];



	/*
	 * HELPERS
	 */

	var _is_color = function(color) {

		if (typeof color === 'string') {

			if (color.match(/(#[AaBbCcDdEeFf0-9]{6})/) || color.match(/(#[AaBbCcDdEeFf0-9]{8})/)) {
				return true;
			}

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.color      = '#363f3e';
		this.font       = _font;
		this.options    = [ 'welcome', 'network', 'settings', 'about' ];
		this.state      = 'default';
		this.value      = 'welcome';

		this.__boundary = 0;
		this.__states   = { 'default': null, 'active': null };


		this.setColor(settings.color);
		this.setFont(settings.font);
		this.setOptions(settings.options);
		this.setState(settings.state);
		this.setValue(settings.value);

		delete settings.color;
		delete settings.font;
		delete settings.options;
		delete settings.state;
		delete settings.value;


		settings.width  = 144;
		settings.height = 144;
		settings.alpha  = 0.0;


		lychee.ui.Layer.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			var miny = -1/2 * this.height + 64;
			if (miny > position.y) {

				if (this.state === 'active') {
					this.trigger('blur');
				} else {
					this.trigger('focus');
				}

			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);

		this.bind('reshape', function(orientation, rotation, width, height) {

			if (typeof width === 'number' && typeof height === 'number') {

				if (this.state === 'active') {
					this.width  = 144;
					this.height = height;
				} else {
					this.width  = 64;
					this.height = height;
				}


				this.__boundary = -1/2 * width;
				this.position.x = -1/2 * width + this.width / 2;


				var entity = null;
				var x1     = -1/2 * this.width;
				var y1     = -1/2 * this.height;


				entity = this.getEntity('label');
				entity.position.x = -52 + entity.width / 2;
				entity.position.y =  y1 + 21 + entity.height / 2;

				entity = this.getEntity('select');
				entity.position.x = 8;
				entity.position.y = y1 + 64 + entity.height / 2;

			}

		}, this);


		this.setEntity('label', new lychee.ui.Label({
			label: 'MENU',
			font:  this.font
		}));

		this.setEntity('select', new lychee.ui.Select({
			options: this.options,
			value:   this.value
		}));

		this.getEntity('select').bind('change', function(value) {

			var result = this.setValue(value);
			if (result === true) {
				this.trigger('change', [ value ]);
			}

		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Layer.prototype.serialize.call(this);
			data['constructor'] = 'lyche.ui.Menu';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.color !== null) settings.color = this.color;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			var alpha    = this.alpha;
			var color    = this.color;
			var position = this.position;


			var x1 = position.x + offsetX - this.width  / 2;
			var y1 = position.y + offsetY - this.height / 2;
			var x2 = x1 + this.width;
			var y2 = y1 + this.height;


			if (color !== null) {

				renderer.drawBox(
					x1,
					y1,
					x2,
					y2,
					color,
					true
				);

				renderer.drawBox(
					x2 - 48,
					y1 + 20,
					x2 - 16,
					y1 + 22,
					'#ffffff',
					true
				);

				renderer.drawBox(
					x2 - 48,
					y1 + 31,
					x2 - 16,
					y1 + 33,
					'#ffffff',
					true
				);

				renderer.drawBox(
					x2 - 48,
					y1 + 42,
					x2 - 16,
					y1 + 44,
					'#ffffff',
					true
				);

			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			if (alpha !== 0) {
				lychee.ui.Layer.prototype.render.call(this, renderer, offsetX, offsetY);
			}

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setColor: function(color) {

			color = _is_color(color) ? color : null;


			if (color !== null) {

				this.color = color;

				return true;

			}


			return false;

		},

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				return true;

			}


			return false;

		},

		setOptions: function(options) {

			options = options instanceof Array ? options : null;


			if (options !== null) {

				this.options = options.map(function(option) {
					return '' + option;
				});

				return true;

			}


			return false;

		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__states[id] !== undefined) {

				if (id === 'active') {

					this.removeEffects();

					this.addEffect(new lychee.effect.Alpha({
						type:     lychee.effect.Alpha.TYPE.easeout,
						delay:    300,
						duration: 300,
						alpha:    1.0
					}));

					this.addEffect(new lychee.effect.Position({
						type:     lychee.effect.Position.TYPE.easeout,
						duration: 300,
						position: {
							x: this.__boundary + 70
						}
					}));

					this.addEffect(new lychee.effect.Width({
						type:     lychee.effect.Width.TYPE.easeout,
						duration: 300,
						width:    144
					}));

					this.getEntity('label').addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: true
					}));

					this.getEntity('select').addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: true
					}));

				} else {

					this.removeEffects();

					this.addEffect(new lychee.effect.Alpha({
						type:     lychee.effect.Alpha.TYPE.easeout,
						duration: 300,
						alpha:    0.0
					}));

					this.addEffect(new lychee.effect.Position({
						type:     lychee.effect.Position.TYPE.easeout,
						delay:    300,
						duration: 300,
						position: {
							x: this.__boundary + 30
						}
					}));

					this.addEffect(new lychee.effect.Width({
						type:     lychee.effect.Width.TYPE.easeout,
						delay:    300,
						duration: 300,
						width:     64
					}));

					this.getEntity('label').addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: false
					}));

					this.getEntity('select').addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: false
					}));

				}


				this.state = id;

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Class;

});

