
lychee.define('game.entity.Paddle').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _textures = {
		player: attachments['blue.png'],
		enemy:  attachments['red.png']
	};


	var Class = function(id) {

		var settings = {
			width:     24,
			height:    104,
			collision: lychee.game.Entity.COLLISION.A,
			shape:     lychee.game.Entity.SHAPE.rectangle,

			texture:   _textures[id] || null,
			map:       null
		};


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});
