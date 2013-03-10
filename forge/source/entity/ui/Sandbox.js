
lychee.define('game.entity.ui.Sandbox').includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data, state) {

		this.state = state;


		var settings = lychee.extend({}, data);


		lychee.ui.Layer.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;


			var hwidth  = this.width / 2;
			var hheight = this.height / 2;

			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				'#ff00ff',
				true,
				1
			);

		}

	};


	return Class;

});

