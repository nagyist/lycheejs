
lychee.define('lychee.ui.Emblem').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, global, attachments) {

	var _texture = attachments["png"];
	var _config  = {
		width:  256,
		height: 64
	};


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;


		lychee.ui.Sprite.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('reshape', function(orientation, rotation, width, height) {
			this.position.y = 1/2 * height - _config.height / 2;
		}, this);


		settings = null;

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.ui.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Emblem';


			return data;

		}

	};


	return Class;

});

