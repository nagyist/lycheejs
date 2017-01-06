
lychee.define('lychee.ai.Agent').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _validate_brain = function(brain) {

		if (brain instanceof Object) {

			if (typeof brain.update === 'function' && typeof brain.setControls === 'function' && typeof brain.setSensors === 'function') {

				return true;

			}

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.brain   = null;
		this.fitness = 0;

		this.__training  = null;
		this.__trainings = [];


		this.setBrain(settings.brain);
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

			if (blob.trainings instanceof Array) {
				this.__trainings = blob.trainings.map(lychee.deserialize);
			}

		},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.fitness !== 0) settings.fitness = this.fitness;


			if (this.brain !== null)         blob.brain     = lychee.serialize(this.brain);
			if (this.__trainings.length > 0) blob.trainings = this.__trainings.map(lychee.serialize);


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

		setFitness: function(fitness) {

			fitness = typeof fitness === 'number' ? (fitness | 0) : null;


			if (fitness !== null) {

				this.fitness = fitness;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

