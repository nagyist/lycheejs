
lychee.define('game.app.sprite.Wall').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _TEXTURE = attachments["png"];
	var _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.collision = lychee.app.Entity.COLLISION.A;
		settings.texture   = _TEXTURE;
		settings.map       = _CONFIG.map;
		settings.width     = _CONFIG.width;
		settings.height    = _CONFIG.height;
		settings.shape     = lychee.app.Entity.SHAPE.rectangle;
		settings.states    = _CONFIG.states;
		settings.state     = 'default';


		if (Math.random() > 0.6) {

			var states = Object.keys(settings.states).filter(function(val) {
				return val.match(/damage/) === null;
			});

			settings.state = states[(Math.random() * (states.length - 1)) | 0];

		}


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.app.sprite.Wall';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		hit: function() {

			if (this.state.match(/damage/) === null) {

				this.setState(this.state + '-damage');


				return true;

			}


			return false;

		}

	};


	return Class;

});

