
(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _fs        = require('fs');
	var _root      = '';
	var __filename = null;

	var _resolve_url = function(path) {

		if (_root !== '') {
			path = _root + (path.charAt(0) === '/' ? '' : '/') + path;
		}


		var tmp = path.split('/');

		for (var t = 0, tl = tmp.length; t < tl; t++) {

			if (tmp[t] === '.') {
				tmp.splice(t, 1);
				tl--;
				t--;
			} else if (tmp[t] === '..') {
				tmp.splice(t - 1, 2);
				tl -= 2;
				t  -= 2;
			}

		}

		return tmp.join('/');

	};

	var _load_asset = function(settings, callback, scope) {

		var path     = _resolve_url(settings.url);
		var encoding = settings.encoding === 'binary' ? 'binary': 'utf8';


		_fs.readFile(path, encoding, function(err, buffer) {

			var raw = null;
			if (!err) {
				raw = buffer;
			}

			try {
				callback.call(scope, raw);
			} catch(err) {
				lychee.Debugger.report(err, lychee.environment, null);
			}

		});

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		var audio  = false;
		var buffer = true;
		var image  = false;


		if (lychee.debug === true) {

			var methods = [];

			if (audio)  methods.push('Audio');
			if (buffer) methods.push('Buffer');
			if (image)  methods.push('Image');

			if (methods.length === 0) {
				console.error('bootstrap.js: Supported methods are NONE');
			} else {
				console.log('bootstrap.js: Supported methods are ' + methods.join(', '));
			}

		}

	})();



	/*
	 * CONFIG IMPLEMENTATION
	 */

	var _config_cache = {};


	var _clone_config = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer = JSON.parse(JSON.stringify(origin.buffer));

			clone.__load = false;

		}

	};


	var Config = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url    = url;
		this.onload = null;
		this.buffer = null;

		this.__load = true;


		if (url !== null) {

			if (_config_cache[url] !== undefined) {
				_clone_config(_config_cache[url], this);
			} else {
				_config_cache[url] = this;
			}

		}

	};


	Config.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {
				this.buffer = JSON.parse(new Buffer(blob.buffer, 'base64').toString('utf8'));
			}

		},

		serialize: function() {

			var blob = {};


			if (this.buffer !== null) {
				blob.buffer = new Buffer(JSON.stringify(this.buffer), 'utf8').toString('base64');
			}


			return {
				'constructor': 'Config',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			_load_asset({
				url:      this.url,
				encoding: 'utf8'
			}, function(raw) {

				var data = null;
				try {
					data = JSON.parse(raw);
				} catch(e) {
				}


				this.buffer = data;


				if (data !== null) {

				} else {

					if (lychee.debug === true) {
						console.error('bootstrap.js: Config at ' + this.url + ' is invalid (No JSON file)');
					}

				}


				if (this.onload instanceof Function) {
					this.onload(data !== null);
					this.onload = null;
				}

			}, this);

		}

	};



	/*
	 * FONT IMPLEMENTATION
	 */

	var _parse_font = function(data) {

		if (typeof data.kerning === 'number' && typeof data.spacing === 'number') {

			if (data.kerning > data.spacing) {
				data.kerning = data.spacing;
			}

		}


		if (data.texture !== undefined) {
			this.texture = new Texture(data.texture);
			this.texture.load();
		}


		this.baseline   = typeof data.baseline === 'number'    ? data.baseline   : this.baseline;
		this.charset    = typeof data.charset === 'string'     ? data.charset    : this.charset;
		this.spacing    = typeof data.spacing === 'number'     ? data.spacing    : this.spacing;
		this.kerning    = typeof data.kerning === 'number'     ? data.kerning    : this.kerning;
		this.lineheight = typeof data.lineheight === 'number'  ? data.lineheight : this.lineheight;


		if (data.map instanceof Array) {

			this.__buffer     = {};
			this.__buffer[''] = {
				width:      0,
				height:     this.lineheight,
				realwidth:  0,
				realheight: this.lineheight,
				x:          0,
				y:          0
			};



			var offset = this.spacing;

			for (var c = 0, cl = this.charset.length; c < cl; c++) {

				var id = this.charset[c];

				var chr = {
					width:      data.map[c] + this.spacing * 2,
					height:     this.lineheight,
					realwidth:  data.map[c],
					realheight: this.lineheight,
					x:          offset - this.spacing,
					y:          0
				};

				offset += chr.width;


				this.__buffer[id] = chr;

			}

		}


		if (this.texture === null || this.__buffer === null) {

			if (lychee.debug === true) {
				console.error('bootstrap.js: Font at "' + this.url + '" is invalid (No FNT file)');
			}

		}

	};


	var _font_cache = {};


	var _clone_font = function(origin, clone) {

		if (origin.__buffer !== null && origin.texture !== null) {

			clone.texture    = origin.texture;

			clone.baseline   = origin.baseline;
			clone.charset    = origin.charset;
			clone.spacing    = origin.spacing;
			clone.kerning    = origin.kerning;
			clone.lineheight = origin.lineheight;

			clone.__buffer   = origin.__buffer;
			clone.__load     = false;

		}

	};


	var Font = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url        = url;
		this.onload     = null;
		this.texture    = null;

		this.baseline   = 0;
		this.charset    = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
		this.spacing    = 0;
		this.kerning    = 0;
		this.lineheight = 1;

		this.__buffer   = null;
		this.__load     = true;


		if (url !== null) {

			if (_font_cache[url] !== undefined) {
				_clone_font(_font_cache[url], this);
			} else {
				_font_cache[url] = this;
			}

		}

	};


	Font.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {
				this.__buffer = JSON.parse(new Buffer(blob.buffer.substr(29), 'base64').toString('utf8'));
			}

			if (blob.texture instanceof Object) {
				this.texture = lychee.deserialize(blob.texture);
			}

		},

		serialize: function() {

			var blob = {};


			if (this.__buffer !== null) {
				blob.buffer = 'data:application/json;base64,' + new Buffer(JSON.stringify(this.__buffer), 'utf8').toString('base64');
			}

			if (this.texture instanceof Texture) {
				blob.texture = lychee.serialize(this.texture);
			}


			return {
				'constructor': 'Font',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		measure: function(text) {

			text = typeof text === 'string' ? text : null;


			if (text !== null) {

				if (text.length === 1) {

					if (this.__buffer[text] !== undefined) {
						return this.__buffer[text];
					}

				} else if (text.length > 1) {

					var data = this.__buffer[text] || null;
					if (data === null) {

						var width = 0;

						for (var t = 0, tl = text.length; t < tl; t++) {
							var chr = this.measure(text[t]);
							width  += chr.realwidth + this.kerning;
						}


						// TODO: Embedded Font ligatures will set x and y values based on settings.map

						data = this.__buffer[text] = {
							width:      width,
							height:     this.lineheight,
							realwidth:  width,
							realheight: this.lineheight,
							x:          0,
							y:          0
						};

					}


					return data;

				}

			}


			return this.__buffer[''];

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			_load_asset({
				url:      this.url,
				encoding: 'utf8'
			}, function(raw) {

				var data = null;
				try {
					data = JSON.parse(raw);
				} catch(e) {
				}


				if (data !== null) {
					_parse_font.call(this, data);
					this.__load = false;
				}


				if (this.onload instanceof Function) {
					this.onload(data !== null);
					this.onload = null;
				}

			}, this);

		}

	};



	/*
	 * MUSIC IMPLEMENTATION
	 */

	var _music_cache = {};


	var _clone_music = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer = origin.buffer;

			clone.__load = false;

		}

	};


	var Music = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url       = url;
		this.onload    = null;
		this.buffer    = null;
		this.volume    = 0.0;
		this.isIdle    = true;
		this.isLooping = false;

		this.__load    = true;


		if (url !== null) {

			if (_music_cache[url] !== undefined) {
				_clone_music(_music_cache[url], this);
			} else {
				_music_cache[url] = this;
			}

		}

	};


	Music.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {
				this.buffer = new Buffer(blob.buffer, 'base64');
			}

		},

		serialize: function() {

			var blob = {};

			if (this.buffer !== null) {
				blob.buffer = new Buffer(this.buffer, 'binary').toString('base64');
			}


			return {
				'constructor': 'Music',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			_load_asset({
				url:      this.url,
				encoding: 'binary'
			}, function(raw) {

				if (raw !== null) {
					this.buffer = new Buffer(raw, 'binary');
				}


				if (this.onload instanceof Function) {
					this.onload(raw !== null);
					this.onload = null;
				}

			}, this);

		},

		clone: function() {
			return new Music(this.url);
		},

		play: function() {
			this.isIdle = false;
		},

		pause: function() {
			this.isIdle = true;
		},

		resume: function() {
			this.isIdle = false;
		},

		stop: function() {
			this.isIdle = true;
		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			return false;

		}

	};



	/*
	 * SOUND IMPLEMENTATION
	 */

	var _sound_cache = {};


	var _clone_sound = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer = origin.buffer;

			clone.__load = false;

		}

	};


	var Sound = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url    = url;
		this.onload = null;
		this.buffer = null;
		this.volume = 0.0;
		this.isIdle = true;

		this.__load = true;


		if (url !== null) {

			if (_sound_cache[url] !== undefined) {
				_clone_sound(_sound_cache[url], this);
			} else {
				_sound_cache[url] = this;
			}

		}

	};


	Sound.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {
				this.buffer = new Buffer(blob.buffer, 'base64');
			}

		},

		serialize: function() {

			var blob = {};

			if (this.buffer !== null) {
				blob.buffer = new Buffer(this.buffer, 'binary').toString('base64');
			}


			return {
				'constructor': 'Sound',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			_load_asset({
				url:      this.url,
				encoding: 'binary'
			}, function(raw) {

				if (raw !== null) {
					this.buffer = new Buffer(raw, 'binary');
				}


				if (this.onload instanceof Function) {
					this.onload(raw !== null);
					this.onload = null;
				}

			}, this);

		},

		clone: function() {
			return new Sound(this.url);
		},

		play: function() {
			this.isIdle = false;
		},

		pause: function() {
			this.isIdle = true;
		},

		resume: function() {
			this.isIdle = false;
		},

		stop: function() {
			this.isIdle = true;
		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			return false;

		}

	};



	/*
	 * TEXTURE IMPLEMENTATION
	 */

	var _texture_id    = 0;
	var _texture_cache = {};

	var _parse_texture = function(data) {

		this.width  = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];
		this.height = (data[4] << 24) | (data[5] << 16) | (data[6] << 8) | data[7];

	};


	var _clone_texture = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.id     = origin.id;

			clone.buffer = origin.buffer;
			clone.width  = origin.width;
			clone.height = origin.height;

			clone.__load = false;

		}

	};


	var Texture = function(url) {

		url = typeof url === 'string' ? url : null;


		this.id     = _texture_id++;
		this.url    = url;
		this.onload = null;
		this.buffer = null;
		this.width  = 0;
		this.height = 0;

		this.__load = true;


		if (url !== null && url.substr(0, 10) !== 'data:image') {

			if (_texture_cache[url] !== undefined) {
				_clone_texture(_texture_cache[url], this);
			} else {
				_texture_cache[url] = this;
			}

		}

	};


	Texture.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {
				this.buffer = new Buffer(blob.buffer.substr(22), 'base64');
				this.__load = false;
			}

		},

		serialize: function() {

			var blob = {};


			if (this.buffer !== null) {
				blob.buffer = 'data:image/png;base64,' + this.buffer.toString('base64');
			}


			return {
				'constructor': 'Texture',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

			}


			if (this.url.substr(0, 5) === 'data:') {

				if (this.url.substr(0, 15) === 'data:image/png;') {

					var b64data = this.url.substr(15, this.url.length - 15);
					this.buffer = new Buffer(b64data, 'base64');
					this.__load = false;

					_parse_texture.call(this, this.buffer.slice(16, 24));

				} else {

					if (lychee.debug === true) {
						console.error('bootstrap.js: Texture at "' + this.url.substr(0, 15) + '" is invalid (no PNG file)');
					}

				}


				if (this.onload instanceof Function) {
					this.onload(this.buffer !== null);
					this.onload = null;
				}

			} else {

				if (this.url.split('.').pop() === 'png') {

					_load_asset({
						url:      this.url,
						encoding: 'binary'
					}, function(raw) {

						if (raw !== null) {

							this.buffer = new Buffer(raw, 'binary');
							this.__load = false;

							_parse_texture.call(this, this.buffer.slice(16, 24));

						}


						if (this.onload instanceof Function) {
							this.onload(raw !== null);
							this.onload = null;
						}

					}, this);

				} else {

					if (lychee.debug === true) {
						console.error('bootstrap.js: Texture at "' + this.url + '" is invalid (no PNG file)');
					}


					if (this.onload instanceof Function) {
						this.onload(false);
						this.onload = null;
					}

				}

			}


			var is_power_of_two = (this.width & (this.width - 1)) === 0 && (this.height & (this.height - 1)) === 0;
			if (is_power_of_two === false) {

				if (lychee.debug === true) {
					console.warn('bootstrap.js: Texture at ' + this.url + ' is NOT power-of-two');
				}

			}

		}

	};



	/*
	 * PRELOADER IMPLEMENTATION
	 */

	var _Wildcard = function(url) {

		this.url    = url;
		this.onload = null;
		this.buffer = null;

	};

	_Wildcard.prototype = {

		serialize: function() {

			return {
				'url':    this.url,
				'buffer': this.buffer !== null ? this.buffer.toString() : null
			};

		},

		load: function() {

			if (this.buffer !== null) {
				return;
			}


			var that = this;
			var file = _resolve_url(this.url);

			if (_fs.existsSync(file) === false) {

				this.buffer = null;

				if (this.onload instanceof Function) {
					this.onload(false);
					this.onload = null;
				}

				return;

			}


			var type = this.url.split('/').pop().split('.').pop();
			if (type === 'js') {

				_fs.readFile(file, 'utf8', function(err, raw) {

					if (err) {

						that.buffer = null;

						if (that.onload instanceof Function) {
							that.onload(false);
							that.onload = null;
						}

					} else {

						__filename = that.url;

						if (require.cache[file] !== undefined) {
							delete require.cache[file];
						}

						require(file);

						__filename = null;


						that.buffer = raw.toString();

						if (that.onload instanceof Function) {
							that.onload(true);
							that.onload = null;
						}

					}

				});

			} else if (type === 'css') {

				// CSS files can't fail and can't influence the NodeJS application
				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

			} else {

				_fs.readFile(file, 'utf8', function(err, raw) {

					if (err) {

						that.buffer = null;

						if (that.onload instanceof Function) {
							that.onload(false);
							that.onload = null;
						}

					} else {

						that.buffer = raw.toString();

						if (that.onload instanceof Function) {
							that.onload(true);
							that.onload = null;
						}

					}

				});

			}

		}

	};



	/*
	 * REQUIRED POLYFILLS
	 */


	var _keypress = function(stream) {

		if (_keypress.isEmitting(stream) === true) {
			return;
		} else {
			stream._emitKeypress = true;
		}


		function _onData(data) {
			if (stream.listeners('keypress').length > 0) {
				_keypress.emitKeypress(stream, data);
			}
		}

		function _onNewListener(event) {
			if (event === 'keypress') {
				stream.on('data', _onData);
				stream.removeListener('newListener', _onNewListener);
			}
		}


		stream.on('newListener', _onNewListener);

	};


	_keypress.METAKEYCODE     = /^(?:\x1b)([a-zA-Z0-9])$/;
	_keypress.FUNCTIONKEYCODE = /^(?:\x1b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?([~^$])|(?:1;)?(\d+)?([a-zA-Z]))/;


	_keypress.isEmitting = function(stream) {

		var found = stream._emitKeypress || false;
		if (found === false) {

			stream.listeners('data').forEach(function(listener) {
				if (listener.name === 'onData' && /emitKey/.test(listener.toString())) {
					found = true;
					stream._emitKeypress = true;
				}
			});

		}

		if (found === false) {
			stream.listeners('newListener').forEach(function(listener) {
				if (listener.name === 'onNewListener' && /keypress/.test(listener.toString())) {
					found = true;
					stream._emitKeypress = true;
				}
			});
		}


		return found;

	};

	_keypress.emitKeypress = function(stream, str) {

		var ch;
		var parts;


		if (Buffer.isBuffer(str)) {

			if (str[0] > 127 && str[1] === undefined) {
				str[0] -= 128;
				str = '\x1b' + str.toString(stream.encoding || 'utf-8');
			} else {
				str = str.toString(stream.encoding || 'utf-8');
			}

		}


		var key = {
			name: undefined,
			sequence: str,
			ctrl: false,
			meta: false,
			shift: false
		};


		// Return
		if (str === '\r' || str === '\n') {
			key.name = 'return';

		// Tab
		} else if (str === '\t') {
			key.name = 'tab';

		// Backspace or Ctrl + H
		} else if (str === '\b' || str === '\x7f' || str === '\x1b\b' || str === '\x1b\x7f') {

			key.name = 'backspace';
			key.meta = (str.charAt(0) === '\x1b');

		// Escape
		} else if (str === '\x1b' || str === '\x1b\x1b') {

			key.name = 'escape';
			key.meta = (str.length === 2);

		// Space
		} else if (str === ' ' || str === '\x1b ') {

			key.name = 'space';
			key.meta = (str.length === 2);

		// Ctrl + Letter
		} else if (str <= '\x1a') {

			key.name = String.fromCharCode(str.charCodeAt(0) + 'a'.charCodeAt(0) - 1);
			key.ctrl = true;

		// Letter
		} else if (str.length === 1 && str >= 'a' && str <= 'z') {

			key.name = str;

		// Shift + Letter
		} else if (str.length === 1 && str >= 'A' && str <= 'Z') {

			// was: key.name = str.toLowerCase();
			key.name = str;
			key.shift = true;

		// Meta + Letter
		} else if (parts = _keypress.METAKEYCODE.exec(str)) {

			key.name = parts[1].toLowerCase();
			key.meta = true;
			key.shift = /^[A-Z]$/.test(parts[1]);

		// Function Key (ANSI ESCAPE SEQUENCE)
		} else if (parts = _keypress.FUNCTIONKEYCODE.exec(str)) {

			var code = (parts[1] || '') + (parts[2] || '') + (parts[4] || '') + (parts[6] || '');
			var mod  = (parts[3] || parts[5] || 1) - 1;

			key.ctrl = !!(mod & 4);
			key.meta = !!(mod & 10);
			key.shift = !!(mod & 1);


			// Parse the key itself
			switch (code) {

				/* xterm/gnome ESC O letter */
				case 'OP': key.name = 'f1'; break;
				case 'OQ': key.name = 'f2'; break;
				case 'OR': key.name = 'f3'; break;
				case 'OS': key.name = 'f4'; break;

				/* xterm/rxvt ESC [ number ~ */
				case '[11~': key.name = 'f1'; break;
				case '[12~': key.name = 'f2'; break;
				case '[13~': key.name = 'f3'; break;
				case '[14~': key.name = 'f4'; break;

				/* from Cygwin and used in libuv */
				case '[[A': key.name = 'f1'; break;
				case '[[B': key.name = 'f2'; break;
				case '[[C': key.name = 'f3'; break;
				case '[[D': key.name = 'f4'; break;
				case '[[E': key.name = 'f5'; break;

				/* common */
				case '[15~': key.name = 'f5'; break;
				case '[17~': key.name = 'f6'; break;
				case '[18~': key.name = 'f7'; break;
				case '[19~': key.name = 'f8'; break;
				case '[20~': key.name = 'f9'; break;
				case '[21~': key.name = 'f10'; break;
				case '[23~': key.name = 'f11'; break;
				case '[24~': key.name = 'f12'; break;

				/* xterm ESC [ letter */
				case '[A': key.name = 'up'; break;
				case '[B': key.name = 'down'; break;
				case '[C': key.name = 'right'; break;
				case '[D': key.name = 'left'; break;
				case '[E': key.name = 'clear'; break;
				case '[F': key.name = 'end'; break;
				case '[H': key.name = 'home'; break;

				/* xterm/gnome ESC O letter */
				case 'OA': key.name = 'up'; break;
				case 'OB': key.name = 'down'; break;
				case 'OC': key.name = 'right'; break;
				case 'OD': key.name = 'left'; break;
				case 'OE': key.name = 'clear'; break;
				case 'OF': key.name = 'end'; break;
				case 'OH': key.name = 'home'; break;

				/* xterm/rxvt ESC [ number ~ */
				case '[1~': key.name = 'home'; break;
				case '[2~': key.name = 'insert'; break;
				case '[3~': key.name = 'delete'; break;
				case '[4~': key.name = 'end'; break;
				case '[5~': key.name = 'pageup'; break;
				case '[6~': key.name = 'pagedown'; break;

				/* putty */
				case '[[5~': key.name = 'pageup'; break;
				case '[[6~': key.name = 'pagedown'; break;

				/* rxvt */
				case '[7~': key.name = 'home'; break;
				case '[8~': key.name = 'end'; break;

				/* rxvt keys with modifiers */
				case '[a': key.name = 'up'; key.shift = true; break;
				case '[b': key.name = 'down'; key.shift = true; break;
				case '[c': key.name = 'right'; key.shift = true; break;
				case '[d': key.name = 'left'; key.shift = true; break;
				case '[e': key.name = 'clear'; key.shift = true; break;

				case '[2$': key.name = 'insert'; key.shift = true; break;
				case '[3$': key.name = 'delete'; key.shift = true; break;
				case '[5$': key.name = 'pageup'; key.shift = true; break;
				case '[6$': key.name = 'pagedown'; key.shift = true; break;
				case '[7$': key.name = 'home'; key.shift = true; break;
				case '[8$': key.name = 'end'; key.shift = true; break;

				case 'Oa': key.name = 'up'; key.ctrl = true; break;
				case 'Ob': key.name = 'down'; key.ctrl = true; break;
				case 'Oc': key.name = 'right'; key.ctrl = true; break;
				case 'Od': key.name = 'left'; key.ctrl = true; break;
				case 'Oe': key.name = 'clear'; key.ctrl = true; break;

				case '[2^': key.name = 'insert'; key.ctrl = true; break;
				case '[3^': key.name = 'delete'; key.ctrl = true; break;
				case '[5^': key.name = 'pageup'; key.ctrl = true; break;
				case '[6^': key.name = 'pagedown'; key.ctrl = true; break;
				case '[7^': key.name = 'home'; key.ctrl = true; break;
				case '[8^': key.name = 'end'; key.ctrl = true; break;

				/* misc. */
				case '[Z': key.name = 'tab'; key.shift = true; break;
				default: key.name = undefined; break;

			}

		// Copy and Paste action was done
		} else if (str.length > 1 && str[0] !== '\x1b') {

			Array.prototype.forEach.call(str, function(character) {
				_keypress.emitKeypress(stream, character);
			});

			return;

		}


		if (str.length === 1) {
			ch = str;
		}


		if (key.name !== undefined || ch) {
			stream.emit('keypress', ch, key);
		}

	};



	/*
	 * EXPORTS
	 */

	// global.Buffer  = Buffer; // Not necessary, NodeJS data type
	global.Config  = Config;
	global.Font    = Font;
	global.Music   = Music;
	global.Sound   = Sound;
	global.Texture = Texture;

	lychee.Environment.setAssetType('json', Config);
	lychee.Environment.setAssetType('fnt',  Font);
	lychee.Environment.setAssetType('msc',  Music);
	lychee.Environment.setAssetType('snd',  Sound);
	lychee.Environment.setAssetType('png',  Texture);
	lychee.Environment.setAssetType('*',    _Wildcard);


	Object.defineProperty(lychee.Environment, '__FILENAME', {

		get: function() {

			if (__filename !== null) {
				return __filename;
			}

			return null;

		},

		set: function() {
			return false;
		}

	});


	module.exports = function(root) {

		_keypress(process.stdin);

		if (typeof root === 'string') {
			_root = root;
		}


		return lychee;

	};

})(lychee, global);

