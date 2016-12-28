
lychee.define('lychee.ai.qnn.Brain').exports(function(lychee, global, attachments) {

	const _MOMENTUM      = 0.3;
	const _LEARNING_RATE = 0.3;



	/*
	 * HELPERS
	 */

	const _init_network = function() {

		let input_size = this.__sensors_map.reduce(function(a, b) {
			return a + b;
		}, 0);

		let output_size = this.__controls_map.reduce(function(a, b) {
			return a + b;
		}, 0);


		let hidden_size = 1;

		if (input_size > output_size) {
			hidden_size = input_size;
		} else {
			hidden_size = output_size;
		}


		let layer_amount = 6;

		for (let l = 0; l < layer_amount; l++) {

			let prev = hidden_size;
			let size = hidden_size;

			if (l === 0) {
				prev = 0;
				size = input_size;
			} else if (l === 1) {
				prev = input_size;
				size = hidden_size;
			} else if (l === layer_amount - 1) {
				prev = hidden_size;
				size = output_size;
			}


			let layer = new Array(size);

			for (let n = 0, nl = layer.length; n < nl; n++) {

				let neuron = {
					bias:    (Math.random() * 0.4 - 0.2),
					change:  0.0,
					delta:   0.0,
					weights: [],
					output:  0.5
				};

				for (let p = 0; p < prev; p++) {
					neuron.weights.push(Math.random() * 0.4 - 0.2);
				}

				layer[n] = neuron;

			}

			this.__layers[l] = layer;

		}

	};

	const _train_network = function(inputs, outputs) {

		let ll = this.__layers.length;

		for (let l = ll - 1; l >= 0; l--) {

			let layer = this.__layers[l];

			for (let n = 0, nl = layer.length; n < nl; n++) {

				let neuron = layer[n];
				let value  = 0;

				if (l === ll - 1) {

					value = outputs[n] - neuron.output;

				} else {

					let others = this.__layers[l + 1];

					for (let o = 0, ol = others.length; o < ol; o++) {

						let other = others[o];

						value += other.delta * other.weights[n];

					}

				}

				neuron.delta = value * neuron.output * (1 - neuron.output);

			}

		}


		for (let l = 1; l < ll; l++) {

			let layer = this.__layers[l];
			let prev  = this.__layers[l - 1];

			for (let n = 0, nl = layer.length; n < nl; n++) {

				let neuron = layer[n];
				let delta  = neuron.delta;

				for (let p = 0, pl = prev.length; p < pl; p++) {

					let change = (_LEARNING_RATE * delta * prev[p].output) + (_MOMENTUM * neuron.change);

					neuron.change      = change;
					neuron.weights[p] += change;

				}

				neuron.bias += (_LEARNING_RATE * delta);

			}

		}

	};

	const _sigmoid = function(value) {

		return (1 / (1 + Math.exp(-1 * value)));

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.controls = [];
		this.sensors  = [];

		this.__controls_map = [];
		this.__layers       = [];
		this.__sensors_map  = [];


		this.setSensors(settings.sensors);
		this.setControls(settings.controls);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.controls.length > 0) settings.controls = lychee.serialize(this.controls);
			if (this.sensors.length > 0)  settings.sensors  = lychee.serialize(this.sensors);


			// TODO: Brain serialization
			// in form of Genome (for qnn.Agent mutate / crossover)


			return {
				'constructor': 'lychee.ai.qnn.Brain',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		update: function(clock, delta) {

			let controls     = this.controls;
			let controls_map = this.__controls_map;
			let sensors      = this.sensors;
			let training     = {
				inputs:  null,
				outputs: null
			};


			let inputs = [];

			for (let s = 0, sl = sensors.length; s < sl; s++) {

				let sensor = sensors[s];
				let values = sensor.sensor();

				inputs.push.apply(inputs, values);

			}

			training.inputs = inputs;


			let outputs = [];

			for (let l = 0, ll = this.__layers.length; l < ll; l++) {

				let layer = this.__layers[l];

				if (l > 0 && layer.length > 0) {
					inputs  = outputs;
					outputs = [];
				}

				for (let n = 0, nl = layer.length; n < nl; n++) {

					let count  = 0;
					let neuron = layer[n];
					let value  = neuron.bias;

					let wl = neuron.weights.length;

					for (let w = 0; w < wl; w++) {
						value += neuron.weights[w] * inputs[count++];
					}

					neuron.output = _sigmoid(value);


					outputs.push(neuron.output);

				}

			}

			training.outputs = outputs;


			let offset = 0;

			for (let c = 0, cl = controls_map.length; c < cl; c++) {

				let control = controls[c];
				let length  = controls_map[c];
				let values  = [].slice.call(outputs, offset, length);

				if (values.length > 0) {
					control.control(values);
				}

				offset += length;

			}


			return training;

		},



		/*
		 * CUSTOM API
		 */

		train: function(training) {

			training = training instanceof Object ? training : null;


			if (training !== null) {

				let iterations = training.iterations || (1 / _LEARNING_RATE) * 30;
				let inputs     = training.inputs     || null;
				let outputs    = training.outputs    || null;


				if (inputs !== null && outputs !== null) {

					for (let i = 0; i < iterations; i++) {
						_train_network.call(this, inputs, outputs);
					}


					return true;

				}

			}


			return false;

		},

		setControls: function(controls) {

			controls = controls instanceof Array ? controls : null;


			if (controls !== null) {

				this.controls = controls;

				this.__controls_map = controls.map(function(control) {
					return (control.sensor() || [ 1 ]).length;
				});

				_init_network.call(this);


				return true;

			}


			return false;

		},

		setSensors: function(sensors) {

			sensors = sensors instanceof Array ? sensors : null;


			if (sensors !== null) {

				this.sensors = sensors;

				this.__sensors_map = sensors.map(function(sensor) {
					return (sensor.sensor() || [ 1 ]).length;
				});

				_init_network.call(this);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

