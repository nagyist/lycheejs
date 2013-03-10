
lychee.define('game.DeviceSpecificHacks').exports(function(lychee, game, global, attachments) {

	var Callback = function() {

		var settings = this.settings;


		if (typeof global.navigator !== 'undefined') {

			if (global.navigator.appName === 'V8GL') {

				settings.fullscreen = true;

			} else if (global.navigator.userAgent.match(/iPad/)) {

				settings.fullscreen = true;

			} else if (global.navigator.userAgent.match(/Android/)) {

				settings.fullscreen = true;

			}

		}

	};

	return Callback;

});
