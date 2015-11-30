
lychee.define('game.entity.Emblem').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _TEXTURE = attachments["png"];
	var _CONFIG  = {
		width:  256,
		height: 64
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _TEXTURE;
		settings.width   = _CONFIG.width;
		settings.height  = _CONFIG.height;


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Emblem';


			return data;

		}

	};


	return Class;

});

