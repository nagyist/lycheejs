
lychee.define('lychee.game.Entity').exports(function(lychee, global) {

	/*
	 * IMPLEMENTATION
	 */

	var _default_state  = 'default';
	var _default_states = { 'default': null };

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.width  = typeof settings.width  === 'number' ? settings.width  : 0;
		this.height = typeof settings.height === 'number' ? settings.height : 0;
		this.depth  = typeof settings.depth  === 'number' ? settings.depth  : 0;
		this.radius = typeof settings.radius === 'number' ? settings.radius : 0;

		this.collision = Class.COLLISION.none;
		this.shape     = Class.SHAPE.rectangle;
		this.state     = _default_state;
		this.position  = { x: 0, y: 0, z: 0 };
		this.velocity  = { x: 0, y: 0, z: 0 };

		this.__states  = _default_states;
		this.__tween   = {
			active:       false,
			type:         Class.TWEEN.linear,
			start:        null,
			duration:     0,
			fromposition: { x: 0, y: 0, z: 0 },
			toposition:   { x: 0, y: 0, z: 0 }
		};


		if (settings.states instanceof Object) {

			this.__states = { 'default': null };

			for (var id in settings.states) {

				if (settings.states.hasOwnProperty(id)) {
					this.__states[id] = settings.states[id];
				}

			}

		}


		// Reuse this cache for performance relevant methods
		this.__cache = {
			tween:    { x: 0, y: 0, z: 0 },
			velocity: { x: 0, y: 0, z: 0 }
		};


		this.setCollision(settings.collision);
		this.setShape(settings.shape);
		this.setState(settings.state);
		this.setPosition(settings.position);
		this.setTween(settings.tween);
		this.setVelocity(settings.velocity);

		settings = null;

	};


	Class.COLLISION = {
		none: 0,
		A:    1,
		B:    2,
		C:    3,
		D:    4
	};


	// Same ENUM values as lychee.ui.Entity
	Class.SHAPE = {
		circle:    0,
		sphere:    1,
		rectangle: 2,
		cuboid:    3,
		polygon:   4
	};


	Class.TWEEN = {
		linear:        0,
		easein:        1,
		easeout:       2,
		bounceeasein:  3,
		bounceeaseout: 4
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (this.width  !== 0) settings.width  = this.width;
			if (this.height !== 0) settings.height = this.height;
			if (this.depth  !== 0) settings.depth  = this.depth;
			if (this.radius !== 0) settings.radius = this.radius;

			if (this.collision !== Class.COLLISION.none)  settings.collision = this.collision;
			if (this.shape     !== Class.SHAPE.rectangle) settings.shape     = this.shape;
			if (this.state     !== _default_state)        settings.state     = this.state;
			if (this.__states !== _default_states)        settings.states    = this.__states;


			if (this.position.x !== 0 || this.position.y !== 0 || this.position.z !== 0) {

				settings.position = {};

				if (this.position.x !== 0) settings.position.x = this.position.x;
				if (this.position.y !== 0) settings.position.y = this.position.y;
				if (this.position.z !== 0) settings.position.z = this.position.z;

			}


			if (this.velocity.x !== 0 || this.velocity.y !== 0 || this.velocity.z !== 0) {

				settings.velocity = {};

				if (this.velocity.x !== 0) settings.velocity.x = this.velocity.x;
				if (this.velocity.y !== 0) settings.velocity.y = this.velocity.y;
				if (this.velocity.z !== 0) settings.velocity.z = this.velocity.z;

			}


			return {
				'constructor': 'lychee.game.Entity',
				'arguments':   [ settings ]
			};

		},

		// HINT: Renderer skips if no render() method exists
		// render: function(renderer, offsetX, offsetY) {},

		update: function(clock, delta) {

			// 1. Sync clocks initially
			// (if Entity was created before loop started)
			if (this.__tween.active === true && this.__tween.start === null) {
				this.__tween.start = clock;
			}


			var cache;


			var tween = this.__tween;

			// 2. Tweening
			if (tween.active === true) {

				var t = (clock - tween.start) / tween.duration;
				if (t <= 1) {

					var type = tween.type;
					var from = tween.fromposition;
					var to   = tween.toposition;

					var f  = 0;
					var dx = to.x - from.x;
					var dy = to.y - from.y;
					var dz = to.z - from.z;


					cache = this.__cache.tween;


					if (type === Class.TWEEN.linear) {

						cache.x = from.x + t * dx;
						cache.y = from.y + t * dy;
						cache.z = from.z + t * dz;

					} else if (type === Class.TWEEN.easein) {

						f = 1 * Math.pow(t, 3);

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;
						cache.z = from.z + f * dz;

					} else if (type === Class.TWEEN.easeout) {

						f = Math.pow(t - 1, 3) + 1;

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;
						cache.z = from.z + f * dz;

					} else if (type === Class.TWEEN.bounceeasein) {

						var k = 1 - t;

						if ((k /= 1) < ( 1 / 2.75 )) {
							f = 1 * ( 7.5625 * Math.pow(k, 2) );
						} else if (k < ( 2 / 2.75 )) {
							f = 7.5625 * ( k -= ( 1.5   / 2.75 )) * k + 0.75;
						} else if (k < ( 2.5 / 2.75 )) {
							f = 7.5625 * ( k -= ( 2.25  / 2.75 )) * k + 0.9375;
						} else {
							f = 7.5625 * ( k -= ( 2.625 / 2.75 )) * k + 0.984375;
						}

						cache.x = from.x + (1 - f) * dx;
						cache.y = from.y + (1 - f) * dy;
						cache.z = from.z + (1 - f) * dz;

					} else if (type === Class.TWEEN.bounceeaseout) {

						if ((t /= 1) < ( 1 / 2.75 )) {
							f = 1 * ( 7.5625 * Math.pow(t, 2) );
						} else if (t < ( 2 / 2.75 )) {
							f = 7.5625 * ( t -= ( 1.5   / 2.75 )) * t + 0.75;
						} else if (t < ( 2.5 / 2.75 )) {
							f = 7.5625 * ( t -= ( 2.25  / 2.75 )) * t + 0.9375;
						} else {
							f = 7.5625 * ( t -= ( 2.625 / 2.75 )) * t + 0.984375;
						}

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;
						cache.z = from.z + f * dz;

					}


					this.setPosition(cache);

				} else {

					this.setPosition(tween.toposition);
					tween.active = false;

				}

			}


			var velocity = this.velocity;

			// 3. Velocity
			if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0) {

				cache = this.__cache.velocity;


				cache.x = this.position.x;
				cache.y = this.position.y;
				cache.z = this.position.z;


				var vt = delta / 1000;

				if (velocity.x !== 0) {
					cache.x += velocity.x * vt;
				}

				if (velocity.y !== 0) {
					cache.y += velocity.y * vt;
				}

				if (velocity.z !== 0) {
					cache.z += velocity.z * vt;
				}


				this.setPosition(cache);

			}

		},



		/*
		 * CUSTOM API
		 */

		isAtPosition: function(position) {

			if (position instanceof Object) {

				if (typeof position.x === 'number' && typeof position.y === 'number') {

					var ax = position.x;
					var ay = position.y;
					var bx = this.position.x;
					var by = this.position.y;


					var shape = this.shape;
					if (shape === Class.SHAPE.circle) {

						var dist = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
						if (dist < this.radius) {
							return true;
						}

					} else if (shape === Class.SHAPE.rectangle) {

						var hwidth  = this.width  / 2;
						var hheight = this.height / 2;
						var colX    = (ax >= bx - hwidth)  && (ax <= bx + hwidth);
						var colY    = (ay >= by - hheight) && (ay <= by + hheight);


						return colX && colY;

					}

				}

			}


			return false;

		},

		collidesWith: function(entity) {

			var none = Class.COLLISION.none;
			if (this.collision !== entity.collision || this.collision === none || entity.collision === none) {
				return false;
			}


			var shapeA = this.shape;
			var shapeB = entity.shape;
			var posA   = this.position;
			var posB   = entity.position;
			var colX   = false;
			var colY   = false;


			var radius  = 0;
			var hwidth  = 0;
			var hheight = 0;

			if (shapeA === Class.SHAPE.circle && shapeB === Class.SHAPE.circle) {

				if (Math.sqrt(Math.pow(posB.x - posA.x, 2) + Math.pow(posB.y - posA.y, 2)) <= (this.radius + entity.radius)) {
					return true;
				}

			} else if (shapeA === Class.SHAPE.circle && shapeB === Class.SHAPE.rectangle) {

				radius  = this.radius;
				hwidth  = entity.width  / 2;
				hheight = entity.height / 2;
				colX    = (posA.x + radius > posB.x - hwidth)  && (posA.x - radius < posB.x + hwidth);
				colY    = (posA.y + radius > posB.y - hheight) && (posA.y - radius < posB.y + hheight);

				return colX && colY;

			} else if (shapeA === Class.SHAPE.rectangle && shapeB === Class.SHAPE.circle) {

				radius  = entity.radius;
				hwidth  = this.width  / 2;
				hheight = this.height / 2;
				colX    = (posB.x + radius > posA.x - hwidth)  && (posB.x - radius < posA.x + hwidth);
				colY    = (posB.y + radius > posA.y - hheight) && (posB.y - radius < posA.y + hheight);

				return colX && colY;

			} else if (shapeA === Class.SHAPE.rectangle && shapeB === Class.SHAPE.rectangle) {

				hwidth  = Math.abs(posA.x - posB.x);
				hheight = Math.abs(posA.y - posB.y);
				colX    = hwidth  * 2 < (this.width  + entity.width);
				colY    = hheight * 2 < (this.height + entity.height);

				return colX && colY;

			}


			return false;

		},

		setCollision: function(collision) {

			if (lychee.enumof(Class.COLLISION, collision)) {

				this.collision = collision;

				return true;

			}


			return false;

		},

		setShape: function(shape) {

			if (lychee.enumof(Class.SHAPE, shape)) {

				this.shape = shape;

				return true;

			}


			return false;

		},

		getStateMap: function() {
			return this.__states[this.state];
		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__states[id] !== undefined) {

				this.state = id;

				return true;

			}


			return false;

		},

		setPosition: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;
				this.position.z = typeof position.z === 'number' ? position.z : this.position.z;

				return true;

			}


			return false;

		},

		setTween: function(settings) {

			settings = settings instanceof Object ? settings : null;


			if (settings !== null) {

				var tween = this.__tween;

				tween.type     = lychee.enumof(Class.TWEEN, settings.type) ? settings.type     : Class.TWEEN.linear;
				tween.duration = typeof settings.duration === 'number'     ? settings.duration : 1000;

				if (settings.position instanceof Object) {
					tween.toposition.x = typeof settings.position.x === 'number' ? settings.position.x : this.position.x;
					tween.toposition.y = typeof settings.position.y === 'number' ? settings.position.y : this.position.y;
					tween.toposition.z = typeof settings.position.z === 'number' ? settings.position.z : this.position.z;
				}

				tween.fromposition.x = this.position.x;
				tween.fromposition.y = this.position.y;
				tween.fromposition.z = this.position.z;

				tween.start  = null;
				tween.active = true;


				return true;

			}


			return false;

		},

		clearTween: function() {
			this.__tween.active = false;
		},

		setVelocity: function(velocity) {

			velocity = velocity instanceof Object ? velocity : null;


			if (velocity !== null) {

				this.velocity.x = typeof velocity.x === 'number' ? velocity.x : this.velocity.x;
				this.velocity.y = typeof velocity.y === 'number' ? velocity.y : this.velocity.y;
				this.velocity.z = typeof velocity.z === 'number' ? velocity.z : this.velocity.z;

				return true;

			}


			return false;

		}

	};


	return Class;

});

