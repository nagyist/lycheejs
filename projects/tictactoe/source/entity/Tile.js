
lychee.define('game.entity.Tile').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.x     = settings.x;
		this.y     = settings.y;


		settings.texture = _texture;
		settings.map     = _config.map;
		settings.width   = _config.width;
		settings.height  = _config.height;
		settings.shape   = lychee.ui.Entity.SHAPE.rectangle;
		settings.states  = _config.states;
		settings.state   = 'default';


		lychee.ui.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Tile';

			return data;

		},



		/*
		 * CUSTOM API
		 */

		setState: function(state) {

			if (this.state === 'default' && state !== 'default') {

				return lychee.ui.Sprite.prototype.setState.call(this, state);

			} else if (state === 'default') {

				return lychee.ui.Sprite.prototype.setState.call(this, state);

			}


			return false;

		}

	};


	return Class;

});

