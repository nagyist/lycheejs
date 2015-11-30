
lychee.define('app.entity.Background').includes([
	'lychee.app.sprite.Background'
]).exports(function(lychee, app, global, attachments) {

	var _TEXTURE = attachments["png"];
	var _CONFIG  = {
		repeat: true,
		states: { 'default': 0 },
		map:    { 'default': [{ x: 0, y: 0, w: 512, h: 512 }] }
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.map     = _CONFIG.map;
		settings.repeat  = _CONFIG.repeat;
		settings.states  = _CONFIG.states;
		settings.texture = _TEXTURE;


		lychee.app.sprite.Background.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.sprite.Background.prototype.serialize.call(this);
			data['constructor'] = 'app.entity.Background';


			return data;

		}

	};


	return Class;

});

