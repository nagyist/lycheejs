
lychee.define('sorbet.data.Storage').includes([
	'lychee.Storage'
]).exports(function(lychee, sorbet, global, attachments) {

	var _fs        = require('fs');
	var _instances = [];



	/*
	 * HELPERS
	 */

	var _read_cache = function(file) {

		var blob = null;
		try {
			blob = JSON.parse(_fs.readFileSync(file, 'utf8'));
		} catch(e) {
			blob = null;
		}


		if (blob === null) {
			blob = {};
		}

		if (blob[this.id] === undefined) {
			blob[this.id] = [];
		}


		return blob;

	};

	var _write_cache = function(path, cache) {

		var result = false;
		try {
			result = _fs.writeFileSync(path, JSON.stringify(cache), 'utf8');
		} catch(e) {
			result = false;
		}

		return result;

	};

	var _on_sync = function() {

		var path  = '/tmp/sorbet.store';
		var cache = _read_cache.call(this, path);
		var store = cache[this.id];

		for (var s = 0, sl = store.length; s < sl; s++) {

			var pid   = store[s].pid;
			var index = this.__removals.indexOf(pid);
			if (index !== -1) {
				this.__removals.splice(index, 1);
				store.splice(s, 1);
				sl--;
				s--;
			}

		}


		for (var o = 0, ol = this.__objects.length; o < ol; o++) {

			var object = this.__objects[o];
			var found  = false;

			for (var s = 0, sl = store.length; s < sl; s++) {

				if (store[s].pid === object.pid) {
					store[s].id   = object.id;
					store[s].type = object.type;
					store[s].port = object.port;
					found = true;
					break;
				}

			}

			if (found === false) {
				store.push(JSON.parse(JSON.stringify(object)));
			}

		}


		_write_cache.call(this, path, cache);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__removals = [];


		settings.type  = lychee.Storage.TYPE.temporary;
		settings.model = {
			id:   'unknown',
			type: 'unknown',
			port: 1337,
			pid:  1,
			cmd:  ''
		};


		lychee.Storage.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('sync', _on_sync, this);

		this.bind('remove', function(index, object) {
			this.__removals.push(object.pid);
		}, this);

	};


	Class.TYPE = lychee.Storage.TYPE;


	Class.prototype = {

	};


	return Class;

});

