
lychee.define('game.entity.Background').includes([
	'lychee.ui.Background'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.color   = '#050a0d';
		settings.texture = _texture;
		settings.map     = _config.map;
		settings.states  = _config.states;
		settings.state   = 'default';


		lychee.ui.Background.call(this, settings);

		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});

