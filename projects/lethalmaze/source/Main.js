
lychee.define('game.Main').requires([
	'game.net.Client',
	'game.state.Game'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			// Is configured by Sorbet API
			client: '/api/Server?identifier=lethalmaze',

			input: {
				delay:       0,
				key:         true,
				keymodifier: false,
				touch:       true,
				swipe:       false
			},

			jukebox: {
				music: false,
				sound: true
			},

			renderer: {
				id:         'lethalmaze',
				width:      768,
				height:     768,
				background: '#67b843'
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		lychee.app.Main.call(this, settings);


		this.bind('load', function(oncomplete) {

			this.settings.gameclient = this.settings.client;
			this.settings.client     = null;

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			var settings = this.settings.gameclient || null;
			if (settings !== null) {
				this.client = new game.net.Client(settings, this);
			}

			this.setState('game', new game.state.Game(this));
			this.changeState('game');

		}, this, true);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.app.Main.prototype.serialize.call(this);
			data['constructor'] = 'game.Main';

			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.defaults.client !== null) { settings.client = this.defaults.client; }


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		reshape: function(orientation, rotation) {

			lychee.app.Main.prototype.reshape.call(this, orientation, rotation);

		},

		show: function() {},
		hide: function() {}

	};


	return Class;

});
