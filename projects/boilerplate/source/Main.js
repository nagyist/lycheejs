
lychee.define('game.Main').requires([
	'game.net.Client',
	'game.state.Game',
	'game.state.Highscore',
	'game.state.Menu',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			title: 'Game Boilerplate',

			// Is configured by Sorbet API
			client: '/api/Server?identifier=boilerplate',

			input: {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       true,
				swipe:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:     'boilerplate',
				width:  null,
				height: null
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		lychee.game.Main.call(this, settings);

	};


	Class.prototype = {

		load: function() {

			// 1. Initialize Client via Sorbet Gateway
			lychee.game.Main.prototype.load.call(this);

		},

		reshape: function(orientation, rotation) {

			game.DeviceSpecificHacks.call(this);

			lychee.game.Main.prototype.reshape.call(this, orientation, rotation);

		},

		init: function() {

			// Overwrite client with game.net.Client
			var clientsettings   = this.settings.client;
			this.settings.client = null;

			lychee.game.Main.prototype.init.call(this);


			if (clientsettings !== null) {
				this.client = new game.net.Client(clientsettings, this);
			}


			this.setState('game',      new game.state.Game(this));
			this.setState('highscore', new game.state.Highscore(this));
			this.setState('menu',      new game.state.Menu(this));
			this.changeState('menu');

		}

	};


	return Class;

});
