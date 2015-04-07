
lychee.define('game.entity.Entity').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;
		settings.map     = _config.map;
		settings.shape   = _config.shape;
		settings.states  = _config.states;
		settings.state   = settings.state || _config.state;


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.game.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Entity';


			return data;

		}

	};


	return Class;

});

