
lychee.define('Input').tags({
	platform: 'nodejs'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof process !== 'undefined') {

		if (typeof process.stdin === 'object' && typeof process.stdin.on === 'function') {
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

		keyboard: function(chunk, key) {

			// This is apparently a hack to have a TTY conform behaviour
			if (key && key.ctrl && key.name === 'c') {

				process.exit();

			} else if (key.sequence !== undefined || key.name !== undefined) {

				var k = key.name !== undefined ? key.name : key.sequence;

				for (var i = 0, l = _instances.length; i < l; i++) {
					_process_key.call(_instances[i], k, key.ctrl, key.meta, key.shift);
				}

			} else if (lychee.debug === true) {
				console.error('lychee.Input: INVALID KEY ', key);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		process.stdin.on('keypress', _listeners.keyboard).resume();


		if (typeof process.stdin.setRawMode === 'function') {
			process.stdin.setRawMode(true);
		}

		if (typeof process.stdin.resume === 'function') {
			process.stdin.resume();
		}


		if (lychee.debug === true) {
			console.log('lychee.Input: Supported methods are Keyboard');
		}

	})();



	/*
	 * HELPERS
	 */

	// TODO: Modifier support is missing, I have no idea how to work around the TTY behaviour.

	var _process_key = function(key, ctrl, alt, shift) {

		if (this.key === false) return false;


		// 2. Only fire after the enforced delay
		var delta = Date.now() - this.__clock.key;
		if (delta < this.delay) {
			return;
		}


		// 3. Check for current key being a modifier
		if (this.keymodifier === false) {

			if (key === 'ctrl' || key === 'meta' || key === 'shift') {
				return true;
			}

		}


		var name = '';

		if (ctrl  === true) name += 'ctrl-';
		if (alt   === true) name += 'alt-';
		if (shift === true) name += 'shift-';

		name += key.toLowerCase();



		var handled = false;

		if (key !== null) {

			// allow bind('key') and bind('ctrl-a');

			handled = this.trigger('key', [ key, name, delta ]) || handled;
			handled = this.trigger(name,  [ delta ])            || handled;


			if (handled === true) {

				if (lychee.debug === true) {
					this.__history.key.push([ Date.now(), key, name, delta ]);
				}

			}

		}


		this.__clock.key = Date.now();


		return handled;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.delay       = 0;
		this.key         = false;
		this.keymodifier = false;
		this.touch       = false;
		this.swipe       = false;

		this.__clock  = {
			key:   Date.now(),
			touch: Date.now(),
			swipe: Date.now()
		};
		this.__history = {
			key:   [],
			touch: [],
			swipe: []
		};


		this.setDelay(settings.delay);
		this.setKey(settings.key);
		this.setKeyModifier(settings.keymodifier);
		this.setTouch(settings.touch);
		this.setSwipe(settings.swipe);


		lychee.event.Emitter.call(this);

		_instances.push(this);

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


			if (this.delay !== 0)           settings.delay       = this.delay;
			if (this.key !== false)         settings.key         = this.key;
			if (this.keymodifier !== false) settings.keymodifier = this.keymodifier;
			if (this.touch !== false)       settings.touch       = this.touch;
			if (this.swipe !== false)       settings.swipe       = this.swipe;


			if (this.__history.key.length > 0 || this.__history.touch.length > 0 || this.__history.swipe.length > 0) {

				blob.history = {};

				if (this.__history.key.length > 0) {

					blob.history.key = [];

					for (var k = 0, kl = this.__history.key.length; k < kl; k++) {
						blob.history.key.push(this.__history.key[k]);
					}

				}

				if (this.__history.touch.length > 0) {

					blob.history.touch = [];

					for (var t = 0, tl = this.__history.touch.length; t < tl; t++) {
						blob.history.touch.push(this.__history.touch[t]);
					}

				}

				if (this.__history.swipe.length > 0) {

					blob.history.swipe = [];

					for (var s = 0, sl = this.__history.swipe.length; s < sl; s++) {
						blob.history.swipe.push(this.__history.swipe[s]);
					}

				}

			}


			return {
				'constructor': 'lychee.Input',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		setDelay: function(delay) {

			delay = typeof delay === 'number' ? delay : null;


			if (delay !== null) {

				this.delay = delay;

				return true;

			}


			return false;

		},

		setKey: function(key) {

			if (key === true || key === false) {

				this.key = key;

				return true;

			}


			return false;

		},

		setKeyModifier: function(keymodifier) {

			if (keymodifier === true || keymodifier === false) {

				this.keymodifier = keymodifier;

				return true;

			}


			return false;

		},

		setTouch: function(touch) {
			return false;
		},

		setSwipe: function(swipe) {
			return false;
		}

	};


	return Class;

});

