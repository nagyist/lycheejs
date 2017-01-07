
lychee.define('lychee.policy.Position').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = lychee.assignsafe({
			entity: null,
			limit:  {
				x: Infinity,
				y: Infinity,
				z: Infinity
			}
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
				limit:  this.limit
			};


			return {
				'constructor': 'lychee.policy.Position',
				'arguments':   [ settings ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let limit  = this.limit;
			let values = [ 0.5, 0.5, 0.5 ];


			if (entity !== null) {

				let hlx = limit.x / 2;
				let hly = limit.y / 2;
				let hlz = limit.z / 2;

				values[0] = (hlx + entity.position.x) / (hlx * 2);
				values[1] = (hly + entity.position.y) / (hly * 2);
				values[2] = (hlz + entity.position.z) / (hlz * 2);

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;


			if (entity !== null) {

				let hlx = limit.x / 2;
				let hly = limit.y / 2;
				let hlz = limit.z / 2;

				entity.position.x = (values[0] * (hlx * 2)) - hlx;
				entity.position.y = (values[1] * (hly * 2)) - hly;
				entity.position.z = (values[2] * (hlz * 2)) - hlz;

			}

		}

	};


	return Composite;

});

