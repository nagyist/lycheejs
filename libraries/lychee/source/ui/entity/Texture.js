
lychee.define('lychee.ui.entity.Texture').requires([
	'lychee.ui.entity.Upload',
	'lychee.ui.Sprite'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	const _Entity = lychee.import('lychee.ui.Entity');
	const _Upload = lychee.import('lychee.ui.entity.Upload');
	const _Sprite = lychee.import('lychee.ui.Sprite');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.font  = null;
		this.label = 'UPLOAD';
		this.value = null;

		this.__sprite = new _Sprite({});
		this.__upload = new _Upload({
			type: _Upload.TYPE.texture
		});


		this.setFont(settings.font);
		this.setLabel(settings.label);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.label;
		delete settings.value;


		_Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.__upload.bind('change', function(assets) {

			if (assets !== null && assets.length === 1) {

				let texture = assets[0];
				if (texture.width <= this.width && texture.height <= this.height) {

					let result = this.setValue(texture);
					if (result === true) {
						this.trigger('change', [ texture ]);
					}

				}

			}

		}, this);

		this.bind('touch', function(id, position, delta) {
			return this.__upload.trigger('touch', [ id, position, delta ]);
		}, this);

		this.bind('key', function(key, name, delta) {
			return this.__upload.trigger('key', [ key, name, delta ]);
		}, this);

		this.bind('relayout', function() {

			let sprite = this.__sprite;
			let upload = this.__upload;
			let value  = this.value;

			if (value !== null) {
				sprite.width  = value.width;
				sprite.height = value.height;
			}

			upload.position.x =  0;
			upload.position.y =  1 / 2 * this.height - 1 / 2 * upload.height;

			sprite.position.x =  0;
			sprite.position.y = -1 / 2 * this.height + 1 / 2 * sprite.height;
			sprite.trigger('relayout');

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

			let value = lychee.deserialize(blob.value);
			if (value !== null) {
				this.setValue(value);
			}

		},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.Button';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.label !== null) settings.label = this.label;


			if (this.font !== null)  blob.font  = lychee.serialize(this.font);
			if (this.value !== null) blob.value = lychee.serialize(this.value);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			_Entity.prototype.render.call(this, clock, delta);

			this.__sprite.update(clock, delta);
			this.__upload.update(clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let position = this.position;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;


			_Entity.prototype.render.call(this, renderer, offsetX, offsetY);

			this.__sprite.render(renderer, x, y);
			this.__upload.render(renderer, x, y);

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.__upload.setFont(font);
				this.font = font;

				return true;

			}


			return false;

		},

		setLabel: function(label) {

			label = typeof label === 'string' ? label : null;


			if (label !== null) {

				this.__upload.setLabel(label);
				this.label = label;

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = value instanceof Texture ? value : null;


			if (value !== null) {

				this.__sprite.setTexture(value);
				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

