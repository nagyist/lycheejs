
lychee.define('lychee.physics.ParticleEmitter').requires([
	'lychee.physics.Particle'
]).exports(function(lychee, global) {

	var Class = function(data, graph) {

		var settings = lychee.extend({}, data);


		this.__graph = null;
		this.__particles = [];
		this.__position = { x: 0, y: 0, z: 0 };


		this.__cache = {
			position: { x: 0, y: 0, z: 0 },

			settings: {
				position: { x: 0, y: 0, z: 0 },
				velocity: { x: 0, y: 0, z: 0 },
				mass:  1
			}
		};


		this.__clock = null;
		this.__spawn = null;


		if (graph !== null) {
			this.__graph = graph;
		}


		this.setPosition(settings.position);


		settings = null;

	};


	Class.SPAWN = {

		linear: {

			interval: 1000,
			amount:   1,

			defaults: {
			},

			callback: function(spawn, delta, id) {

				this.spawn(spawn.amount, spawn.settings);

			},

			clear: function(spawn) {
			}

		}

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		sync: function(clock, delta) {

			this.__clock = clock;

			for (var p = 0, l = this.__particles.length; p < l; p++) {
				this.__particles[p].sync(clock, delta);
			}

		},

		update: function(clock, delta) {

			if (this.__clock === null) {
				this.sync(clock, delta);
			}


			if (
				this.__spawn !== null
				&& this.__graph !== null
				&& this.__spawn.amount !== null
			) {

				var data = this.__spawn;

				var curStep = Math.floor((clock - data.start) / data.delta);
				if (curStep > data.step) {
					data.step = curStep;
					data.callback.call(data.scope, data, clock - data.start, curStep);
				}

			}

		},

		getPosition: function() {
			return this.__position;
		},

		setPosition: function(position) {

			if (position instanceof Object) {

				this.__position.x = typeof position.x === 'number' ? position.x : this.__position.x;
				this.__position.y = typeof position.y === 'number' ? position.y : this.__position.y;
				this.__position.z = typeof position.z === 'number' ? position.z : this.__position.z;


				return true;

			}


			return false;

		},


		spawn: function(amount, data) {

			amount = typeof amount === 'number' ? amount : null;
			data   = data instanceof Object ? data : null;


			if (amount === null || data === null) return;


			var settings = this.__cache.settings;

			for (var a = 0; a < amount; a++) {

				if (data.position) {
					settings.position.x = data.position.x || this.__position.x;
					settings.position.y = data.position.y || this.__position.y;
					settings.position.z = data.position.z || this.__position.z;
				} else {
					settings.position.x = this.__position.x;
					settings.position.y = this.__position.y;
					settings.position.z = this.__position.z;
				}


				if (data.velocity && data.velocity.x instanceof Array) {
					settings.velocity.x = (data.velocity.x[0] + Math.random() * (data.velocity.x[1] - data.velocity.x[0])) | 0;
					settings.velocity.y = (data.velocity.y[0] + Math.random() * (data.velocity.y[1] - data.velocity.y[0])) | 0;
					settings.velocity.z = (data.velocity.z[0] + Math.random() * (data.velocity.z[1] - data.velocity.z[0])) | 0;
				} else if (data.velocity) {
					settings.velocity.x = data.velocity.x || 0;
					settings.velocity.y = data.velocity.y || 0;
					settings.velocity.z = data.velocity.z || 0;
				} else {
					settings.velocity.x = 0;
					settings.velocity.y = 0;
					settings.velocity.z = 0;
				}


				if (data.mass instanceof Array) {
					settings.mass = data.mass[0] + Math.random() * (data.mass[1] - data.mass[0]);
				} else {
					settings.mass = data.mass || 1;
				}


				var particle = new lychee.physics.Particle(settings);

				this.__graph.add(particle);

			}

		},

		setSpawn: function(delta, amount, data, settings, scope) {

			delta = typeof delta === 'number' ? delta : (data.delta ? data.delta : null);
			amount   = typeof amount === 'number' ? amount : (data.amount ? data.amount : null);
			settings = settings instanceof Array ? settings : null;
			scope    = scope !== undefined ? scope : this;


			var spawn = null;
			if (
				delta !== null
				&& data instanceof Object
				&& data.callback instanceof Function
			) {

				spawn = {
					start: this.__clock,
					delta: delta,
					step: 0,
					amount: amount,
					callback: data.callback,
					clear: data.clear || null,
					scope: scope
				};


				if (data.defaults instanceof Object) {
					spawn.settings = lychee.extend({}, data.defaults, settings);
				} else {
					spawn.settings = settings;
				}

			}


			if (spawn !== null) {
				this.__spawn = spawn;
			}

		}

	};


	return Class;

});

