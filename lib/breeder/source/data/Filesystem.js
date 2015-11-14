
lychee.define('breeder.data.Filesystem').exports(function(lychee, fertilizer, global, attachments) {

	var _fs   = require('fs');
	var _path = require('path');
	var _root = _path.resolve(__dirname + '/../../../../');



	/*
	 * HELPERS
	 */

	var _create_directory = function(path, mode) {

		if (mode === undefined) {
			mode = 0777 & (~process.umask());
		}


		try {

			_fs.lstatSync(path).isDirectory();

		} catch(err) {

			if (err.code === 'ENOENT') {

				_create_directory(_path.dirname(path), mode);
				_fs.mkdirSync(path, mode);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(root) {

		this.root = _path.normalize(root);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		dir: function(path, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var resolved = _root + _path.normalize(this.root + path);
			if (callback !== null) {

				_fs.readdirSync(resolved, function(err, data) {

					if (err) {
						callback.call(scope, null);
					} else {
						callback.call(scope, data);
					}

				});

			} else {

				try {
					return _fs.readdirSync(resolved);
				} catch(e) {
					return null;
				}

			}

		},

		read: function(path, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var resolved = _root + _path.normalize(this.root + path);
			if (callback !== null) {

				_fs.readFile(resolved, function(err, data) {

					if (err) {
						callback.call(scope, null);
					} else {
						callback.call(scope, data);
					}

				});

			} else {

				try {
					return _fs.readFileSync(resolved);
				} catch(e) {
					return null;
				}

			}

		},

		write: function(path, data, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var encoding = 'binary';

			if (typeof data === 'string') {
				encoding = 'utf8';
			} else {
				encoding = 'binary';
			}


			_create_directory(_root + this.root + _path.dirname(path));


			var info     = this.info(_path.dirname(path));
			var resolved = _root + _path.normalize(this.root + path);

			if (info !== null && info.type === 'directory') {

				if (callback !== null) {

					_fs.writeFile(resolved, data, encoding, function(err) {

						if (err) {
							callback.call(scope, false);
						} else {
							callback.call(scope, true);
						}

					});

				} else {

					return _fs.writeFileSync(resolved, data, encoding);

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

			var resolved = _root + _path.normalize(this.root + path);
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

		}

	};


	return Class;

});

