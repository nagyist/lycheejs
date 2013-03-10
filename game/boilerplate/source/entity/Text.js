
lychee.define('game.entity.Text').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.text = null;
		this.font = null;


		this.setFont(settings.font);
		this.setText(settings.text);


		delete settings.text;
		delete settings.font;

		settings.width  = this.width;
		settings.height = this.height;


		lychee.ui.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;
			var text = this.text;
			var font = this.font;


			renderer.drawText(
				offsetX + position.x,
				offsetY + position.y,
				text,
				font,
				true
			);

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			if (font instanceof Font) {
				this.font = font;
				return true;
			}


			return false;

		},

		setText: function(text) {

			if (typeof text === 'string') {

				this.text = text;


				var width   = 0;
				var height  = 0;

				if (this.font !== null) {

					var kerning = this.font.kerning;

					for (var t = 0, tl = text.length; t < tl; t++) {
						var chr = this.font.get(text[t]);
						width += chr.real + kerning;
						height = Math.max(height, chr.height);
					}

				}

				this.width  = width;
				this.height = height;


				return true;

			}


			return false;

		}

	};


	return Class;

});

