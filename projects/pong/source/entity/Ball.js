
lychee.define('game.entity.Ball').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _config  = attachments["json"].buffer;
	var _texture = attachments["png"];


	var Class = function(data) {

		var settings = lychee.extend({}, _config, data);


		settings.texture = _texture;


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.game.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Ball';


			return data;

		}

	};


	return Class;

});
