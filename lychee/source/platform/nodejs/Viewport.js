
lychee.define('Viewport').tags({
	platform: 'nodejs'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof process !== 'undefined') {

		if (typeof process.stdout === 'object' && typeof process.stdout.on === 'function') {
			return true;
		}

	}

	return false;

}).exports(function(lychee, global) {

	/*
	 * EVENTS
	 */

	var _instances = [];

	var _listeners = {

		resize: function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_reshape.call(_instances[i], process.stdout.columns, process.stdout.rows);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		var resize = true;
		if (resize === true) {
			process.stdout.on('resize', _listeners.resize);
		}


		if (lychee.debug === true) {

			var methods = [];

			if (resize) methods.push('Resize');

			if (methods.length === 0) {
				console.error('lychee.Viewport: Supported methods are NONE');
			} else {
				console.info('lychee.Viewport: Supported methods are ' + methods.join(', '));
			}

		}

	})();



	/*
	 * HELPERS
	 */

	var _process_reshape = function(width, height) {

		if (width === this.width && height === this.height) {
			return false;
		}


		this.width  = width;
		this.height = height;



		var orientation = null;
		var rotation    = null;

		if (width > height) {

			orientation = 'landscape';
			rotation    = 'landscape';

		} else {

			orientation = 'landscape';
			rotation    = 'landscape';

		}



		var handled = false;

		handled = this.trigger('reshape', [ orientation, rotation ]) || handled;


		if (handled === true) {

			if (lychee.debug === true) {
				this.__history.reshape.push([ Date.now(), orientation, rotation ]);
			}

		}


		return handled;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.fullscreen = false;
		this.width      = process.stdout.columns;
		this.height     = process.stdout.rows;

		this.__orientation = 0; // Unsupported
		this.__history     = {
			show:    [],
			hide:    [],
			reshape: []
		};


		lychee.event.Emitter.call(this);

		_instances.push(this);


		this.setFullscreen(settings.fullscreen);

		settings = null;

	};


	Class.prototype = {

		destroy: function() {

			var found = false;

			for (var i = 0, il = _instances.length; i < il; i++) {

				if (_instances[i] === this) {
					_instances.splice(i, 1);
					found = true;
					il--;
					i--;
				}

			}

			this.unbind();


			return found;

		},



		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};
			var blob     = {};


			if (this.fullscreen !== false) settings.fullscreen = this.fullscreen;


			if (this.__history.show.length > 0 || this.__history.hide.length > 0 || this.__history.reshape.length > 0) {

				blob.history = {};

				if (this.__history.show.length > 0) {

					blob.history.show = [];

					for (var s = 0, sl = this.__history.show.length; s < sl; s++) {
						blob.history.show.push(this.__history.show[s]);
					}

				}

				if (this.__history.hide.length > 0) {

					blob.history.hide = [];

					for (var h = 0, hl = this.__history.hide.length; h < hl; h++) {
						blob.history.hide.push(this.__history.hide[h]);
					}

				}

				if (this.__history.reshape.length > 0) {

					blob.history.reshape = [];

					for (var r = 0, rl = this.__history.reshape.length; r < rl; r++) {
						blob.history.reshape.push(this.__history.reshape[r]);
					}

				}

			}


			return {
				'constructor': 'lychee.Viewport',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		setFullscreen: function(fullscreen) {
			return false;
		}

	};


	return Class;

});

