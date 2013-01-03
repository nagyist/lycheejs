
lychee.define('Track').tags({
	platform: 'v8gl'
}).supports(function(lychee, global) {

	if (global.navigator && global.navigator.appName === 'V8GL') {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	if (lychee.debug === true) {
		console.log("lychee.Track: Supported media formats are NONE");
	}



	var Class = function(id, data, isReady) {

		//isReady = isReady === true;
		isReady = true; // Correct API Simulation


		this.id = id;


		this.__isIdle    = true;
		this.__isLooping = false;
		this.__isMuted   = false;
		this.__isReady   = true;


		this.__settings = lychee.extend({}, data);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		play: function(loop) {

			loop = loop === true ? true : false;


			if (this.__isReady === true) {
				this.__isIdle = true; // Nothing to do, so it's idling
				this.__isLooping = loop;
			}

		},

		stop: function() {
			this.__isIdle = true;
			this.__isLooping = false;
		},

		pause: function() {},

		resume: function() {},

		mute: function() {

			if (this.__isMuted === false) {
				this.__isMuted = true;
			}

		},

		unmute: function() {

			if (this.__isMuted === true) {
				this.__isMuted = false;
			}

		},

		clone: function() {

			var id = this.id;

			return new lychee.Track(id, this.__settings, true);

		},

		isIdle: function() {
			return this.__isIdle;
		},

		isMuted: function() {
			return this.__isMuted;
		},

		isReady: function() {
			return this.isIdle() && this.__isReady === true;
		},

		getVolume: function() {
			return 0;
		},

		setVolume: function(volume) {}

	};


	return Class;

});

