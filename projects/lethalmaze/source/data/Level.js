
lychee.define('game.data.Level').requires([
	'game.app.sprite.Item',
	'game.app.sprite.Tank',
	'game.app.sprite.Terrain',
	'game.app.sprite.Wall'
]).exports(function(lychee, game, global, attachments) {

	var _TILE = 32;



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'game.data.Level',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

// TODO: Encode data into JSON structure

			}


			return null;

		},

		decode: function(data) {

			data = data instanceof Array ? data : null;


			if (data !== null) {

				var cache = {
					terrain: [],
					objects: []
				};


				data.forEach(function(line, y) {

					line.forEach(function(type, x) {

						var position = {
							x: x + 0.5,
							y: y + 0.5,
							z: 0
						};


						position.x = position.x * _TILE;
						position.y = position.y * _TILE;
						position.z = position.z * _TILE;


						cache.terrain.push(new game.app.sprite.Terrain({
							position: position
						}));


						switch (type) {

							case 1:

								cache.objects.push(new game.app.sprite.Wall({
									position: position
								}));

							break;

							case 2:

								cache.objects.push(new game.app.sprite.Tank({
									position: position
								}));

							break;

							case 3:

								cache.objects.push(new game.app.sprite.Item({
									position: position
								}));

							break;

						}

					});

				});


				return cache;

			}


			return null;

		}

	};


	return Module;

});

