
lychee.define('lychee.ai.Layer').requires([
	'lychee.ai.Agent',
//	'lychee.ai.bnn.Agent',
	'lychee.ai.enn.Agent'
//	'lychee.ai.neat.Agent',
//	'lychee.ai.bneat.Agent',
//	'lychee.ai.hyperneat.Agent'
]).includes([
	'lychee.app.Layer'
]).exports(function(lychee, global, attachments) {

	const _Agent = lychee.import('lychee.ai.Agent');
	const _Layer = lychee.import('lychee.app.Layer');
	const _agent = {
		ENN:       lychee.import('lychee.ai.enn.Agent'),
		BNN:       lychee.import('lychee.ai.bnn.Agent'),
		NEAT:      lychee.import('lychee.ai.neat.Agent'),
		BNEAT:     lychee.import('lychee.ai.bneat.Agent'),
		HYPERNEAT: lychee.import('lychee.ai.hyperneat.Agent')
	};



	/*
	 * HELPERS
	 */

	const _create_agent = function() {

		let Agent = _Agent;
		let type  = this.type;
		if (type === Composite.TYPE.ENN) {
			Agent = _agent.ENN;
		} else if (type === Composite.TYPE.BNN) {
			Agent = _agent.BNN;
		} else if (type === Composite.TYPE.NEAT) {
			Agent = _agent.NEAT;
		} else if (type === Composite.TYPE.BNEAT) {
			Agent = _agent.BNEAT;
		} else if (type === Composite.TYPE.HYPERNEAT) {
			Agent = _agent.HYPERNEAT;
		}


		return new Agent();

	};

	const _initialize = function() {

		let controls   = this.controls;
		let entities   = this.entities;
		let sensors    = this.sensors;
		let population = this.__population;


		for (let e = 0, el = entities.length; e < el; e++) {

			let entity = entities[e];
			let agent  = _create_agent.call(this);

			agent.setSensors(sensors.map(function(sensor) {
				return lychee.deserialize(lychee.serialize(sensor));
			}));

			agent.setControls(controls.map(function(control) {
				return lychee.deserialize(lychee.serialize(control));
			}));

			agent.setEntity(entity);


			population.push(agent);

		}

	};

	const _epoche = function() {

		let entities      = this.entities;
		let oldcontrols   = [];
		let oldsensors    = [];
		let oldpopulation = this.__population;
		let newpopulation = [];
		let fitness       = this.__fitness;


		oldpopulation.sort(function(a, b) {
			if (a.fitness > b.fitness) return -1;
			if (a.fitness < b.fitness) return  1;
			return 0;
		});


		fitness.total   =  0;
		fitness.average =  0;
		fitness.best    = -Infinity;
		fitness.worst   =  Infinity;

		for (let op = 0, opl = oldpopulation.length; op < opl; op++) {

			let agent = oldpopulation[op];

			oldsensors.push(agent.sensors);
			oldcontrols.push(agent.controls);

			// XXX: Avoid updates of Brain
			agent.sensors  = [];
			agent.controls = [];
			agent.setEntity(null);

			fitness.total += agent.fitness;
			fitness.best   = Math.max(fitness.best,  agent.fitness);
			fitness.worst  = Math.min(fitness.worst, agent.fitness);

		}

		fitness.average = fitness.total / oldpopulation.length;


		let amount = Math.round(0.2 * oldpopulation.length);
		if (amount % 2 === 1) {
			amount++;
		}

		if (amount > 0) {

			// Survivor Population
			for (let a = 0; a < amount; a++) {
				newpopulation.push(oldpopulation[a]);
			}


			// Mutant Population
			for (let a = 0; a < amount; a++) {
				newpopulation.push(_create_agent.call(this));
			}


			// Breed Population
			let b     = 0;
			let count = 0;

			while (newpopulation.length < oldpopulation.length) {

				let agent_mum = oldpopulation[b];
				let agent_dad = oldpopulation[b + 1];
				let children  = agent_mum.crossover(agent_dad);

				if (children !== null) {

					let agent_sister  = children[0];
					let agent_brother = children[1];

					if (newpopulation.indexOf(agent_sister) === -1) {
						newpopulation.push(agent_sister);
					}

					if (newpopulation.indexOf(agent_brother) === -1) {
						newpopulation.push(agent_brother);
					}

				}


				b += 1;
				b %= amount;

				count += 1;


				// Fallback if there's no crossover() Implementation
				if (count > oldpopulation.length) {
					break;
				}

			}

		}


		if (newpopulation.length < oldpopulation.length) {

			if (lychee.debug === true) {
				console.warn('lychee.ai.Layer: Too less Agents for healthy Evolution');
			}


			let diff = oldpopulation.length - newpopulation.length;

			for (let o = 0; o < oldpopulation.length; o++) {

				if (newpopulation.indexOf(oldpopulation[o]) === -1) {
					newpopulation.push(oldpopulation[o]);
					diff--;
				}

				if (diff === 0) {
					break;
				}

			}

		}


		for (let np = 0, npl = newpopulation.length; np < npl; np++) {

			let agent  = newpopulation[np];
			let entity = entities[np];

			agent.sensors  = oldsensors[np];
			agent.controls = oldcontrols[np];

			agent.setEntity(entity);
			agent.setFitness(0);

			this.trigger('epoche', [ agent ]);

		}


		this.__population = newpopulation;

		oldpopulation = null;
		oldsensors    = null;
		oldcontrols   = null;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.lifetime = 30000;
		this.sensors  = [];
		this.controls = [];
		this.type     = Composite.TYPE.ENN;

		this.__fitness = {
			total:    0,
			average:  0,
			best:    -Infinity,
			worst:    Infinity
		};
		this.__population = [];
		this.__start      = null;


		this.setSensors(settings.sensors);
		this.setControls(settings.controls);
		this.setLifetime(settings.lifetime);

		delete settings.sensors;
		delete settings.controls;
		delete settings.lifetime;


		_Layer.call(this, settings);


		/*
		 * INITIALIZATION
		 */

		if (settings.type !== this.type) {
			this.setType(settings.type);
		} else {
			_initialize.call(this);
		}

		settings = null;

	};


	Composite.TYPE = {
		ENN:       0,
		BNN:       1,
		NEAT:      2,
		BNEAT:     3,
		HYPERNEAT: 4
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ai.Layer';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.sensors.length > 0)          settings.sensors  = this.sensors.map(lychee.serialize);
			if (this.controls.length > 0)         settings.controls = this.controls.map(lychee.serialize);
			if (this.lifetime !== 30000)          settings.lifetime = this.lifetime;
			if (this.type !== Composite.TYPE.ENN) settings.type     = this.type;


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			_Layer.prototype.update.call(this, clock, delta);


			if (this.__start === null) {
				this.__start = clock;
			}


			let population = this.__population;
			for (let p = 0, pl = population.length; p < pl; p++) {

				let agent = population[p];

				agent.update(clock, delta);
				this.trigger('update', [ agent ]);

			}


			let t = (clock - this.__start) / this.lifetime;
			if (t > 1) {

				_epoche.call(this);

				this.__start = clock;

			}

		},



		/*
		 * CUSTOM API
		 */

		setControls: function(controls) {

			controls = controls instanceof Array ? controls.unique() : null;


			if (controls !== null) {

				this.controls = controls.filter(function(control) {
					return control instanceof Object;
				});

				return true;

			}


			return false;

		},

		setLifetime: function(lifetime) {

			lifetime = typeof lifetime === 'number' ? (lifetime | 0) : null;


			if (lifetime !== null) {

				this.lifetime = lifetime;

				return true;

			}


			return false;

		},

		setSensors: function(sensors) {

			sensors = sensors instanceof Array ? sensors.unique() : null;


			if (sensors !== null) {

				this.sensors = sensors.filter(function(sensor) {
					return sensor instanceof Object;
				});

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				let oldtype = this.type;
				if (oldtype !== type) {

					this.type = type;

					_initialize.call(this);

					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

