
lychee.define('lychee.ai.Agent').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _update_brain = function() {

		let controls = this.controls;
		let sensors  = this.sensors;
		let entity   = this.entity;


		for (let s = 0, sl = sensors.length; s < sl; s++) {
			sensors[s].entity = entity;
		}

		for (let c = 0, cl = controls.length; c < cl; c++) {
			controls[c].entity = entity;
		}


		let brain = this.brain;
		if (brain !== null) {
			brain.setSensors(sensors);
			brain.setControls(controls);
		}

	};

	const _validate_brain = function(brain) {

		if (brain instanceof Object) {

			if (typeof brain.update === 'function' && typeof brain.setControls === 'function' && typeof brain.setSensors === 'function') {

				return true;

			}

		}


		return false;

	};

	const _validate_entity = function(entity) {

		if (entity instanceof Object) {
			return true;
		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.brain    = null;
		this.controls = [];
		this.entity   = null;
		this.fitness  = 0;
		this.sensors  = [];

		this.__training  = null;
		this.__trainings = [];


		// XXX: Must be in this exact order
		this.setBrain(settings.brain);
		this.setSensors(settings.sensors);
		this.setControls(settings.controls);

		this.setEntity(settings.entity);
		this.setFitness(settings.fitness);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let brain = lychee.deserialize(blob.brain);
			if (brain !== null) {
				this.setBrain(brain);
			}

			let entity = lychee.deserialize(blob.entity);
			if (entity !== null) {
				this.setEntity(entity);
			}


			if (blob.controls instanceof Array) {
				this.controls = blob.controls.map(lychee.deserialize);
			}

			if (blob.sensors instanceof Array) {
				this.sensors = blob.sensors.map(lychee.deserialize);
			}


			if (blob.trainings instanceof Array) {
				this.__trainings = blob.trainings.map(lychee.deserialize);
			}

		},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.fitness !== 0) settings.fitness = this.fitness;


			if (this.brain !== null)         blob.brain     = lychee.serialize(this.brain);
			if (this.controls.length > 0)    blob.controls  = this.controls.map(lychee.serialize);
			if (this.sensors.length > 0)     blob.sensors   = this.sensors.map(lychee.serialize);
			if (this.__trainings.length > 0) blob.trainings = this.__trainings.map(lychee.serialize);

			// XXX: Entity is not serialized, tracked by lychee.ai.Layer automatically
			// if (this.entity !== null)        blob.entity    = lychee.serialize(this.entity);


			return {
				'constructor': 'lychee.ai.Agent',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		update: function(clock, delta) {

			let brain = this.brain;
			if (brain !== null) {
				this.__training = brain.update(clock, delta);
			}

		},



		/*
		 * CUSTOM API
		 */

		crossover: function(agent) {

			agent = agent instanceof Composite ? agent : null;


			if (agent !== null) {

				// XXX: This is implemented by AI Agents

				let zw_agent = lychee.deserialize(lychee.serialize(this));
				let zz_agent = lychee.deserialize(lychee.serialize(agent));

				return [ zw_agent, zz_agent ];

			}


			return null;

		},

		reward: function(diff) {

			diff = typeof diff === 'number' ? Math.abs(diff | 0) : 1;


			this.fitness += diff;


			let training = this.__training;
			if (training !== null) {

				training.iterations = diff;
				this.__trainings.push(training);

				let brain = this.brain;
				if (brain !== null) {
					brain.train(training);
				}

			}

		},

		punish: function(diff) {

			diff = typeof diff === 'number' ? Math.abs(diff | 0) : 1;

			this.fitness -= diff;

		},

		setBrain: function(brain) {

			brain = _validate_brain(brain) === true ? brain : null;


			if (brain !== null) {

				this.brain = brain;

				return true;

			}


			return false;

		},

		setControls: function(controls) {

			controls = controls instanceof Array ? controls : null;


			if (controls !== null) {

				controls = controls.filter(function(control) {
					return control instanceof Object;
				});


				if (controls !== this.controls) {
					this.controls = controls;
					_update_brain.call(this);
				}


				return true;

			}


			return false;

		},

		setEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				if (entity !== this.entity) {

					this.entity = entity;
					_update_brain.call(this);

				}


				return true;

			}


			return false;

		},

		setFitness: function(fitness) {

			fitness = typeof fitness === 'number' ? (fitness | 0) : null;


			if (fitness !== null) {

				this.fitness = fitness;

				return true;

			}


			return false;

		},

		setSensors: function(sensors) {

			sensors = sensors instanceof Array ? sensors : null;


			if (sensors !== null) {

				sensors = sensors.filter(function(sensor) {
					return sensor instanceof Object;
				});


				if (sensors !== this.sensors) {
					this.sensors = sensors;
					_update_brain.call(this);
				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

