
lychee.define('game.ui.Cursor').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;
	var _font    = attachments["fnt"];


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.label   = null;
		this.visible = true;


		this.setVisible(settings.visible);

		delete settings.visible;


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;
		settings.map     = _config.map;
		settings.states  = _config.states;


		lychee.app.Sprite.call(this, settings);

	};


	Class.prototype = {

		render: function(renderer, offsetX, offsetY) {

			var visible = this.visible;
			if (visible === true) {


				var label = this.label;
				if (label !== null) {

					var x = this.position.x + offsetX;
					var y = this.position.y + offsetY - this.height / 2;

					renderer.drawText(
						x,
						y,
						label,
						_font,
						true
					);

				}


				lychee.app.Sprite.prototype.render.call(this, renderer, offsetX, offsetY);

			}

		},

		setLabel: function(label) {

			label = typeof label === 'string' ? label : null;


			if (label !== null) {

				this.label = label;

				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			if (visible === true || visible === false) {

				this.visible = visible;

				return true;

			}


			return false;

		}

	};


	return Class;

});

