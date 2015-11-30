
lychee.define('game.entity.Tile').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _TEXTURE = attachments["png"];
	var _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.x     = settings.x;
		this.y     = settings.y;


		settings.texture = _TEXTURE;
		settings.map     = _CONFIG.map;
		settings.width   = _CONFIG.width;
		settings.height  = _CONFIG.height;
		settings.shape   = lychee.ui.Entity.SHAPE.rectangle;
		settings.states  = _CONFIG.states;
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

