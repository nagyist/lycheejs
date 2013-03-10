
lychee.define('game.entity.Circle').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(settings) {

		settings.shape = lychee.ui.Entity.SHAPE.circle;


		lychee.ui.Entity.call(this, settings);


		//this.bind('swipe', function(id, type, position, delta, swipe) {
		//	console.log(type, position.x, position.y);
		//}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;
			var radius   = this.radius;

			renderer.drawCircle(
				offsetX + position.x,
				offsetY + position.y,
				radius,
				'#ff0000',
				true
			);

		}



		/*
		 * CUSTOM API
		 */

	};


	return Class;

});

