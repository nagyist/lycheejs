
lychee.define('lychee.app.entity.Label').includes([
	'lychee.app.Entity'
]).exports(function(lychee, global, attachments) {

	const _Entity = lychee.import('lychee.app.Entity');
	const _FONT   = attachments["fnt"];



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.font  = _FONT;
		this.value = '';


		this.setFont(settings.font);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.value;


		settings.width  = this.width;
		settings.height = this.height;
		settings.shape  = _Entity.SHAPE.rectangle;


		_Entity.call(this, settings);

		settings = null;

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

		},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.entity.Label';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.value !== '') settings.value = this.value;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			let alpha    = this.alpha;
			let position = this.position;

			let x = position.x + offsetX;
			let y = position.y + offsetY;


			let font  = this.font;
			let value = this.value;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (font !== null) {

				renderer.drawText(
					x,
					y,
					value,
					font,
					true
				);

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				// refresh the layout
				if (this.value !== '') {
					this.setValue(this.value);
				}

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				let font = this.font;
				if (font !== null) {

					let dim = font.measure(value);

					this.width  = dim.realwidth;
					this.height = dim.realheight;

				}


				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

