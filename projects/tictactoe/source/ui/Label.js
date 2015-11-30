
lychee.define('game.ui.Label').includes([
	'lychee.ui.entity.Label'
]).exports(function(lychee, game, global, attachments) {

	var _FONT = attachments["fnt"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.font = _FONT;


		lychee.ui.entity.Label.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.entity.Label.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.Label';


			return data;

		}

	};


	return Class;

});

