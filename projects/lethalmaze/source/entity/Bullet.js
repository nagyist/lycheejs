
lychee.define('game.entity.Bullet').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.collision = lychee.app.Entity.COLLISION.A;
		settings.texture   = _texture;
		settings.map       = _config.map;
		settings.radius    = _config.radius;
		settings.shape     = lychee.app.Entity.SHAPE.circle;
		settings.states    = _config.states;
		settings.state     = 'default';


		delete settings.type;


		lychee.app.Sprite.call(this, settings);

	};


	Class.prototype = {

	};


	return Class;

});

