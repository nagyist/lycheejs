
lychee.define('game.entity.Ball').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _CONFIG  = attachments["json"].buffer;
	var _TEXTURE = attachments["png"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, _CONFIG, data);


		settings.texture = _TEXTURE;


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Ball';


			return data;

		}

	};


	return Class;

});
