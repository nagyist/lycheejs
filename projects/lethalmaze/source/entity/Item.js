
lychee.define('game.entity.Item').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;


	var Class = function(data, main) {

		var settings = lychee.extend({}, data);


		settings.collision = lychee.app.Entity.COLLISION.A;
		settings.texture   = _texture;
		settings.map       = _config.map;
		settings.width     = _config.width  - 4;
		settings.height    = _config.height - 4;
		settings.shape     = lychee.app.Entity.SHAPE.rectangle;
		settings.states    = _config.states;
		settings.state     = 'default';


		delete settings.type;


		lychee.app.Sprite.call(this, settings);

	};


	Class.prototype = {

	};


	return Class;

});

