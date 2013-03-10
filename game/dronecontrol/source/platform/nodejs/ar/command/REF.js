
lychee.define('game.ar.command.REF').exports(function(lychee, game, global, attachments) {

	var Class = function(flying, emergency) {

		this.flying    = false;
		this.emergency = false;


		this.set(flying, emergency);

	};

	Class.prototype = {

		set: function(flying, emergency) {
			this.flying    = flying === true;
			this.emergency = emergency === true;
		},

		setEmergency: function(value) {
			this.emergency = value === true;
		},

		setFlying: function(value) {
			this.flying = value === true;
		},

		toString: function(sequence) {

			if (typeof sequence !== 'number') {
				sequence = 1;
			}


			var value = (this.flying << 9) | (this.emergency << 8);

			var str = 'AT*REF=';

			str += sequence + ',';
			str += value    + '';

			str += '\r';


			return str;

		}

	};


	return Class;

});

