
lychee.define('lychee.data.BENCODE').exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

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

		// bne, bfe, bte : null, false, true
		if (typeof data === 'boolean' || data === null) {

			if (data === null) {
				stream.writeRAW('bne');
			} else if (data === false) {
				stream.writeRAW('bfe');
			} else if (data === true) {
				stream.writeRAW('bte');
			}


		// i123e : Integer or Float (converted as Integer)
		} else if (typeof data === 'number') {

			var hi = (data / 0x80000000) << 0;
			var lo = (data % 0x80000000) << 0;

			stream.writeRAW('i');
			stream.writeRAW('' + (hi * 0x80000000 + lo).toString());
			stream.writeRAW('e');


		// <length>:<contents> : String
		} else if (typeof data === 'string') {

			stream.writeRAW(data.length + ':' + data);


		// l<contents>e : Array
		} else if (data instanceof Array) {

			stream.writeRAW('l');

			for (var d = 0, dl = data.length; d < dl; d++) {
				_encode(stream, data[d]);
			}

			stream.writeRAW('e');


		// d<contents>e : Object
		} else if (data instanceof Object && typeof data.serialize !== 'function') {

			stream.writeRAW('d');

			var keys = Object.keys(data).sort(function(a, b) {
				if (a < b) return -1;
				if (b > a) return  1;
				return 0;
			});

			for (var k = 0, kl = keys.length; k < kl; k++) {

				var key = keys[k];

				_encode(stream, key);
				_encode(stream, data[key]);

			}

			stream.writeRAW('e');


		// s<contents>e : Custom High-Level Implementation
		} else if (data instanceof Object && typeof data.serialize === 'function') {

			stream.writeRAW('s');

			var blob = lychee.serialize(data);

			_encode(stream, blob);

			stream.writeRAW('e');

		}

	};


	var _is_decodable_value = function(str) {

		var head = str.charAt(0);
		if (head.match(/([bilds]+)/g)) {
			return true;
		} else if (!isNaN(parseInt(head, 10))) {
			return true;
		}

		return false;

	};

	var _decode = function(stream) {

		var value  = undefined;
		var size   = 0;
		var tmp    = 0;
		var errors = 0;
		var check  = null;


		if (stream.pointer() < stream.length()) {

			var seek = stream.seekRAW(1);


			// bne, bfe, bte : null, false, true
			if (seek === 'b') {

				if (stream.seekRAW(3) === 'bne') {
					stream.readRAW(3);
					value = null;
				} else if (stream.seekRAW(3) === 'bfe') {
					stream.readRAW(3);
					value = false;
				} else if (stream.seekRAW(3) === 'bte') {
					stream.readRAW(3);
					value = true;
				}


			// i123e : Integer or Float (converted as Integer)
			} else if (seek === 'i') {

				stream.readRAW(1);

				size = stream.seek('e');

				if (size > 0) {

					tmp   = stream.readRAW(size);
					value = parseInt(tmp, 10);
					check = stream.readRAW(1);

				}


			// <length>:<contents> : String
			} else if (!isNaN(parseInt(seek, 10))) {

				size = stream.seek(':');

				if (size > 0) {

					size  = parseInt(stream.readRAW(size), 10);
					check = stream.readRAW(1);

					if (!isNaN(size) && check === ':') {
						value = stream.readRAW(size);
					}

				}


			// l<contents>e : Array
			} else if (seek === 'l') {

				value = [];


				stream.readRAW(1);

				while (errors === 0) {

					value.push(_decode(stream));

					check = stream.seekRAW(1);

					if (check === 'e') {
						break;
					} else if (_is_decodable_value(check) === false) {
						errors++;
					}

				}

				stream.readRAW(1);


			// d<contents>e : Object
			} else if (seek === 'd') {

				value = {};


				stream.readRAW(1);

				while (errors === 0) {

					var object_key   = _decode(stream);
					var object_value = _decode(stream);

					check = stream.seekRAW(1);

					value[object_key] = object_value;

					if (check === 'e') {
						break;
					} else if (isNaN(parseInt(check, 10))) {
						errors++;
					}

				}

				stream.readRAW(1);


			// s<contents>e : Custom High-Level Implementation
			} else if (seek === 's') {

				stream.readRAW(1);

				var blob = _decode(stream);

				value = lychee.deserialize(blob);
				check = stream.readRAW(1);

				if (check !== 'e') {
					value = undefined;
				}

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
				'reference': 'lychee.data.BENCODE',
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

