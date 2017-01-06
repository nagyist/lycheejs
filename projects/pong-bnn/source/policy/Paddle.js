
lychee.define('game.policy.Paddle').exports(function(lychee, global, attachments) {

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
				'constructor': 'game.policy.Paddle',
				'arguments':   [ settings ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let limit  = this.limit;
			let values = [ 0.5, 0.5, 0.5, 0.5, 0.5, 0.5 ];


			if (entity !== null) {

				values[0] = entity.position.x / limit.x;
				values[1] = entity.position.y / limit.y;
				values[2] = entity.position.z / limit.z;
				values[3] = entity.velocity.x / 256;
				values[4] = entity.velocity.y / 256;
				values[5] = entity.velocity.z / 256;

			}

			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;
			let x      = values[0] * limit.x;
			let y      = values[1] * limit.y;
			let z      = values[2] * limit.z;


			if (entity !== null) {

				entity.moveTo({
					x: x,
					y: y,
					z: z
				});

			}

		}

	};


	return Composite;

});

