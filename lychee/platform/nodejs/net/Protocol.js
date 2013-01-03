
lychee.define('lychee.net.Protocol').tags({
	platform: 'nodejs'
}).supports(function(lychee, global) {

	if (
		typeof global.Buffer !== 'undefined'
		&& typeof global.Buffer.byteLength === 'function'
	) {

		return true;

	}


	return false;

}).exports(function(lychee, global) {

	var Class = function(socket, maxFrameSize, closeCallback) {

		this.__socket          = socket;
		this.__maxFrameSize    = maxFrameSize;
		this.__closeCallback   = closeCallback;

		this.__buffer  = new Buffer(0);
		this.__offset  = 0;
		this.__moffset = 0;

		this.__op          = 0;
		this.__mode        = 0;
		this.__frameLength = 0;
		this.__closeCode   = 1000;

		this.__isClosed    = false;
		this.__isMasked    = false;

	};


	Class.VERSION = 13;


	Class.prototype = {

		isConnected: function() {
			return this.__isClosed === false;
		},

		read: function(data, callback, scope) {

			if (this.__isClosed === true) {
				return;
			} else if (data.length > this.__maxFrameSize) {
				this.__closeCode = 1009; // Frame too big
				return this.close(false);
			}


			var tmp = new Buffer(this.__buffer.length + data.length);

			this.__buffer.copy(tmp);
			data.copy(tmp, this.__buffer.length);

			this.__buffer = tmp;


			var l = this.__buffer.length;
			while (l > 0) {

				// Evaluate message frame
				var result = this.parse(l, callback, scope);
				if (result === false || this.__isClosed === true) {

					break;

				// Re-Size the buffer on message frame
				} else if (result === true) {

					l = this.__buffer.length - this.__offset;

					tmp = new Buffer(l);
					this.__buffer.copy(tmp, 0, this.__offset);
					this.__buffer = tmp;
					this.__offset = 0;

				}

			}

		},

		parse: function(length, callback, scope) {

			var bytes  = length - this.__offset;
			var buffer = this.__buffer;


			var data;

			if (this.__mode === 0 && bytes >= 1) {

				data       = buffer[this.__offset++];
				this.__op  = data & 15;
				data      &= 240;


				// Frame Check
				if (
					(data & 2) === 2
					|| (data & 4) === 4
					|| (data & 8) === 8
				) {

					this.__mode = -1;


				// Close Frame
				} else if (this.__op === 8) {

					this.__mode = -1;


				// Ping Frame
				} else if (this.__op === 9) {

					this.__mode = 1;


				// Pong Frame
				} else if (this.__op === 10) {

					this.__mode = 1;


				// TODO: Unused OP Codes
				} else if (
					this.__op !== 1
					&& this.__op !== 2
					&& this.__op !== 9
				) {

					this.__mode = -1;


				} else {

					this.__mode = 1;

				}

			} else if (this.__mode === 1 && bytes >= 1) {

				data = buffer[this.__offset++];

				this.__isMasked    = this.__op !== 10 ? true : false;
				// this.__isMasked    = this.__op !== 10 ? (data & 1) === 1 : false;
				this.__frameLength = data & 127;


				if (this.__frameLength <= 125) {

					this.__mode = this.__isMasked === true ? 4 : 5;

				} else if (this.__frameLength === 126) {

					this.__frameLength = 0;
					this.__mode        = 2;

				} else if (this.__frameLength === 127) {

					this.__frameLength = 0;
					this.__mode        = 3;

				} else {

					// Protocol Error
					this.__closeCode = 1002;
					this.__mode      = -1;

				}


			// Read 16 Bit Frame Length
			} else if (this.__mode === 2 && bytes >= 2) {

				this.__frameLength  = buffer[this.__offset + 1] + (buffer[this.__offset] << 8);
				this.__mode         = this.__isMasked === true ? 4 : 5;
				this.__offset      += 2;


			// Read 64 Bit Frame Length
			} else if (this.__mode === 3 && bytes >= 8) {

				var hi = (buffer[this.__offset + 0] << 24)
					   + (buffer[this.__offset + 1] << 16)
					   + (buffer[this.__offset + 2] <<  8)
					   +  buffer[this.__offset + 3];

				var lo = (buffer[this.__offset + 4] << 24)
					   + (buffer[this.__offset + 5] << 16)
					   + (buffer[this.__offset + 6] <<  8)
					   +  buffer[this.__offset + 7];


				this.__frameLength  = (hi * 4294967296) + lo;
				this.__mode         = this.__isMasked === true ? 4 : 5;
				this.__offset      += 8;


			// Read Frame Mask
			} else if (this.__mode === 4 && bytes >= 4) {

				this.__moffset  = this.__offset;
				this.__mode     = 5;
				this.__offset  += 4;


			// Read Frame Data
			} else if (this.__mode === 5 && bytes >= this.__frameLength) {

				var message;
				var isBinary = this.__op === 2;

				if (this.__frameLength > 0) {

					if (this.__isMasked === true) {

						var i = 0;
						while (i < this.__frameLength) {
							buffer[this.__offset + i] ^= buffer[this.__moffset + (i % 4)];
							i++;
						}

					}


					if (isBinary === true) {
						message = buffer.toString('binary', this.__offset, this.__offset + this.__frameLength);
					} else {
						message = buffer.toString('utf8',   this.__offset, this.__offset + this.__frameLength);
					}

				} else {
					message = '';
				}


				this.__mode           = 0;
				this.__offset        += this.__frameLength;


				// Ping
				if (this.__op === 9) {

					this.write(message, isBinary, false);


				// Message
				} else if (this.__op !== 10) {


					var result = callback.call(scope, message, isBinary);
					if (result === false) {
						this.__closeCode = 1003; // Unsupported Data
						this.close(false);
					}

				}


				return true;

			} else {

				return false;

			}


			if (this.__mode === -1) {
				this.close(true);
				return false;
			}

		},

		write: function(data, isBinary, isClose) {

			// TODO: Is this necessary?
			if (this.__socket.writable === false) {
				return this.close(true);
			}


			var enc    = isBinary === true ? 'binary' : 'utf8';
			var length = Buffer.byteLength(data, enc) + (isClose === true ? 2 : 0);
			var bytes  = 2;


			var buffer;


			// 64 Bit Data Frame
			if (length > 0xffff) {

				var lo = length | 0;
				var hi = (length - lo) / 4294967296;


				buffer = new Buffer(10 + length);
				buffer[1] = 127;

				buffer[2] = (hi >> 24) & 0xff;
				buffer[3] = (hi >> 16) & 0xff;
				buffer[4] = (hi >>  8) & 0xff;
				buffer[5] = (hi >>  0) & 0xff;

				buffer[6] = (lo >> 24) & 0xff;
				buffer[7] = (lo >> 16) & 0xff;
				buffer[8] = (lo >>  8) & 0xff;
				buffer[9] = (lo >>  0) & 0xff;


				bytes += 8;


			// 16 Bit Data Frame
			} else if (length > 125) {

				buffer = new Buffer(4 + length);
				buffer[1] = 126;

				buffer[2] = (length >>  8) & 0xff;
				buffer[3] = (length >>  0) & 0xff;


				bytes += 2;


			// 8 Bit Data Frame
			} else {

				buffer = new Buffer(2 + length);
				buffer[1] = length;

			}


			// Set OP and FIN
			buffer[0]  = 128 + (isClose === true ? 8 : (isBinary === true ? 2 : 1));
			buffer[1] &= ~128;


			if (isClose === true) {

				var code = String.fromCharCode((this.__closeCode >> 8) & 0xff)
						 + String.fromCharCode((this.__closeCode >> 0) & 0xff);


				buffer.write(code, bytes, 'binary');
				bytes += 2;

			}


			buffer.write(data, bytes, enc);

			this.__socket.write(buffer);

		},

		close: function(closedByRemote, reason) {

			if (this.__isClosed === false) {

				this.write(reason || 'Disconnect', false, true);

				this.__closeCode = null;
				this.__closeCallback(closedByRemote);

				return true;

			}


			return false;

		}

	};


	return Class;

});

