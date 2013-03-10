
lychee.define('game.Main').requires([
	'lychee.net.Client',
	'game.entity.Font',
	'game.state.Game',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			fullscreen: true,

			input: {
				fireKey:   false,
				fireTouch: true,
				fireSwipe: true
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.init();

	};


	Class.prototype = {

		reset: function(state) {

			game.DeviceSpecificHacks.call(this);

			this.reshape();


			if (state === true) {
				this.resetState(null, null);
			}

		},

		init: function() {

			// Remove Preloader Progress Bar
			lychee.Preloader.prototype._progress(null, null);


			lychee.game.Main.prototype.init.call(this);
			this.reset(false);


			this.fonts = {};
			this.fonts.normal = new game.entity.Font('normal');

			this.client = new lychee.net.Client(
				JSON.stringify, JSON.parse
			);
			this.client.listen(
				1338,
				this.settings.host
			);

			this.setState('game', new game.state.Game(this));
			this.changeState('game');

			this.start();

		}

	};


	return Class;

});
