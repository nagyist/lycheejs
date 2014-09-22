
lychee.define('game.entity.Particle').includes([
	'lychee.game.Entity'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.color = '#888888';


		this.setColor(settings.color);

		delete settings.color;


		settings.radius = (Math.random() * 48) | 0;
		settings.shape  = lychee.ui.Entity.SHAPE.circle;


		lychee.game.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.game.Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Particle';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			var alpha    = this.alpha;
			var position = this.position;
			var radius   = this.radius;
			var color    = this.color;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			renderer.drawCircle(
				offsetX + position.x,
				offsetY + position.y,
				radius,
				color,
				true
			);


			if (alpha !== 1) {
				renderer.setAlpha(1);
			}

		},



		/*
		 * CUSTOM API
		 */

		setColor: function(color) {

			color = typeof color === 'string' ? color : null;


			if (color !== null) {

				this.color = color;

				return true;

			}


			return false;

		}

	};


	return Class;

});

