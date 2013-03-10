
lychee.define('game.entity.Ball').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments['png'];


	var Class = function() {

		var settings = {
			radius:    11,
			collision: lychee.game.Entity.COLLISION.A,
			shape:     lychee.game.Entity.SHAPE.circle,

			texture:   _texture,
			map:       null
		};


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});
