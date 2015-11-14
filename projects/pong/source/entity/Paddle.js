
lychee.define('game.entity.Paddle').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _config   = attachments["json"].buffer;
	var _textures = {
		player: attachments["player.png"],
		enemy:  attachments["enemy.png"]
	};


	var Class = function(data) {

		var settings = lychee.extend({}, _config, data);


		settings.texture = _textures[settings.state || 'player'];


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
