
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

		var that  = this;
		var path  = '/tmp/sorbet.store';
		var cache = _read_cache.call(this, path);
		var cid   = this.id;


		// delete instruction
		cache[cid] = cache[cid].filter(function(object) {

			var pid = object.pid;
			var r   = that.__removals.indexOf(pid);
			if (r !== -1) {
				that.__removals.splice(r, 1);
				return false;
			}

			return true;

		});


		this.__objects.forEach(function(object) {

			var found = false;

			// update instruction
			cache[cid].forEach(function(item) {

				if (item.pid === object.pid) {

					item.id   = object.id;
					item.type = object.type;
					item.port = object.port;

					found = true;

				}

			});

			// insert instruction
			if (found === false) {
				cache[cid].push(JSON.parse(JSON.stringify(object)));
			}

		});


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

