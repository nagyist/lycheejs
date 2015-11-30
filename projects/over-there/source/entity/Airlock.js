
lychee.define('app.entity.Airlock').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, app, global, attachments) {

	var _CONFIG  = attachments["json"].buffer;
	var _TEXTURE = attachments["png"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.width   = 0;
		settings.height  = 0;
		settings.map     = _CONFIG.map;
		settings.state   = settings.state || 'horizontal-big';
		settings.states  = _CONFIG.states;
		settings.texture = _TEXTURE;


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'app.entity.Airlock';


			return data;

		}

	};


	return Class;

});

