
lychee.define('game.ui.Label').includes([
	'lychee.ui.Label'
]).exports(function(lychee, game, global, attachments) {

	var _font = attachments["fnt"];


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.font = _font;


		lychee.ui.Label.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Label.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.Label';


			return data;

		}

	};


	return Class;

});

