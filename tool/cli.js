
/*
 * POLYFILLS
 */

if (typeof String.prototype.replacetemplate !== 'function') {

	String.prototype.replacetemplate = function(key, value) {

		key   = typeof key === 'string'   ? key   : null;
		value = typeof value === 'string' ? value : '';


		if (key !== null) {

			var indexes = [];
			var index   = this.indexOf(key);

			while (index !== -1) {
				indexes.push(index);
				index = this.indexOf(key, index + 1);
			}


			var keyo   = 0;
			var keyl   = key.length;
			var vall   = value.length;
			var buffer = '' + this;

			indexes.forEach(function(keyi) {

				buffer  = buffer.substr(0, keyi + keyo) + value + buffer.substr(keyi + keyo + keyl);
				keyo   += (vall - keyl);

			});


			return buffer;

		}


		return this;

	};

}

if (typeof String.prototype.trim !== 'function') {

	String.prototype.trim = function() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
	};

}



/*
 * IMPLEMENTATION
 */


var _root = require('path').resolve(__dirname, '../');

(function(lychee, global) {

	var _child_process = require('child_process');
	var _self_process  = process.argv[0] || 'nodejs';
	var _exec          = require('child_process').exec;
	var _fs            = require('fs');
	var _http          = require('http');
	var _https         = require('https');
	var _path          = require('path');



	/*
	 * HELPERS
	 */

	var _mkdir_p = function(path, mode) {

		path = _path.resolve(path);

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

				_mkdir_p(_path.dirname(path), mode);
				_fs.mkdirSync(path, mode);

				return true;

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Filesystem = function(fertilizer, sandbox) {

		this.__cache      = [];
		this.__fertilizer = '/tmp/lycheejs';
		this.__sandbox    = '/tmp/lycheejs';


		var stat;

		if (typeof fertilizer === 'string') {

			try {

				stat = _fs.statSync(fertilizer);

				if (stat.isDirectory()) {
					this.__fertilizer = fertilizer;
				}

			} catch(e) {
			}

		}

		if (typeof sandbox === 'string') {

			try {

				stat = _fs.statSync(sandbox);

				if (stat.isDirectory()) {
					this.__sandbox = sandbox;
				}

			} catch(e) {
			}

		}

	};


	Filesystem.prototype = {

		copy: function(path1, path2) {

			path1 = typeof path1 === 'string' ? path1 : null;
			path2 = typeof path2 === 'string' ? path2 : null;


			if (path1 !== null && path2 !== null) {

				var result = false;
				try {

					if (_fs.existsSync(this.__sandbox + '/' + path1)) {

						var buffer = _fs.readFileSync(this.__sandbox + '/' + path1);
						_fs.writeFileSync(this.__sandbox + '/' + path2, buffer);

						result = true;

					}

				} catch(e) {

				}


				if (result === true) {

					var index = this.__cache.indexOf(path2);
					if (index === -1) {
						this.__cache.push(path2);
					}

					return true;

				}

			}


			return false;

		},

		copylychee: function(path1, path2) {

			path1 = typeof path1 === 'string' ? path1 : null;
			path2 = typeof path2 === 'string' ? path2 : null;


			if (path1 !== null && path2 !== null) {

				var result = false;
				try {

					if (_fs.existsSync(_root + '/lychee/build/' + path1)) {

						var tmp2    = path2.split('/'); tmp2.pop();
						var folder2 = tmp2.join('/');
						if (folder2 !== '') {
							_mkdir_p(this.__sandbox + '/' + folder2);
						}

						var buffer = _fs.readFileSync(_root + '/lychee/build/' + path1);
						_fs.writeFileSync(this.__sandbox + '/' + path2, buffer);

						result = true;

					}

				} catch(e) {

				}


				if (result === true) {

					var index = this.__cache.indexOf(path2);
					if (index === -1) {
						this.__cache.push(path2);
					}

					return true;

				}

			}


			return false;

		},

		copytemplate: function(path1, path2) {

			path1 = typeof path1 === 'string' ? path1 : null;
			path2 = typeof path2 === 'string' ? path2 : null;


			if (path1 !== null && path2 !== null) {

				var result = false;
				try {

					if (_fs.existsSync(this.__fertilizer + '/' + path1)) {

						var tmp2    = path2.split('/'); tmp2.pop();
						var folder2 = tmp2.join('/');
						if (folder2 !== '') {
							_mkdir_p(this.__sandbox + '/' + folder2);
						}

						var buffer = _fs.readFileSync(this.__fertilizer + '/' + path1);
						_fs.writeFileSync(this.__sandbox + '/' + path2, buffer);

						result = true;

					}

				} catch(e) {

				}


				if (result === true) {

					var index = this.__cache.indexOf(path2);
					if (index === -1) {
						this.__cache.push(path2);
					}

					return true;

				}

			}


			return false;

		},

		read: function(path, encoding) {

			path     =  typeof path === 'string' ? path     : null;
			encoding = encoding === 'binary'     ? 'binary' : 'utf8';


			if (path !== null) {

				var data = null;
				try {
					data = _fs.readFileSync(this.__sandbox + '/' + path, encoding);
				} catch(e) {

				}

				return data;

			}


			return null;

		},

		write: function(path, data, encoding) {

			path     =  typeof path === 'string'                            ? path   : null;
			data     = (typeof data === 'string' || data instanceof Buffer) ? data   : null;
			encoding =  typeof data === 'string'                            ? 'utf8' : (encoding || 'binary');


			if (path !== null && data !== null) {

				if (path.charAt(0) === '.') {
					return false;
				}


				var result = false;

				if (encoding === 'utf8') {

					try {
						_fs.writeFileSync(this.__sandbox + '/' + path, data, 'utf8');
						result = true;
					} catch(e) {

					}


					if (result === true) {

						this.__cache.push(path);

						return true;

					}

				} else if (encoding === 'binary') {

					try {
						_fs.writeFileSync(this.__sandbox + '/' + path, data.toString('binary'), 'binary');
						result = true;
					} catch(e) {

					}


					if (result === true) {

						var index = this.__cache.indexOf(path);
						if (index === -1) {
							this.__cache.push(path);
						}

						return true;

					}

				}

			}


			return false;

		},

		extractindex: function() {

			var cache    = this.__cache;
			var filtered = [];

			for (var c = 0, cl = cache.length; c < cl; c++) {

				if (cache[c].split('/').pop().substr(0, 5) === 'index') {
					filtered.push(cache[c]);
				}

			}


			for (var f = 0, fl = filtered.length; f < fl; f++) {

				var file        = filtered[f].split('/').pop();
				var sandboxpath = this.__sandbox + '/' + file;
				var outputpath  = this.__sandbox + '.' + file.split('.').pop();

				if (filtered[f] === file) {

					var buffer = _fs.readFileSync(sandboxpath);
					if (buffer !== null) {
						_fs.writeFileSync(outputpath, buffer);
					}

				}

			}

		},

		remove: function(path) {

			path = typeof path === 'string' ? path : null;


			if (path !== null) {

				if (path.charAt(0) === '.') {
					return false;
				}


				var result = false;
				try {
					_fs.unlinkSync(this.__sandbox + '/' + path);
					result = true;
				} catch(e) {

				}

				if (result === true) {

					var index = this.__cache.indexOf(path);
					if (index !== -1) {
						this.__cache.splice(index, 1);
					}

					return true;

				}

			}


			return false;

		}

	};


	var Shell = function(sandbox) {

		this.__sandbox = '/tmp/lycheejs';


		if (typeof sandbox === 'string') {

			try {

				var stat = _fs.statSync(sandbox);

				if (stat.isDirectory()) {
					this.__sandbox = sandbox;
				}

			} catch(e) {
			}

		}

	};


	Shell.prototype = {

		download: function(url, path, callback, scope) {

			url      = typeof url === 'string'      ? url      : null;
			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (url !== null && path !== null) {

				var file       = _fs.createWriteStream(this.__sandbox + '/' + path);
				var downloader = _http;
				if (url.substr(0, 5) === 'https') {
					downloader = _https;
				}


				downloader.get(url, function(response) {

					response.pipe(file);

					file.on('finish', function() {

						file.close(function() {

							if (callback !== null) {
								callback.call(scope, true);
							}

						});

					});

				}).on('error', function() {

					if (callback !== null) {
						callback.call(scope, false);
					}

				});


				return true;

			}


			return false;

		},

		move: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			_exec('cd ' + this.__sandbox + ' && mv ' + this.__sandbox + '/' + path + ' ' + this.__sandbox + '/', function(err, stdout, stderr) {

				if (callback !== null) {

					if (err) {
						callback.call(scope, false);
					} else {
						callback.call(scope, true);
					}

				}

			});


			return true;

		},

		unzip: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (_fs.existsSync(this.__sandbox + '/' + path)) {

				_exec('cd ' + this.__sandbox + ' && unzip ' + path, function(err, stdout, stderr) {

					if (callback !== null) {

						if (err) {
							callback.call(scope, false);
						} else {
							callback.call(scope, true);
						}

					}

				});


				return true;

			}


			return false;

		}

	};



	/*
	 * EXPORTS
	 */

	module.exports = {

		lychee:  lychee,
		global:  global,

		Filesystem: Filesystem,
		Shell:      Shell,

		include: function(path, identifier) {

			var Class = null;

			try {

				require(_root + '/' + path);

				var definition = lychee.environment.definitions[identifier] || null;
				if (definition !== null) {
					Class = definition._exports.call(definition._exports, lychee, global, definition._attaches);
				}

			} catch(e) {
			}

			return Class;

		},

		resolve: function(path) {

			var result = null;

			if (typeof path === 'string') {

				try {
					result = _path.resolve(_root, path);
				} catch(e) {
					result = path;
				}

			}

			return result;

		},

		read: function(path) {

			path = typeof path === 'string' ? path : '';


			var type = path.split('.').pop() || '';
			var data = null;

			if (this.isFile(path)) {

				var raw = null;
				try {
					raw = _fs.readFileSync(path, 'utf8');
				} catch(e) {
				}


				if (raw !== null) {

					if (type.match(/json|env|pkg|store/)) {

						try {
							data = JSON.parse(raw);
						} catch(e) {
							data = null;
						}

					} else {

						data = raw;

					}

				}

			}

			return data;

		},

		write: function(path, data, encoding) {

			path     =  typeof path === 'string'                            ? path   : null;
			data     = (typeof data === 'string' || data instanceof Buffer) ? data   : null;
			encoding =  typeof data === 'string'                            ? 'utf8' : (encoding || 'binary');


			if (path !== null && data !== null) {

				if (path.charAt(0) === '.') {
					return false;
				}


				var result = false;

				if (encoding === 'utf8') {

					try {
						_fs.writeFileSync(path, data, 'utf8');
						result = true;
					} catch(e) {

					}

				} else if (encoding === 'binary') {

					try {
						_fs.writeFileSync(path, data.toString('binary'), 'binary');
						result = true;
					} catch(e) {

					}

				}


				return result;

			}


			return false;

		},

		isDirectory: function(path) {

			var result = false;

			if (typeof path === 'string') {

				try {

					var stat = _fs.statSync(path);
					if (stat.isDirectory()) {
						result = true;
					}

				} catch(e) {
				}

			}

			return result;

		},

		isFile: function(path) {

			var result = false;

			if (typeof path === 'string') {

				try {

					var stat = _fs.statSync(path);
					if (stat.isFile()) {
						result = true;
					}

				} catch(e) {
				}

			}

			return result;

		},

		table: function(array) {

			if (array.length === 0) {
				return false;
			}


			var keys = Object.keys(array[0]);
			if (keys.length > 0) {

				var k, kl;
				var table   = [ [] ];
				var lengths = [];


				keys.forEach(function(value, v) {
					table[0].push(value);
					lengths[v] = value.length;
				});


				array.forEach(function(values) {

					var row = [];

					keys.forEach(function(key, k) {
						var value  = '' + values[key];
						lengths[k] = Math.max(lengths[k], value.length);
						row.push(value);
					});

					table.push(row);

				});


				table.forEach(function(row, r, self) {

					keys.forEach(function(key, k) {
						var space = '                        '.substr(0, lengths[k] - row[k].length);
						row[k]    = row[k] + space;
					});

					self[r] = ' ' + row.join(' | ');

				});

				console.log('\n' + table.join('\n') + '\n');

			}

		}

	};

})(require(_root + '/lychee/build/nodejs/core.js')(_root), typeof global !== 'undefined' ? global : this);

