
lychee.define('game.entity.Wall').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.collision = lychee.app.Entity.COLLISION.A;
		settings.texture   = _texture;
		settings.map       = _config.map;
		settings.width     = _config.width;
		settings.height    = _config.height;
		settings.shape     = lychee.app.Entity.SHAPE.rectangle;
		settings.states    = _config.states;
		settings.state     = 'default';


		delete settings.type;


		lychee.app.Sprite.call(this, settings);

	};


	Class.prototype = {

		toggleAlpha: function() {

			if (this.alpha === 0) {
				this.alpha = 1;
			} else {
				this.alpha = 0;
			}

		}

	};


	return Class;

});

