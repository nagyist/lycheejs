
lychee.define('app.entity.Room').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, app, global, attachments) {

	var _config  = attachments["json"].buffer;
	var _texture = attachments["png"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.properties = {};


		settings.texture = _texture;
		settings.width   = 0;
		settings.height  = 0;
		settings.map     = _config.map;
		settings.shape   = lychee.app.Entity.SHAPE.rectangle;
		settings.state   = settings.state || 'default';
		settings.states  = _config.states;


		this.setProperties(settings.properties);

		delete settings.properties;


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'app.entity.Room';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setProperties: function(properties) {

			properties = properties instanceof Object ? properties : null;


			if (properties !== null) {

				this.properties = properties;


				return true;

			}


			return false;

		}

	};


	return Class;

});

