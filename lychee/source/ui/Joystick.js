
lychee.define('lychee.ui.Joystick').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _refresh = function() {

		var val = this.value;
		var map = this.__cursor.map;


		map.x = (val.x / 2) * (this.width  - 44);
		map.y = (val.y / 2) * (this.height - 44);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.value = { x: 0, y: 0 };

		this.__cursor = {
			active:   false,
			alpha:    0.0,
			duration: 600,
			start:    null,
			pingpong: false,
			map:      {
				x: 0,
				y: 0
			}
		};
		this.__pulse = {
			active:   false,
			duration: 300,
			start:    null,
			alpha:    0.0
		};


		this.setValue(settings.value);

		delete settings.value;


		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height : 128;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			var val = { x: 0, y: 0 };
			var qx  = Math.max(-0.5, Math.min(0.5, position.x / (this.width  - 44)));
			var qy  = Math.max(-0.5, Math.min(0.5, position.y / (this.height - 44)));

			val.x = qx * 2;
			val.y = qy * 2;


			var result = this.setValue(val);
			if (result === true) {
				this.trigger('change', [ val ]);
			}

		}, this);

		this.bind('swipe', function(id, state, position, delta, swipe) {

			var val = { x: 0, y: 0 };
			var qx  = Math.max(-0.5, Math.min(0.5, position.x / (this.width  - 44)));
			var qy  = Math.max(-0.5, Math.min(0.5, position.y / (this.height - 44)));

			val.x = qx * 2;
			val.y = qy * 2;


			var result = this.setValue(val);
			if (result === true) {
				this.trigger('change', [ val ]);
			}

		}, this);

		this.bind('key', function(key, name, delta) {

			var val = { x: this.value.x, y: this.value.y };

			if (key === 'arrow-left')  val.x = -1.0;
			if (key === 'arrow-right') val.x =  1.0;
			if (key === 'arrow-up')    val.y = -1.0;
			if (key === 'arrow-down')  val.y =  1.0;

			if (key === 'space') {
				val.x = 0;
				val.y = 0;
			}


			var result = this.setValue(val);
			if (result === true) {
				this.trigger('change', [ val ]);
			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lyche.ui.Joystick';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.value !== 0) settings.value = this.value;


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			var pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				var t = (clock - pulse.start) / pulse.duration;
				if (t <= 1) {
					pulse.alpha = (1 - t);
				} else {
					pulse.alpha  = 0.0;
					pulse.active = false;
				}

			}


			var cursor = this.__cursor;
			if (cursor.active === true) {

				if (cursor.start === null) {
					cursor.start = clock;
				}


				var t = (clock - cursor.start) / cursor.duration;
				if (t <= 1) {
					cursor.alpha = cursor.pingpong === true ? (1 - t) : t;
				} else {
					cursor.start    = clock;
					cursor.pingpong = !cursor.pingpong;
				}

			}


			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;
			var cursor   = this.__cursor;
			var x        = position.x + offsetX;
			var y        = position.y + offsetY;
			var hwidth   = (this.width  - 2) / 2;
			var hheight  = (this.height - 2) / 2;


			var col = this.state === 'active' ? '#32afe5' : '#545857';
			var map = cursor.map;
			var cx  = x + map.x;
			var cy  = y + map.y;


			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				col,
				false,
				2
			);

			renderer.drawBox(
				x - hwidth  + 9,
				y - hheight + 9,
				x + hwidth  - 9,
				y + hheight - 9,
				col,
				false,
				1
			);

			renderer.drawLine(
				x - hwidth  + 10,
				y,
				x + hwidth  - 10,
				y,
				col,
				false,
				1
			);

			renderer.drawLine(
				x,
				y - hheight + 10,
				x,
				y + hheight - 10,
				col,
				false,
				1
			);

			renderer.drawCircle(
				cx,
				cy,
				11,
				col,
				false,
				2
			);


			if (cursor.active === true) {

				renderer.setAlpha(cursor.alpha);

				renderer.drawCircle(
					cx,
					cy,
					12,
					'#32afe5',
					true
				);

				renderer.setAlpha(1.0);

			}


			var pulse = this.__pulse;
			if (pulse.active === true) {

				renderer.setAlpha(pulse.alpha);

				renderer.drawBox(
					x - hwidth,
					y - hheight,
					x + hwidth,
					y + hheight,
					'#32afe5',
					true
				);

				renderer.setAlpha(1.0);

			}

		},



		/*
		 * CUSTOM API
		 */

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var cursor = this.__cursor;
				var pulse  = this.__pulse;


				if (id === 'active') {

					cursor.start  = null;
					cursor.active = true;

					pulse.alpha   = 1.0;
					pulse.start   = null;
					pulse.active  = true;

				} else {

					cursor.active = false;

				}


				return true;

			}


			return false;

		},

		setValue: function(value) {

			if (value instanceof Object) {

				this.value.x = typeof value.x === 'number' ? value.x : this.value.x;
				this.value.y = typeof value.y === 'number' ? value.y : this.value.y;


				var val = 0;

				val = this.value.x;
				val = val >= -1.0 ? val : -1.0;
				val = val <=  1.0 ? val :  1.0;
				this.value.x = val;

				val = this.value.y;
				val = val >= -1.0 ? val : -1.0;
				val = val <=  1.0 ? val :  1.0;
				this.value.y = val;


				_refresh.call(this);

				return true;

			}


			return false;

		}

	};


	return Class;

});

