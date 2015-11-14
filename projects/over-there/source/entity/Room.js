
lychee.define('app.entity.Room').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, app, global, attachments) {

	var _config  = attachments["json"].buffer;
	var _texture = attachments["png"];


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.air   = 1;
		this.power = 0;
		this.temp  = 0;
		this.type  = null;

		this.properties = {};


		settings.texture = _texture;
		settings.width   = 0;
		settings.height  = 0;
		settings.map     = _config.map;
		settings.shape   = lychee.app.Entity.SHAPE.rectangle;
		settings.state   = settings.state || 'default';
		settings.states  = _config.states;


		lychee.app.Sprite.call(this, settings);


		this.setType(settings.type);

		settings = null;

	};


	Class.prototype = {

		setType: function(type) {

			type = typeof type === 'string' ? type : null;


			if (type !== null) {

				var result = this.setState(type);
				if (result === true) {

					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

