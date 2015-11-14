
lychee.define('app.ui.Avatar').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, app, global, attachments) {

	var _texture = attachments["png"];
	var _config  = {
		width:  128,
		height: 128
	};



	/*
	 * HELPERS
	 */

	var _is_color = function(color) {

		if (typeof color === 'string') {

			if (color.match(/(#[AaBbCcDdEeFf0-9]{6})/)) {
				return true;
			}

		}


		return false;

	};

	var _random_color = function() {

		var intr = parseInt((Math.random() * 255).toFixed(0), 10);
		var intg = parseInt((Math.random() * 255).toFixed(0), 10);
		var intb = parseInt((Math.random() * 255).toFixed(0), 10);

		var strr = intr > 15 ? (intr).toString(16) : '0' + (intr).toString(16);
		var strg = intg > 15 ? (intg).toString(16) : '0' + (intg).toString(16);
		var strb = intb > 15 ? (intb).toString(16) : '0' + (intb).toString(16);

		return '#' + strr + strg + strb;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.value = _random_color();


		this.setValue(settings.value);

		delete settings.value;


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;


		lychee.ui.Sprite.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {

			this.value = _random_color();
			this.trigger('change', [ this.value ]);

		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.ui.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.Avatar';

			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.value !== null) settings.value = this.value;


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;
			var value    = this.value;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			var x  = position.x + offsetX;
			var y  = position.y + offsetY;
			var x1 = x - this.width  / 2;
			var y1 = y - this.height / 2;


			renderer.drawSprite(x1, y1, _texture);

			renderer.drawBox(x - 13, y - 13, x + 13, y - 2, value, true);
			renderer.drawBox(x - 10, y - 12, x + 10, y - 1, value, true);
			renderer.drawBox(x -  6, y - 12, x +  6, y - 0, value, true);

			renderer.drawCircle(x, y - 13, 12, value, true);
			renderer.drawCircle(x, y - 18, 10, value, true);


			if (alpha !== 1) {
				renderer.setAlpha(1);
			}

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = _is_color(value) === true ? value : null;


			if (value !== null) {

				this.value = value;
				this.trigger('change', [ this.value ]);

				return true;

			}


			return false;

		}

	};


	return Class;

});

