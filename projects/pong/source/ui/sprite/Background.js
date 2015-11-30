
lychee.define('game.ui.sprite.Background').includes([
	'lychee.ui.sprite.Background'
]).exports(function(lychee, game, global, attachments) {

	var _TEXTURE = attachments["png"];
	var _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.color   = '#050a0d';
		settings.texture = _TEXTURE;
		settings.map     = _CONFIG.map;
		settings.states  = _CONFIG.states;
		settings.state   = 'default';


		lychee.ui.sprite.Background.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.sprite.Background.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.sprite.Background';


			return data;

		}

	};


	return Class;

});

