
lychee.define('sorbet.data.Filesystem').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, sorbet, global, attachments) {

	var _fs   = require('fs');
	var _path = require('path');



	/*
	 * HELPERS
	 */

	var _mkdir_p = function(path, mode) {

		path = _path.normalize(path);


		if (mode === undefined) {
			mode = 0777 & (~process.umask());
		}


		try {

			if (_fs.statSync(path).isDirectory()) {
				return true;
			} else {
				return false;
			}

		} catch(err) {

			if (err.code === 'ENOENT') {

				try {

					_mkdir_p(_path.dirname(path), mode);
					_fs.mkdirSync(path, mode);

				} catch(e) {
					return false;
				}


				return true;

			}

		}

	};

	var _refresh_recursive = function(directory, trigger) {

		trigger = trigger === true;


		var that = this;

		var list = _fs.readdirSync(directory);
		if (list.length > 0) {

			list.forEach(function(file) {

				if (file.substr(0, 1) !== '.') {

					var stat = _fs.statSync(directory + '/' + file);
					if (stat.isDirectory() === true) {

						that.__cache[directory + '/' + file] = Class.TYPE.directory;
						_refresh_recursive.call(that, directory + '/' + file);

					} else {

						that.__cache[directory + '/' + file] = Class.TYPE.file;

					}

				}

			});

		}


		if (trigger === true) {
			that.trigger('refresh', []);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(root) {

		root = _path.normalize(root);


		this.root    = null;

		this.__cache = {};
		this.__map   = {};
		this.__rmap  = {};


		lychee.event.Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		if (root.length > 0) {

			this.root               = root;
			this.__cache[this.root] = Class.TYPE.directory;

		}

	};


	Class.TYPE = {
		directory: 1,
		file:      2,
		link:      3
	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		refresh: function(force) {

			force = force === false ? false : true;


			var root = this.root;
			if (root !== null) {

				if (lychee.debug === true) {
					console.log('sorbet.module.Filesystem: Refresh for "' + root + '"');
				}


				_refresh_recursive.call(this, root, force);

			}

		},

		symlink: function(alias, path) {

			var resolved = this.resolve(path);
			if (resolved !== null) {

				if (this.resolve(alias) === null) {

					path  = _path.normalize(path);
					alias = _path.normalize(alias);


					this.__cache[path] = Class.TYPE.link;
					this.__map[alias]  = path;
					this.__rmap[path]  = alias;


					return true;

				}

			}


			return false;

		},

		remove: function(path) {

			var resolved = this.resolve(path);
			if (resolved !== null) {

				path = _path.normalize(path);

				var type = this.__cache[path];
				if (type === Class.TYPE.link) {

					var alias = this.__rmap[path];
					delete this.__map[alias];
					delete this.__rmap[path];

				}


				delete this.__cache[path];

				return true;

			}


			return false;

		},

		resolve: function(path, ignorecache) {

			path        = _path.normalize(path);
			ignorecache = ignorecache === true;


			var root = this.root;


			if (ignorecache === true) {

				if (this.__map[path] !== undefined) {

					return this.__map[path];

				} else if (this.__cache[path] !== undefined) {

					return path;

				} else if (path.substr(0, root.length) !== root) {

					return _path.normalize(root + '/' + path);

				} else if (path.substr(-1) === '/') {

					return _path.normalize(path.substr(0, path.length - 1));

				}


				return path;

			} else {

				if (this.__map[path] !== undefined) {

					return this.__map[path];

				} else if (this.__cache[path] !== undefined) {

					return path;

				} else if (path.substr(0, root.length) !== root) {

					var tmp1 = this.resolve(root + '/' + path);
					if (tmp1 !== null) {
						return tmp1;
					}

				} else if (path.substr(-1) === '/') {

					var tmp2 = path.substr(0, path.length - 1);
					if (this.__cache[tmp2] !== undefined) {
						return tmp2;
					}

				}


				return null;

			}

		},

		readrange: function(path, range, callback, scope) {

			range    = range instanceof Object      ? range      : null;
			callback = callback instanceof Function ? callback   : null;
			scope    = scope !== undefined          ? scope      : this;


			var resolved = this.resolve(path);
			var size     = range.to - range.from + 1;

			if (resolved !== null && range !== null) {

				var buffer = new Buffer(size);

				if (callback !== null) {

					_fs.open(resolved, 'r', function(err, fd) {

						if (err) {
							callback.call(scope, null);
							return;
						}

						_fs.read(fd, buffer, 0, size, range.from, function(err) {

							if (err) {
								callback.call(scope, null);
							} else {
								callback.call(scope, buffer);
							}

						});

						_fs.close(fd);

					});

				} else {

					try {

						var fd = _fs.openSync(resolved, 'r');

						_fs.readSync(fd, buffer, 0, size, range.from);
						_fs.close(fd);

						return buffer;

					} catch(e) {
					}

					return null;

				}

			} else {

				if (callback !== null) {
					callback.call(scope, null);
				} else {
					return null;
				}

			}

		},

		read: function(path, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var resolved = this.resolve(path);
			if (resolved !== null) {

				// Fastest path
				if (this.__cache[resolved] !== Class.TYPE.file) {

					if (callback !== null) {
						callback.call(scope, null);
						return;
					} else {
						return null;
					}

				}


				if (callback !== null) {

					_fs.readFile(resolved, function(err, data) {

						if (err) {
							callback.call(scope, null);
						} else {
							callback.call(scope, data);
						}

					});

				} else {

					return _fs.readFileSync(resolved);

				}

			} else {

				if (callback !== null) {
					callback.call(scope, null);
				} else {
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


			var directory = this.resolve(_path.dirname(path));
			if (this.isDirectory(directory) === true) {

				var resolved = this.resolve(path, true);


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

		copybatch: function(sources, targets) {

			sources = sources instanceof Array ? sources : null;
			targets = targets instanceof Array ? targets : null;


			if (sources !== null && targets !== null && sources.length === targets.length) {

				var result = true;

				for (var s = 0, sl = sources.length; s < sl; s++) {

					var source = sources[s];
					var target = targets[s];

					if (this.copy(source, target) === false) {
						result = false;
					}

				}


				return result;

			}


			return false;

		},

		copy: function(source, target, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;



			var resolvedsource = this.resolve(source);
			var resolvedtarget = this.resolve(target);
			var directory      = this.resolve(_path.dirname(target));

			if (this.isFile(resolvedsource) === true && this.isDirectory(directory) === true && this.isFile(resolvedtarget) === false) {

				resolvedtarget = this.resolve(target, true);


				var read  = null;
				var write = null;

				if (callback !== null) {

					read = _fs.createReadStream(resolvedsource);

					read.on('open', function() {

						write = _fs.createWriteStream(resolvedtarget);

						write.on('open', function() {
							read.pipe(write);
						});

						write.on('close', function() {
							read.close();
							callback.call(scope, true);
						});

						write.on('error', function(err) {
							callback.call(scope, false);
						});

					});

					read.on('error', function(err) {
						callback.call(scope, false);
					});

				} else {

					try {
						read = _fs.readFileSync(resolvedsource);
					} catch(e) {
						read = null;
					}

					if (read !== null) {

						try {
							_fs.writeFileSync(resolvedtarget, read);
							write = true;
						} catch(e) {
							write = false;
						}

					}

					return write === true;

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

			var resolved = this.resolve(path);
			if (resolved !== null) {

				var raw = null;

				try {

					raw = _fs.statSync(resolved);

				} catch(e) {
				}


				if (raw !== null) {

					return {
						index:  raw.ino,
						length: raw.size,
						time:   raw.mtime
					};

				}

			}


			return null;

		},

		mkdir: function(path) {

			path = this.resolve(path, true);


			if (this.isDirectory(path) === false) {

				var result = _mkdir_p(path);
				if (result === true) {

					this.__cache[path] = Class.TYPE.directory;
					this.refresh();

					return true;

				}

			}


			return false;

		},

		filter: function(prefix, suffix, type) {

			prefix = typeof prefix === 'string'               ? prefix : null;
			suffix = typeof suffix === 'string'               ? suffix : null;
			type   = lychee.enumof(Class.TYPE, type) === true ? type   : null;


			var pl = 0, sl = 0;
			if (prefix !== null) pl = prefix.length;
			if (suffix !== null) sl = suffix.length;


			var filtered = [];
			for (var path in this.__cache) {

				if (prefix === null || path.substr(0, pl) === prefix) {
					if (suffix === null || path.substr(-1 * sl) === suffix) {
						if (type === null || this.__cache[path] === type) {
							filtered.push(path);
						}
					}
				}

			}


			return filtered;

		},

		isDirectory: function(path) {

			path = typeof path === 'string' ? path : null;


			if (path !== null) {
				return this.__cache[path] === Class.TYPE.directory;
			}


			return false;

		},

		isFile: function(path) {

			path = typeof path === 'string' ? path : null;


			if (path !== null) {
				return this.__cache[path] === Class.TYPE.file;
			}


			return false;

		}

	};


	return Class;

});

