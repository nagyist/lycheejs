
lychee.define('game.entity.Button').includes([
	'lychee.ui.Button'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data, main) {

		var settings = lychee.extend({}, data);


		this.main = main || null;


		settings.width  = 192;
		settings.height = 48;


		lychee.ui.Button.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {

			this.main.loop.setTimeout(500, function() {
				this.changeState('menu');
			}, this.main);

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Button.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Button';

			var settings = data['arguments'][0];


			return data;

		}

	};


	return Class;

});

