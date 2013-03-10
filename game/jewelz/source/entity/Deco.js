
lychee.define('game.entity.Deco').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"];


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		settings.width   = _config.tile;
		settings.height  = _config.tile;
		settings.states  = _config.states;
		settings.texture = _texture;
		settings.map     = _config.map;


		lychee.game.Sprite.call(this, settings);

	};



	/*
	 * PUBLIC HELPER
	 */

	Class.substate = function(x, y) {

		var substate = 'a';
		if (x % 2 === 0) {
			if (y % 2 === 0) {
				substate = 'd';
			} else {
				substate = 'b';
			}
		} else {
			if (y % 2 === 0) {
				substate = 'c';
			} else {
				substate = 'a';
			}
		}


		return substate;

	};


	Class.prototype = {
	};


	return Class;

});

