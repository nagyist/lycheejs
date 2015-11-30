
lychee.define('game.entity.Paddle').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _CONFIG   = attachments["json"].buffer;
	var _TEXTURES = {
		player: attachments["player.png"],
		enemy:  attachments["enemy.png"]
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, _CONFIG, data);


		settings.texture = _TEXTURES[settings.state || 'player'];


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Paddle';


			return data;

		}

	};


	return Class;

});
