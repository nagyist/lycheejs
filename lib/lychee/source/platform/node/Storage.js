
lychee.define('Storage').tags({
	platform: 'node'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	var fs = require('fs');
	if (typeof fs.readFileSync === 'function' && typeof fs.writeFileSync === 'function') {
		return true;
	}

	return false;

}).exports(function(lychee, global) {

	/*
	 * EVENTS
	 */

	var _persistent = {};
	var _temporary  = {};



	/*
	 * FEATURE DETECTION
	 */

	var _read_persistent  = function() { return false; };
	var _write_persistent = function() { return false; };

	(function() {

		var _fs   = require('fs');
		var _path = require('path');


		var read = 'readFileSync' in _fs;
		if (read === true) {

			_read_persistent = function() {

				var url = _path.normalize(process.cwd() + '/lychee.store');


				var raw = null;
				try {
					raw = _fs.readFileSync(url, 'utf8');
				} catch(e) {
					raw = null;
				}


				var buffer = null;
				try {
					buffer = JSON.parse(raw);
				} catch(e) {
					buffer = null;
				}


				if (buffer !== null) {

					// TODO: Evaluate if asynchronous update of deep hierarchies makes sense

					for (var id in buffer) {
						_persistent[id] = buffer[id];
					}


					return true;

				}


				return false;

			};

		}


		var write = 'writeFileSync' in _fs;
		if (write === true) {

			_write_persistent = function() {

				var buffer = JSON.stringify(_persistent, null, '\t');
				var url    = _path.normalize(process.cwd() + '/lychee.store');


				var result = false;
				try {
					result = _fs.writeFileSync(url, buffer, 'utf8');
				} catch(e) {
					result = false;
				}


				return result;

			};

		}


		if (lychee.debug === true) {

			var methods = [];

			if (read && write) methods.push('Persistent');
			if (_temporary)    methods.push('Temporary');

			if (methods.length === 0) {
				console.error('lychee.Storage: Supported methods are NONE');
			} else {
				console.info('lychee.Storage: Supported methods are ' + methods.join(', '));
			}

		}


		_read_persistent();

	})();



	/*
	 * HELPERS
	 */

	var _read_storage = function() {

		var id   = this.id;
		var blob = null;


		var type = this.type;
		if (type === Class.TYPE.persistent) {
			blob = _persistent[id] || null;
		} else if (type === Class.TYPE.temporary) {
			blob = _temporary[id]  || null;
		}


		if (blob !== null) {

			if (this.model === null) {

				if (blob['@model'] instanceof Object) {
					this.model = blob['@model'];
				}

			}


			var document = this.__document;
			if (document.index === 0) {

				if (blob['@document'] instanceof Object) {
					this.__document = blob['@document'];
				}

			}


			var objects = this.__objects;
			if (objects.length === 0 || objects.length !== blob['@objects'].length) {

				if (blob['@objects'] instanceof Array) {

					objects = blob['@objects'];
					this.__objects = [];

					for (var o = 0, ol = objects.length; o < ol; o++) {
						this.__objects.push(objects[o]);
					}

					this.trigger('sync', [ this.__objects ]);


					return true;

				}

			}

		}


		return false;

	};

	var _write_storage = function() {

		var operations = this.__operations;
		if (operations.length !== 0) {

			while (operations.length > 0) {

				var operation = operations.shift();
				if (operation.type === 'insert') {

					this.__document.index++;
					this.__objects.push(operation.object);
					this.trigger('insert', [ operation.index, operation.object ]);

				} else if (operation.type === 'update') {

					if (this.__objects[operation.index] !== operation.object) {
						this.__objects[operation.index] = operation.object;
						this.trigger('update', [ operation.index, operation.object ]);
					}

				} else if (operation.type === 'remove') {

					this.__document.index--;
					this.__objects.splice(operation.index, 1);
					this.trigger('remove', [ operation.index, operation.object ]);

				}

			}


			this.__document.time = Date.now();


			var id   = this.id;
			var blob = {
				'@document': this.__document,
				'@model':    this.model,
				'@objects':  this.__objects
			};


			var type = this.type;
			if (type === Class.TYPE.persistent) {

				_persistent[id] = blob;
				_write_persistent();

			} else if (type === Class.TYPE.temporary) {

				_temporary[id] = blob;

			}


			this.trigger('sync', [ this.__objects ]);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var _id = 0;

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.id    = 'lychee-Storage-' + _id++;
		this.model = {};
		this.type  = Class.TYPE.persistent;

		this.__document   = { index: 0, time: Date.now() };
		this.__objects    = [];
		this.__operations = [];


		this.setId(settings.id);
		this.setModel(settings.model);
		this.setType(settings.type);


		lychee.event.Emitter.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		_read_storage.call(this);

	};


	Class.TYPE = {
		persistent: 0,
		temporary:  1
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		sync: function(force) {

			force = force === true;


			var result = _read_storage.call(this);
			if (result === true) {

				return true;

			} else {

				if (force === true) {

					this.trigger('sync', [ this.__objects ]);

					return true;

				}

			}


			return false;

		},

		deserialize: function(blob) {

			if (blob.document instanceof Object) {
				this.__document.index = blob.document.index;
				this.__document.time  = blob.document.time;
			}

			if (blob.objects instanceof Array) {

				this.__objects = [];

				for (var o = 0, ol = blob.objects.length; o < ol; o++) {

					var object = blob.objects[o];
					if (lychee.interfaceof(this.model, object)) {
						this.__objects.push(object);
					}

				}

			}

		},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.Storage';

			var settings = {};
			var blob     = (data['blob'] || {});


			if (this.id.substr(0, 15) !== 'lychee-Storage-') settings.id    = this.id;
			if (Object.keys(this.model).length !== 0)        settings.model = this.model;
			if (this.type !== Class.TYPE.persistent)         settings.type  = this.type;


			if (this.__document.index > 0) {

				blob.document = {};
				blob.document.index = this.__document.index;
				blob.document.time  = this.__document.time;

			}

			if (this.__objects.length > 0) {

				blob.objects = {};

				for (var o = 0, ol = this.__objects.length; o < ol; o++) {

					var object = this.__objects[o];
					if (object instanceof Object) {
						blob.objects.push(JSON.parse(JSON.stringify(object)));
					}

				}

			}


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		create: function() {
			return lychee.extendunlink({}, this.model);
		},

		filter: function(callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (callback !== null) {

				return this.__objects.filter(function(object, o) {
					return callback.call(scope, object, o) === true;
				});

			}


			return this.__objects.slice();

		},

		insert: function(object) {

			// This uses the diff method, because properties can be null
			object = lychee.diff(this.model, object) === false ? object : null;


			if (object !== null) {

				var index = this.__objects.indexOf(object);
				if (index === -1) {

					this.__operations.push({
						type:   'insert',
						index:  this.__objects.length,
						object: object
					});


					_write_storage.call(this);

					return true;

				}

			}


			return false;

		},

		update: function(object) {

			// This uses the diff method, because properties can be null
			object = lychee.diff(this.model, object) === false ? object : null;


			if (object !== null) {

				var index = this.__objects.indexOf(object);
				if (index !== -1) {

					this.__operations.push({
						type:   'update',
						index:  index,
						object: object
					});


					_write_storage.call(this);

					return true;

				}

			}


			return false;

		},

		get: function(index) {

			index = typeof index === 'number' ? (index | 0) : null;


			if (index !== null) {

				var object = this.__objects[index] || null;
				if (object !== null) {
					return object;
				}

			}


			return null;

		},

		remove: function(index, object) {

			index = typeof index === 'number' ? (index | 0) : this.__objects.indexOf(object);


			if (index >= 0 && index < this.__objects.length) {

				this.__operations.push({
					type:   'remove',
					index:  index,
					object: this.__objects[index]
				});


				_write_storage.call(this);

				return true;

			}


			return false;

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.id = id;

				return true;

			}


			return false;

		},

		setModel: function(model) {

			model = model instanceof Object ? model : null;


			if (model !== null) {

				this.model = JSON.parse(JSON.stringify(model));

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Class.TYPE, type) ? type : null;


			if (type !== null) {

				this.type = type;

				return true;

			}


			return false;

		}

	};


	return Class;

});

