
lychee.define('game.ui.Welcome').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = {
		width:  512,
		height: 256
	};


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;


		lychee.ui.Sprite.call(this, settings);

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.ui.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.Welcome';


			return data;

		}

	};


	return Class;

});

