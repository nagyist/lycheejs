
lychee.define('game.effect.Lightning').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _draw_strike = function(x1, y1, x2, y2, color1, color2) {

		let dx = x2 - x1;
		let dy = y2 - y1;

		let distance = Math.sqrt(dx * dx + dy * dy);
		let width    = distance / 10;

		let x = x1;
		let y = y1;

		for (let s = 0; s <= 10; s++) {

			let magnitude = (width * s) / distance;
			let x3        = magnitude * x2 + (1 - magnitude) * x1;
			let y3        = magnitude * y2 + (1 - magnitude) * y1;

			if (s !== 0 && s !== 10) {
				x3 += (Math.random() * width) - (width / 2);
				y3 += (Math.random() * width) - (width / 2);
			}

			this.drawLine(
				x,
				y,
				x3,
				y3,
				color1,
				12
			);

			this.drawCircle(
				x3,
				y3,
				6,
				color1,
				true
			);

			this.drawLine(
				x,
				y,
				x3,
				y3,
				color2,
				6
			);

			this.drawCircle(
				x3,
				y3,
				3,
				color2,
				true
			);


			x = x3;
			y = y3;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.type     = Composite.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.position = { x: null, y: null };

		this.__alpha  = 1;
		this.__clock  = null;
		this.__origin = { x: null, y: null, alpha: 1 };
		this.__start  = null;


		// No data validation garbage allowed for effects

		let type     = lychee.enumof(Composite.TYPE, settings.type) ? settings.type           : null;
		let delay    = typeof settings.delay === 'number'       ? (settings.delay | 0)    : null;
		let duration = typeof settings.duration === 'number'    ? (settings.duration | 0) : null;
		let position = settings.position instanceof Object      ? settings.position       : null;

		if (type !== null) {
			this.type = type;
		}

		if (delay !== null) {
			this.delay = delay;
		}

		if (duration !== null) {
			this.duration = duration;
		}

		if (position !== null) {
			this.position.x = typeof position.x === 'number' ? (position.x | 0) : null;
			this.position.y = typeof position.y === 'number' ? (position.y | 0) : null;
		}

	};


	Composite.TYPE = {
		linear:        0,
		easein:        1,
		easeout:       2,
		bounceeasein:  3,
		bounceeaseout: 4
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};


			if (this.type !== Composite.TYPE.easeout) settings.type     = this.type;
			if (this.delay !== 0)                     settings.delay    = this.delay;
			if (this.duration !== 250)                settings.duration = this.duration;


			if (this.position.x !== null || this.position.y !== null || this.position.z !== null) {

				settings.position = {};

				if (this.position.x !== null) settings.position.x = this.position.x;
				if (this.position.y !== null) settings.position.y = this.position.y;

			}


			return {
				'constructor': 'game.effect.Lightning',
				'arguments':   [ settings ]
			};

		},

		render: function(renderer, offsetX, offsetY) {

			let t = (this.__clock - this.__start) / this.duration;
			if (t > 0 && t <= 1) {

				let origin   = this.__origin;
				let position = this.position;

				let x1 = origin.x   + offsetX;
				let y1 = origin.y   + offsetY;
				let x2 = position.x + offsetX;
				let y2 = position.y + offsetY;


				renderer.setAlpha(this.__alpha);


				_draw_strike.call(
					renderer,
					x1,
					y1,
					x2,
					y2,
					'#557788',
					'#7799aa'
				);

				_draw_strike.call(
					renderer,
					x1,
					y1,
					x2,
					y2,
					'#cfefff',
					'#ffffff'
				);


				renderer.setAlpha(1.0);

			}

		},

		update: function(entity, clock, delta) {

			this.__clock = clock;


			if (this.__start === null) {
				this.__start = clock + this.delay;
			}


			let t = (clock - this.__start) / this.duration;
			if (t < 0) {

				return true;

			} else {

				this.__origin.alpha = 1;

				if (this.__origin.x === null) {
					this.__origin.x = entity.position.x;
				}

				if (this.__origin.y === null) {
					this.__origin.y = entity.position.y;
				}

			}


			let origin = this.__origin.alpha;
			let alpha  = 0;

			let a      = origin;

			if (t <= 1) {

				let f  = 0;
				let da = alpha - origin;


				let type = this.type;
				if (type === Composite.TYPE.linear) {

					a += t * da;

				} else if (type === Composite.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					a += f * da;

				} else if (type === Composite.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					a += f * da;

				} else if (type === Composite.TYPE.bounceeasein) {

					let k = 1 - t;

					if ((k /= 1) < (1 / 2.75)) {
						f = 1 * (7.5625 * Math.pow(k, 2));
					} else if (k < (2 / 2.75)) {
						f = 7.5625 * (k -= (1.5   / 2.75)) * k + 0.75;
					} else if (k < (2.5 / 2.75)) {
						f = 7.5625 * (k -= (2.25  / 2.75)) * k + 0.9375;
					} else {
						f = 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
					}

					a += (1 - f) * da;

				} else if (type === Composite.TYPE.bounceeaseout) {

					if ((t /= 1) < (1 / 2.75)) {
						f = 1 * (7.5625 * Math.pow(t, 2));
					} else if (t < (2 / 2.75)) {
						f = 7.5625 * (t -= (1.5   / 2.75)) * t + 0.75;
					} else if (t < (2.5 / 2.75)) {
						f = 7.5625 * (t -= (2.25  / 2.75)) * t + 0.9375;
					} else {
						f = 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
					}

					a += f * da;

				}

				this.__alpha = a;


				return true;

			} else {

				this.__alpha = 0;


				return false;

			}

		}

	};


	return Composite;

});

