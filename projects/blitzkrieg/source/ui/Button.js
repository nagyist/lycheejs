
lychee.define('game.ui.Button').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;
		settings.map     = _config.map;
		settings.states  = _config.states;


		lychee.ui.Sprite.call(this, settings);

	};


	Class.prototype = {

	};


	return Class;

});

