
lychee.define('lychee.policy.Sound').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = lychee.assignsafe({
			sound: null
		}, data);


		this.sound = settings.sound || null;

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {
				sound: null
			};


			return {
				'constructor': 'lychee.policy.Sound',
				'arguments':   [ settings ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let sound  = this.sound;
			let values = [ 0.5 ];


			if (sound !== null) {

				let is_idle = sound.isIdle;
				if (is_idle === true) {
					values[0] = 0;
				} else if (is_idle === false) {
					values[0] = 1;
				}

			}


			return values;

		},

		control: function(values) {

			let sound = this.sound;


			if (sound !== null) {

				let is_idle = sound.isIdle;
				if (is_idle === true && values[0] > 0.5) {
					sound.play();
				} else if (is_idle === false && values[0] < 0.5) {
					sound.stop();
				}

			}

		}

	};


	return Composite;

});

