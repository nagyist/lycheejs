
lychee.define('app.entity.Astronaut').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, app, global, attachments) {

	var _textures = [
		attachments["blue.png"],
		attachments["light.png"],
		attachments["green.png"],
		attachments["red.png"],
		attachments["orange.png"],
		attachments["pink.png"],
		attachments["purple.png"],
		attachments["yellow.png"]
	];

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;


	var _id = 0;

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.nearest = null;

		this.properties  = settings.properties;


		settings.texture = _textures[_id++];
		settings.width   = 32;
		settings.height  = 32;
		settings.map     = _config.map;
		settings.shape   = lychee.app.Entity.SHAPE.rectangle;
		settings.states  = _config.states;
		settings.state   = settings.state || _config.state;


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'app.entity.Astronaut';


			return data;

		}

	};


	return Class;

});

