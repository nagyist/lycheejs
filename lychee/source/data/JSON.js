
lychee.define('lychee.data.JSON').exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _sanitize_string = function(str) {

		var san = str;

		san = san.replace(/\\/g, '\\\\');
		san = san.replace(/\n/g, '\\n');
		san = san.replace(/\t/g, '\\t');
		san = san.replace(/"/g,  '\\"');

		return san;

	};

	var _Stream = function(buffer, mode) {

		this.__buffer = typeof buffer === 'string' ? buffer : '';
		this.__mode   = typeof mode === 'number'   ? mode   : 0;

		this.__index  = 0;

	};


	_Stream.MODE = {
		read:  0,
		write: 1
	};


	_Stream.prototype = {

		toString: function() {
			return this.__buffer;
		},

		pointer: function() {
			return this.__index;
		},

		length: function() {
			return this.__buffer.length;
		},

		seek: function(array) {

			var bytes = Infinity;

			for (var a = 0, al = array.length; a < al; a++) {

				var token = array[a];
				var size  = this.__buffer.indexOf(token, this.__index + 1) - this.__index;
				if (size > -1 && size < bytes) {
					bytes = size;
				}

			}


			if (bytes === Infinity) {
				return 0;
			}


			return bytes;

		},

		seekRAW: function(bytes) {
			return this.__buffer.substr(this.__index, bytes);
		},

		readRAW: function(bytes) {

			var buffer = '';

			buffer       += this.__buffer.substr(this.__index, bytes);
			this.__index += bytes;

			return buffer;

		},

		writeRAW: function(buffer) {

			this.__buffer += buffer;
			this.__index  += buffer.length;

		}

	};



	/*
	 * ENCODER and DECODER
	 */

	var _encode = function(stream, data) {

		// null,false,true: Boolean or Null or EOS
		if (typeof data === 'boolean' || data === null) {

			if (data === null) {
				stream.writeRAW('null');
			} else if (data === false) {
				stream.writeRAW('false');
			} else if (data === true) {
				stream.writeRAW('true');
			}


		// 123,12.3: Integer or Float
		} else if (typeof data === 'number') {

			var type = 1;
			if (data < 268435456 && data !== (data | 0)) {
				type = 2;
			}


			// Negative value
			var sign = 0;
			if (data < 0) {
				data = -data;
				sign = 1;
			}


			if (sign === 1) {
				stream.writeRAW('-');
			}


			// TODO: Find a better way to serialize Numbers
			if (type === 1) {
				stream.writeRAW('' + data.toString());
			} else {
				stream.writeRAW('' + data.toString());
			}


		// "": String
		} else if (typeof data === 'string') {

			stream.writeRAW('"');

			stream.writeRAW(_sanitize_string(data));

			stream.writeRAW('"');


		// []: Array
		} else if (data instanceof Array) {

			stream.writeRAW('[');

			for (var d = 0, dl = data.length; d < dl; d++) {

				_encode(stream, data[d]);

				if (d < dl - 1) {
					stream.writeRAW(',');
				}

			}

			stream.writeRAW(']');


		// {}: Object
		} else if (data instanceof Object && typeof data.serialize !== 'function') {

			stream.writeRAW('{');

			var keys = Object.keys(data);

			for (var k = 0, kl = keys.length; k < kl; k++) {

				var key = keys[k];

				_encode(stream, key);
				stream.writeRAW(':');

				_encode(stream, data[key]);

				if (k < kl - 1) {
					stream.writeRAW(',');
				}

			}

			stream.writeRAW('}');


		// Custom High-Level Implementation
		} else if (data instanceof Object && typeof data.serialize === 'function') {

			stream.writeRAW('%');

			var blob = lychee.serialize(data);

			_encode(stream, blob);

			stream.writeRAW('%');

		}

	};


	var _decode = function(stream) {

		var value  = undefined;
		var size   = 0;
		var tmp    = 0;
		var errors = 0;
		var check  = null;


		if (stream.pointer() < stream.length()) {

			var seek = stream.seekRAW(1);


			// null,false,true: Boolean or Null or EOS
			if (seek === 'n' || seek === 'f' || seek === 't') {

				if (stream.seekRAW(4) === 'null') {
					stream.readRAW(4);
					value = null;
				} else if (stream.seekRAW(5) === 'false') {
					stream.readRAW(5);
					value = false;
				} else if (stream.seekRAW(4) === 'true') {
					stream.readRAW(4);
					value = true;
				}


			// 123: Number
			} else if (!isNaN(parseInt(seek, 10))) {

				size = stream.seek([ ',', ']', '}' ]);

				if (size > 0) {

					tmp = stream.readRAW(size);

					if (tmp.indexOf('.') !== -1) {
						value = parseFloat(tmp, 10);
					} else {
						value = parseInt(tmp, 10);
					}

				}

			// "": String
			} else if (seek === '"') {

				stream.readRAW(1);

				size = stream.seek([ '\\', '"' ]);

				if (size > 0) {
					value = stream.readRAW(size);
				} else {
					value = '';
				}


				check = stream.readRAW(1);


				while (check === '\\') {

					value[value.length - 1] = check;

					var special = stream.seekRAW(1);
					if (special === 'n') {

						stream.readRAW(1);
						value += '\n';

					} else if (special === 't') {

						stream.readRAW(1);
						value += '\t';

					}


					size   = stream.seek([ '\\', '"' ]);
					value += stream.readRAW(size);
					check  = stream.readRAW(1);

				}


			// []: Array
			} else if (seek === '[') {

				value = [];


				stream.readRAW(1);

				while (errors === 0) {

					value.push(_decode(stream));

					check = stream.seekRAW(1);

					if (check === ',') {
						stream.readRAW(1);
					} else if (check === ']') {
						break;
					} else {
						errors++;
					}

				}

				stream.readRAW(1);


			// {}: Object
			} else if (seek === '{') {

				value = {};


				stream.readRAW(1);

				while (errors === 0) {

					var object_key = _decode(stream);
					check = stream.readRAW(1);

					if (check !== ':') {
						errors++;
					}

					var object_value = _decode(stream);
					check = stream.seekRAW(1);


					value[object_key] = object_value;


					if (check === ',') {
						stream.readRAW(1);
					} else if (check === '}') {
						break;
					} else {
						errors++;
					}

				}

				stream.readRAW(1);

			// %%: Custom High-Level Implementation
			} else if (seek === '%') {

				stream.readRAW(1);

				var blob = _decode(stream);

				value = lychee.deserialize(blob);
				check = stream.readRAW(1);

				if (check !== '%') {
					value = undefined;
				}

			} else {

				// Invalid seek, assume it's a space character

				stream.readRAW(1);
				return _decode(stream);

			}

		}


		return value;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'lychee.data.JSON',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				var stream = new _Stream('', _Stream.MODE.write);

				_encode(stream, data);

				return stream.toString();

			}


			return null;

		},

		decode: function(data) {

			data = typeof data === 'string' ? data : null;


			if (data !== null) {

				var stream = new _Stream(data, _Stream.MODE.read);
				var object = _decode(stream);
				if (object !== undefined) {
					return object;
				}

			}


			return null;

		}

	};


	return Module;

});

