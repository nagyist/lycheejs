
lychee.define('app.ui.Bubble').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, app, attachments) {

	var _font           = attachments["fnt"];
	var _config         = attachments["json"].buffer;
	var _texture        = attachments["png"];
	var _avatar_config  = attachments["avatar.json"].buffer;
	var _avatar_texture = attachments["avatar.png"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.key        = settings.key   || 'urine';
		this.value      = settings.value || '0%';


		settings.radius = 48;
		settings.shape  = lychee.ui.Entity.SHAPE.circle;


		lychee.ui.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;
			var map      = null;
			var radius   = this.radius;


			renderer.setAlpha(0.6);

			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius - 1,
				'#00000',
				true
			);

			renderer.setAlpha(1);

			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius,
				'#0ba2ff',
				false,
				1
			);


			if (this.key === 'avatar') {

				map = _avatar_config.map[this.value] || null;

				if (map !== null) {

					renderer.drawSprite(
						position.x + offsetX - 24,
						position.y + offsetY - 24,
						_avatar_texture,
						map[0]
					);

				}

			} else {

				map = _config.map[this.key] || _config.map[this.value] || null;

				if (map !== null) {

					renderer.drawSprite(
						position.x + offsetX - 16,
						position.y + offsetY - 30,
						_texture,
						map[0]
					);

					renderer.drawText(
						position.x + offsetX,
						position.y + offsetY + 12,
						this.value,
						_font,
						true
					);

				} else {

					renderer.drawText(
						position.x + offsetX,
						position.y + offsetY + 2,
						this.value,
						_font,
						true
					);

				}

			}

		}

	};


	return Class;

});

