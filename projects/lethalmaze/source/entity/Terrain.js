
lychee.define('game.entity.Terrain').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _texture;
		settings.map     = _config.map;
		settings.width   = _config.width;
		settings.height  = _config.height;
		settings.shape   = lychee.app.Entity.SHAPE.rectangle;
		settings.states  = _config.states;
		settings.state   = 'default';


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});

