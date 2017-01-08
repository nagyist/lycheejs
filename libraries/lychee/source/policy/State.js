
lychee.define('lychee.policy.State').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = lychee.assignsafe({
			entity: null,
			limit:  [ 'default', 'active' ]
		}, data);


		this.entity = settings.entity || null;
		this.limit  = settings.limit;

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {
				entity: null,
				limit:  this.limit.slice(0)
			};


			return {
				'constructor': 'lychee.policy.State',
				'arguments':   [ settings ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let limit  = this.limit;
			let values = [ 0.5 ];


			if (entity !== null) {

				let index = limit.indexOf(entity.state);
				if (index !== -1) {
					values[0] = (index / limit.length);
				}

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;


			if (entity !== null) {

				let index = (values[0] * limit.length) | 0;
				if (index >= 0) {

					if (typeof entity.setState === 'function') {
						entity.setState(limit[index]);
					}

				}

			}

		}

	};


	return Composite;

});

