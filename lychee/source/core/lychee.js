
lychee = typeof lychee !== 'undefined' ? lychee : (function(global) {

	/*
	 * NAMESPACE
	 */

	if (typeof lychee === 'undefined') {
		lychee = global.lychee = {};
	}



	/*
	 * HELPERS
	 */

	var _environment = null;

	var _bootstrap_environment = function() {

		if (_environment === null) {

			_environment = new lychee.Environment({
				debug: true
			});

		}


		if (this.environment === null) {
			this.setEnvironment(_environment);
		}

	};

	var _resolve_constructor = function(identifier) {

		var pointer = this;

		var ns = identifier.split('.');
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = null;
				break;
			}

		}


		return pointer;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		debug:        true,
		environment:  _environment,

		ENVIRONMENTS: {},
		VERSION:      0.8,



		/*
		 * LIBRARY API
		 */

		diff: function(aobject, bobject) {

			var akeys = Object.keys(aobject);
			var bkeys = Object.keys(bobject);

			if (akeys.length !== bkeys.length) {
				return true;
			}


			for (var a = 0, al = akeys.length; a < al; a++) {

				var key = akeys[a];

				if (bobject[key] !== undefined) {

					if (aobject[key] !== null && bobject[key] !== null) {

						if (aobject[key] instanceof Object && bobject[key] instanceof Object) {

							if (lychee.diff(aobject[key], bobject[key]) === true) {

								// Allows aobject[key].builds = {} and bobject[key].builds = { stuff: {}}
								if (Object.keys(aobject[key]).length > 0) {
									return true;
								}

							}

						} else if (typeof aobject[key] !== typeof bobject[key]) {
							return true;
						}

					}

				} else {
					return true;
				}

			}


			return false;

		},

		enumof: function(template, value) {

			if (template instanceof Object && typeof value === 'number') {

				var valid = false;

				for (var val in template) {

					if (value === template[val]) {
						valid = true;
						break;
					}

				}


				return valid;

			}


			return false;

		},

		extend: function(target) {

			for (var a = 1, al = arguments.length; a < al; a++) {

				var object = arguments[a];
				if (object) {

					for (var prop in object) {
						target[prop] = object[prop];
					}

				}

			}


			return target;

		},

		extendsafe: function(target) {

			for (var a = 1, al = arguments.length; a < al; a++) {

				var object = arguments[a];
				if (object) {

					for (var prop in object) {

						var tvalue = target[prop];
						var ovalue = object[prop];
						if (tvalue instanceof Array && ovalue instanceof Array) {

							lychee.extendsafe(target[prop], object[prop]);

						} else if (tvalue instanceof Object && ovalue instanceof Object) {

							lychee.extendsafe(target[prop], object[prop]);

						} else if (typeof tvalue === typeof ovalue) {

							target[prop] = object[prop];

						}

					}

				}

			}


			return target;

		},

		extendunlink: function(target) {

			for (var a = 1, al = arguments.length; a < al; a++) {

				var object = arguments[a];
				if (object) {

					for (var prop in object) {

						var tvalue = target[prop];
						var ovalue = object[prop];
						if (tvalue instanceof Object && ovalue instanceof Object) {
							target[prop] = {};
							lychee.extendunlink(target[prop], object[prop]);
						} else {
							target[prop] = object[prop];
						}

					}

				}

			}


			return target;

		},

		interfaceof: function(template, instance) {

			var valid = false;
			var method, property;

			// 1. Interface validation on Template
			if (template instanceof Function && template.prototype instanceof Object && instance instanceof Function && instance.prototype instanceof Object) {

				valid = true;

				for (method in template.prototype) {

					if (typeof template.prototype[method] !== typeof instance.prototype[method]) {
						valid = false;
						break;
					}

				}


			// 2. Interface validation on Instance
			} else if (template instanceof Function && template.prototype instanceof Object && instance instanceof Object) {

				valid = true;

				for (method in template.prototype) {

					if (typeof template.prototype[method] !== typeof instance[method]) {
						valid = false;
						break;
					}

				}


			// 3. Interface validation on Struct
			} else if (template instanceof Object && instance instanceof Object) {

				valid = true;

				for (property in template) {

					if (template.hasOwnProperty(property) && instance.hasOwnProperty(property)) {

						if (typeof template[property] !== typeof instance[property]) {
							valid = false;
							break;
						}

					}

				}

			}


			return valid;

		},



		/*
		 * ENTITY API
		 */

		serialize: function(definition) {

			definition = definition !== undefined ? definition : null;


			if (definition !== null) {

				if (typeof definition.serialize === 'function') {
					return definition.serialize();
				} else {
					return JSON.parse(JSON.stringify(definition));
				}

			}


			return null;

		},

		deserialize: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				if (typeof data.constructor === 'string' && data.arguments instanceof Array) {

					var construct = _resolve_constructor.call(this.environment.global, data.constructor);
					if (typeof construct === 'function') {

						var bindargs = [].splice.call(data.arguments, 0);
						bindargs.reverse();
						bindargs.push(construct);
						bindargs.reverse();


						for (var b = 0, bl = bindargs.length; b < bl; b++) {

							var value = bindargs[b];
							if (typeof value === 'string' && value.charAt(0) === '#') {

								if (lychee.debug === true) {
									console.log('lychee.deserialize: Injecting "' + value + '" from environment.global');
								}


								var resolved = _resolve_constructor.call(this.environment.global, value.substr(1));
								if (resolved !== null) {
									bindargs[b] = resolved;
								}

							}

						}


						var instance = new (
							construct.bind.apply(
								construct,
								bindargs
							)
						)();


						// High-Level ENTITY API
						if (typeof instance.deserialize === 'function') {

							var blob = data.blob || null;
							if (blob !== null) {
								instance.deserialize(blob);
							}

						// Low-Level ASSET API
						} else if (typeof instance.load === 'function') {
							instance.load();
						}


						return instance;

					} else {

						if (lychee.debug === true) {
							console.warn('lychee.deserialize: Require ' + data.constructor + ' to deserialize it.');
						}

					}

				}

			}


			return null;

		},



		/*
		 * CUSTOM API
		 */

		define: function(identifier) {

			_bootstrap_environment.call(this);

			var definition  = new lychee.Definition(identifier);
			var environment = this.environment;

			definition.exports = function(callback) {
				lychee.Definition.prototype.exports.call(this, callback);
				environment.define(this);
			};

			return definition;

		},

		init: function(callback) {

			_bootstrap_environment.call(this);

			return this.environment.init(callback);

		},

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {
				this.environment = environment;
				this.debug = this.environment.debug;
			} else {
				this.environment = _environment;
				this.debug = this.environment.debug;
			}


			return true;

		}

	};


	return Module.extend(lychee, Module);

})(typeof global !== 'undefined' ? global : this);

