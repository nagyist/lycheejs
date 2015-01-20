
lychee.define('game.ui.Button').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;
	var _font    = attachments["fnt"];


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.font  = null;
		this.label = null;


		this.setFont(settings.font || _font);
		this.setLabel(settings.label);

		delete settings.font;
		delete settings.label;


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;
		settings.map     = _config.map;
		settings.states  = _config.states;
		settings.state   = settings.state || 'default';


		lychee.ui.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.font instanceof Object) {
				this.font = lychee.deserialize(blob.font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.Button';

			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.label !== null) settings.label = this.label;


			if (this.font !== null) {
				blob.font = lychee.serialize(this.font);
			}


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			lychee.ui.Sprite.prototype.render.call(this, renderer, offsetX, offsetY);


			var position = this.position;


			var font  = this.font;
			var label = this.label;
			if (font !== null && label !== null) {

				var x = position.x + offsetX;
				var y = position.y + offsetY;


				renderer.drawText(
					x,
					y,
					label,
					font,
					true
				);

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

