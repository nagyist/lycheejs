
lychee.define('game.ai.Agent').requires([
	'lychee.ai.bnn.Brain',
	'lychee.policy.Position',
	'game.policy.Control'
]).includes([
	'lychee.ai.Agent'
]).exports(function(lychee, global, attachments) {

	const _Agent    = lychee.import('lychee.ai.Agent');
	const _Control  = lychee.import('game.policy.Control');
	const _Position = lychee.import('lychee.policy.Position');
	const _Brain    = lychee.import('lychee.ai.bnn.Brain');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		let sensors  = [];
		let controls = [];


		let control = new _Control({
			entity: settings.plane,
			target: settings.goal
		});
		let plane = new _Position({
			entity: settings.plane,
			limit:  settings.limit
		});

		let goal  = new _Position({
			entity: settings.goal,
			limit:  settings.limit
		});


		sensors.push(plane);
		sensors.push(goal);
		controls.push(control);

		this.__expected = goal;
		this.__control  = control;


		settings.brain = new _Brain({
			sensors:  sensors,
			controls: controls
		});


		_Agent.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Agent.prototype.serialize.call(this);
			data['constructor'] = 'game.ai.Agent';

		},



		/*
		 * CUSTOM API
		 */

		reward: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;

			let training = {
				iterations: diff,
				inputs:     this.brain._inputs.slice(0),
				outputs:    this.__control.sensor()
			};

			return _Agent.prototype.reward.call(this, diff, training);

		},

		punish: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;


			let training = {
				iterations: diff,
				inputs:     this.brain._inputs.slice(0),
				outputs:    this.__control.sensor()
			};

			return _Agent.prototype.punish.call(this, diff, training);

		}

	};


	return Composite;

});

