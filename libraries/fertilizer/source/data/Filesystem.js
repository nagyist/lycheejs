
lychee.define('fertilizer.data.Filesystem').tags({
	platform: 'node'
}).supports(function(lychee, global) {

	if (typeof process !== 'undefined') {

		try {

			require('fs');
			require('path');

			return true;

		} catch(e) {
		}

	}

	return false;

}).exports(function(lychee, fertilizer, global, attachments) {

	var _ROOT = lychee.ROOT.lychee;
	var _fs   = require('fs');
	var _path = require('path');



	/*
	 * HELPERS
	 */

	var _create_directory = function(path, mode) {

		if (mode === undefined) {
			mode = 0777 & (~process.umask());
		}


		var is_directory = false;

		try {

			is_directory = _fs.lstatSync(path).isDirectory();

		} catch(err) {

			if (err.code === 'ENOENT') {

				if (_create_directory(_path.dirname(path), mode) === true) {
					_fs.mkdirSync(path, mode);
				}

				try {
					is_directory = _fs.lstatSync(path).isDirectory();
				} catch(err) {
				}

			}

		} finally {

			return is_directory;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(root) {

		this.root = _path.normalize(root);
		this.mode = Class.MODE.sandbox;

	};


	Class.MODE = {
		'default': 0,
		'sandbox': 1
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'fertilizer.data.Filesystem',
				'arguments':   [ this.root ]
			};

		},



		/*
		 * CUSTOM API
		 */

		dir: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) return false;


			var resolved = _path.normalize(this.root + path);
			if (this.mode === Class.MODE.sandbox) {
				resolved = _ROOT + resolved;
			}

			if (callback !== null) {

				_fs.readdir(resolved, function(err, data) {

					if (err) {
						callback.call(scope, []);
					} else {
						callback.call(scope, data);
					}

				});

			} else {

				try {
					return _fs.readdirSync(resolved);
				} catch(e) {
					return [];
				}

			}

		},

		chmod: function(path, mode) {

			mode = typeof mode === 'string' ? mode : '777';


			var resolved = _path.normalize(this.root + path);
			if (this.mode === Class.MODE.sandbox) {
				resolved = _ROOT + resolved;
			}


			if (resolved !== null) {

				var result = false;
				try {
					_fs.chmodSync(resolved, mode);
					result = true;
				} catch(e) {
					result = false;
				}

				return result;

			}


			return false;

		},

		copy: function(filesystem, path) {

			filesystem = filesystem instanceof fertilizer.data.Filesystem ? filesystem : null;
			path       = typeof path === 'string' ? path : null;


			if (filesystem === null) return false;
			if (path === null) return false;


			var data = this.read(path);
			if (data !== null) {

				filesystem.write(path, data);

				return true;

			}


			return false;

		},

		read: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) return false;


			var resolved = _path.normalize(this.root + path);
			if (this.mode === Class.MODE.sandbox) {
				resolved = _ROOT + resolved;
			}

			if (callback !== null) {

				var data = null;
				try {
					data = _fs.readFileSync(resolved);
				} catch(e) {
					data = null;
				}

				callback.call(scope, data);

			} else {

				try {
					return _fs.readFileSync(resolved);
				} catch(e) {
					return null;
				}

			}

		},

		write: function(path, data, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) return false;


			var encoding = 'binary';

			if (typeof data === 'string') {
				encoding = 'utf8';
			} else {
				encoding = 'binary';
			}


			if (this.mode === Class.MODE.sandbox) {
				_create_directory(_ROOT + this.root + _path.dirname(path));
			} else {
				_create_directory(this.root + _path.dirname(path));
			}


			var info     = this.info(_path.dirname(path));
			var resolved = _path.normalize(this.root + path);
			if (this.mode === Class.MODE.sandbox) {
				resolved = _ROOT + resolved;
			}

			if (resolved !== null && info !== null && info.type === 'directory') {

				if (callback !== null) {

					var result = false;
					try {
						_fs.writeFileSync(resolved, data, encoding);
						result = true;
					} catch(e) {
						result = false;
					}

					callback.call(scope, result);

				} else {

					var result = false;
					try {
						_fs.writeFileSync(resolved, data, encoding);
						result = true;
					} catch(e) {
						result = false;
					}

					return result;

				}

			} else {

				if (callback !== null) {
					callback.call(scope, false);
				} else {
					return false;
				}

			}

		},

		info: function(path) {

			path = typeof path === 'string' ? path : null;


			if (path === null) return false;


			var resolved = _path.normalize(this.root + path);
			if (this.mode === Class.MODE.sandbox) {
				resolved = _ROOT + resolved;
			}

			if (resolved !== null) {

				var stat = null;

				try {
					stat = _fs.lstatSync(resolved);
				} catch(e) {
					stat = null;
				}


				if (stat !== null) {

					return {
						type:   stat.isFile() ? 'file' : 'directory',
						length: stat.size,
						time:   stat.mtime
					};

				}

			}


			return null;

		},

		setMode: function(mode) {

			mode = lychee.enumof(Class.MODE, mode) ? mode : null;


			if (mode !== null) {

				this.mode = mode;

				return true;

			}


			return false;

		}

	};


	return Class;

});

