
lychee.define('lychee.event.Promise').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _process_stack = function(data) {

		data = data instanceof Object ? data : null;


		var entry = this.___stack.shift() || null;
		if (entry !== null) {

			if (data === null) {
				data = entry.data || null;
			}


			var that = this;

			entry.callback.call(entry.scope, data, function(result) {

				if (result instanceof Object) {
					_process_stack.call(that, result);
				} else if (result === true) {
					_process_stack.call(that);
				} else {
					that.trigger('error');
				}

			});

		} else {

			this.trigger('complete');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.___init  = false;
		this.___stack = [];

		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.event.Promise';

			var blob = (data['blob'] || {});


			if (this.___stack.length > 0) {

				blob.stack = [];

				for (var s = 0, sl = this.___stack.length; s < sl; s++) {

					var entry = this.___stack[s];

					blob.stack.push({
						data:     lychee.serialize(entry.data),
						callback: lychee.serialize(entry.callback),
						// scope:    lychee.serialize(entry.scope)
						scope:    null
					});

				}

			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		then: function(data, callback, scope) {

			data     = data instanceof Object       ? data     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (callback !== null) {

				this.___stack.push({
					callback: callback,
					scope:    scope,
					data:     data
				});

				return true;

			}


			return false;

		},

		init: function() {

			if (this.___init === false) {

				this.___init = true;


				if (this.___stack.length > 0) {

					_process_stack.call(this);

					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

