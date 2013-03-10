
lychee.define('game.ar.command.PCMD').exports(function(lychee, game, global, attachments) {

	var _floatToString = function(sequence) {
		var buffer = new Buffer(4);
		buffer.writeFloatBE(sequence, 0);
		return -~parseInt(buffer.toString('hex'), 16) - 1;
	};


	var Class = function(roll, pitch, yaw, heave) {

		this.roll  = 0;
		this.pitch = 0;
		this.heave = 0;
		this.yaw   = 0;


		this.set(roll, pitch, yaw, heave);

	};


	Class.prototype = {

		set: function(roll, pitch, yaw, heave) {

			this.roll  = typeof roll === 'number'  ? roll  : 0;
			this.pitch = typeof pitch === 'number' ? pitch : 0;
			this.yaw   = typeof yaw === 'number'   ? yaw   : 0;
			this.heave = typeof heave === 'number' ? heave : 0;

		},

		toString: function(sequence) {

			if (typeof sequence !== 'number') {
				sequence = 1;
			}


			var flag = 0;
			if (
				this.roll !== 0
				|| this.pitch !== 0
				|| this.yaw !== 0
				|| this.heave !== 0
			) {
				flag = 1;
			}



			/*
			 * Pitch is inverted, because the sensor's
			 * top is actually the physical bottom side
			 * of the mainboard
			 */

			var str = 'AT*PCMD=';

			str += sequence + ',';
			str += flag     + ',';
			str += _floatToString(this.roll)   + ',';
			str += _floatToString(-this.pitch)  + ',';
			str += _floatToString(this.heave)  + ',';
			str += _floatToString(this.yaw);

			str += '\r';


			return str;

		}

	};


	return Class;

});

