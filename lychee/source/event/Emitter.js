
lychee.define('lychee.event.Emitter').exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _bind = function(type, callback, scope, once) {

		if (type === null || callback === null) {
			return false;
		}


		var passAction = false;
		var passSelf   = false;

		if (type.charAt(0) === '@') {
			type = type.substr(1, type.length - 1);
			passAction = true;
		} else if (type.charAt(0) === '#') {
			type = type.substr(1, type.length - 1);
			passSelf = true;
		}


		if (this.___events[type] === undefined) {
			this.___events[type] = [];
		}


		this.___events[type].push({
			passAction: passAction,
			passSelf:   passSelf,
			callback:   callback,
			scope:      scope,
			once:       once
		});


		return true;

	};

	var _trigger = function(type, data) {

		if (this.___events[type] !== undefined) {

			var value = undefined;

			for (var e = 0; e < this.___events[type].length; e++) {

				var args  = [];
				var entry = this.___events[type][e];

				if (entry.passAction === true) {

					args.push(type);
					args.push(this);

				} else if (entry.passSelf === true) {

					args.push(this);

				}


				if (data !== null) {
					args.push.apply(args, data);
				}


				var result = entry.callback.apply(entry.scope, args);
				if (result !== undefined) {
					value = result;
				}


				if (entry.once === true) {

					if (this.unbind(type, entry.callback, entry.scope) === true) {
						e--;
					}

				}

			}


			if (value !== undefined) {
				return value;
			} else {
				return true;
			}

		}


		return false;

	};

	var _unbind = function(type, callback, scope) {

		var found = false;

		if (type !== null) {

			found = _unbind_event.call(this, type, callback, scope);

		} else {

			for (type in this.___events) {

				var result = _unbind_event.call(this, type, callback, scope);
				if (result === true) {
					found = true;
				}

			}

		}


		return found;

	};

	var _unbind_event = function(type, callback, scope) {

		if (this.___events[type] !== undefined) {

			var found = false;

			for (var e = 0, el = this.___events[type].length; e < el; e++) {

				var entry = this.___events[type][e];

				if ((callback === null || entry.callback === callback) && (scope === null || entry.scope === scope)) {

					found = true;

					this.___events[type].splice(e, 1);
					el--;

				}

			}


			return found;

		}


		return false;

	};


	if (lychee.debug === true) {

		var _original_bind    = _bind;
		var _original_trigger = _trigger;
		var _original_unbind  = _unbind;


		_bind = function(type, callback, scope, once) {

			var result = _original_bind.call(this, type, callback, scope, once);
			if (result !== false) {

				this.___timeline.bind.push({
					time:     Date.now(),
					type:     type,
					callback: lychee.serialize(callback),
					// scope:    lychee.serialize(scope),
					once:     once
				});

			}

			return result;

		};

		_trigger = function(type, data) {

			var result = _original_trigger.call(this, type, data);
			if (result !== false) {

				this.___timeline.trigger.push({
					time: Date.now(),
					type: type,
					data: lychee.serialize(data)
				});

			}

			return result;

		};

		_unbind = function(type, callback, scope) {

			var result = _original_unbind.call(this, type, callback, scope);
			if (result !== false) {

				this.___timeline.unbind.push({
					time:     Date.now(),
					type:     type,
					callback: lychee.serialize(callback),
					scope:    lychee.serialize(scope)
				});

			}

			return result;

		};

	}



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.___events   = {};
		this.___timeline = {
			bind:    [],
			trigger: [],
			unbind:  []
		};

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var blob = {};


			if (this.___timeline.bind.length > 0 || this.___timeline.trigger.length > 0 || this.___timeline.unbind.length > 0) {

				blob.timeline = {};


				if (this.___timeline.bind.length > 0) {

					blob.timeline.bind = [];

					for (var b = 0, bl = this.___timeline.bind.length; b < bl; b++) {
						blob.timeline.bind.push(this.___timeline.bind[b]);
					}

				}

				if (this.___timeline.trigger.length > 0) {

					blob.timeline.trigger = [];

					for (var t = 0, tl = this.___timeline.trigger.length; t < tl; t++) {
						blob.timeline.trigger.push(this.___timeline.trigger[t]);
					}

				}

				if (this.___timeline.unbind.length > 0) {

					blob.timeline.unbind = [];

					for (var u = 0, ul = this.___timeline.unbind.length; u < ul; u++) {
						blob.timeline.unbind.push(this.___timeline.unbind[u]);
					}

				}

			}


			return {
				'constructor': 'lychee.event.Emitter',
				'arguments':   [],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		bind: function(type, callback, scope, once) {

			type     = typeof type === 'string'     ? type     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;
			once     = once === true;


			return _bind.call(this, type, callback, scope, once);

		},

		trigger: function(type, data) {

			type = typeof type === 'string' ? type : null;
			data = data instanceof Array    ? data : null;


			return _trigger.call(this, type, data);

		},

		unbind: function(type, callback, scope) {

			type     = typeof type === 'string'     ? type     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : null;


			return _unbind.call(this, type, callback, scope);

		}

	};


	return Class;

});

