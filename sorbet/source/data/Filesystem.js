
lychee.define('sorbet.data.Filesystem').exports(function(lychee, sorbet, global, attachments) {

	var _fs   = require('fs');
	var _path = require('path');
	var _root = _path.resolve(__dirname + '/../../../');



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

			}

		} finally {

			return is_directory;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(root) {

		this.root = _path.normalize(_root + _path.normalize(root));

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		asset: function(path, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var asset    = null;
			var resolved = _path.normalize(this.root.substr(process.cwd().length) + path);
			if (callback !== null) {

				asset = new lychee.Asset(resolved, null, true);

				if (asset !== null) {
					asset.load();
				}

				callback.call(scope, asset);

			} else {

				try {

					asset = new lychee.Asset(resolved, null, true);

					if (asset !== null) {
						asset.load();
					}

					return asset;

				} catch(e) {
					return null;
				}

			}

		},

		dir: function(path, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var resolved = _path.normalize(this.root + path);
			if (callback !== null) {

				_fs.readdir(resolved, function(err, data) {

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


			var resolved = _path.normalize(this.root + path);
			if (callback !== null) {

				var data = _fs.readFileSync(resolved);
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

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var encoding = 'binary';

			if (typeof data === 'string') {
				encoding = 'utf8';
			} else {
				encoding = 'binary';
			}


			_create_directory(_path.dirname(path));


			var info     = this.info(_path.dirname(path));
			var resolved = _path.normalize(this.root + path);

			if (info !== null && info.type === 'directory') {

				if (callback !== null) {

					var result = false;
					try {
						result = _fs.writeFileSync(resolved, data, encoding);
					} catch(e) {
						result = false;
					}

					callback.call(scope, result);

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

			var resolved = _path.normalize(this.root + path);
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

