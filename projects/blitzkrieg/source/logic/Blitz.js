
lychee.define('game.logic.Blitz').requires([
	'game.entity.Object',
	'game.entity.Tank',
	'game.entity.Terrain',
	'lychee.effect.Lightning',
	'lychee.effect.Position'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _move_to_position = function(entity, position) {

		var x = position.x;
		var y = position.y;


		entity.addEffect(new lychee.effect.Position({
			type:     lychee.effect.Position.TYPE.linear,
			delay:    100,
			duration: 500,
			position: {
				x: entity.position.x,
				y: entity.position.y + 200
			}
		}));

		entity.addEffect(new lychee.effect.Position({
			type:     lychee.effect.Position.TYPE.linear,
			delay:    250,
			duration: 500,
			position: {
				x: x,
				y: y
			}
		}));

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		this.duration = 750;
		this.logic    = null;
		this.center   = null;

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		canAction: function(action) {

			if (action === 'blitz') {
				return true;
			}


			return false;

		},

		setAction: function(action) {

			if (action === 'blitz') {

				var logic = this.logic;
				if (logic !== null) {

					var terrain   = [];
					var objects   = [];
					var positions = [];

					var center = this.center;
					if (center !== null) {

						terrain = logic.getSurrounding(logic.toTilePosition(center.position, 'terrain'), 'terrain');
						objects = logic.getSurrounding(logic.toTilePosition(center.position, 'terrain'), 'objects');

						logic.strikeLightning(center);

						_move_to_position(center, {
							y: center.position.y
						});

					}


					var t, tl;

					for (t = 0, tl = terrain.length; t < tl; t++) {

						if (terrain[t] === null) {
							terrain.splice(t, 1);
							objects.splice(t, 1);
							tl--;
							t--;
						}

					}

					for (t = 0, tl = terrain.length; t < tl; t++) {
						positions.push(logic.toTilePosition(terrain[t].position, 'terrain'));
					}


					for (t = 0, tl = terrain.length; t < tl; t++) {

						var curr_terrain  = terrain[t] || null;
						var curr_object   = objects[t] || null;
						var curr_position = positions[t];
						var next_position = positions[(t + 1) % tl];

						logic.set(next_position, curr_terrain, 'terrain');
						logic.set(next_position, curr_object,  'objects');

						if (curr_terrain !== null) {
							_move_to_position(curr_terrain, logic.toScreenPosition(next_position, 'terrain'));
						}

						if (curr_object !== null) {
							_move_to_position(curr_object,  logic.toScreenPosition(next_position, 'objects'));
						}

					}

				}


				return true;

			}


			return false;

		},

		setCenter: function(entity) {

			entity = entity instanceof game.entity.Terrain ? entity : null;


			if (entity !== null) {

				this.center = entity;

				return true;

			}


			return false;

		},

		setLogic: function(logic) {
			this.logic = logic;
			return true;
		}

	};


	return Class;

});

