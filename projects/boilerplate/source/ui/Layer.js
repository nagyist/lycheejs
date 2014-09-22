
lychee.define('game.ui.Layer').includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;
	var _font    = attachments["fnt"];


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.font  = null;
		this.label = null;

		this.__statemap = _config.map['default'][0];


		this.setFont(settings.font || _font);
		this.setLabel(settings.label);

		delete settings.font;
		delete settings.label;


		settings.width  = _config.width;
		settings.height = _config.height;


		lychee.ui.Layer.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha = this.alpha;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			var texture = _texture || null;
			if (texture !== null) {

				var map = this.__statemap || null;
				if (map !== null) {

					var position = this.position;

					var x1 = position.x + offsetX - this.width  / 2;
					var y1 = position.y + offsetY - this.height / 2;


					renderer.drawSprite(
						x1,
						y1,
						texture,
						map
					);


					var font  = this.font;
					var label = this.label;
					if (font !== null && label !== null) {

						renderer.drawText(
							position.x + offsetX,
							y1 + 64,
							label,
							font,
							true
						);

					}

				}

			}


			lychee.ui.Layer.prototype.render.call(this, renderer, offsetX, offsetY);


			if (alpha !== 1) {
				renderer.setAlpha(1);
			}

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				return true;

			}


			return false;

		},

		setLabel: function(label) {

			label = typeof label === 'string' ? label : null;


			if (label !== null) {

				this.label = label;

				return true;

			}


			return false;

		}

	};


	return Class;

});

