
lychee.define('game.logic.Level').requires([
	'game.logic.Blitz',
	'game.entity.Object',
	'game.entity.Terrain'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _parse_layer = function(layer, type) {

		for (var y = 0; y < layer.length; y++) {

			for (var x = 0; x < layer[y].length; x++) {

				var value = layer[y][x];


				if (type === 'terrain') {

					this.terrain[y][x] = new game.entity.Terrain({
						type:     value,
						position: {
							x: x,
							y: y
						}
					});

				} else if (type === 'blitzes') {

					if (value > 0) {

						this.blitzes[y][x] = new game.logic.Blitz({
							type:     value,
							position: {
								x: x,
								y: y
							}
						});

					} else {

						this.blitzes[y][x] = null;

					}

				} else if (type === 'objects') {

					if (value > 0) {

						this.objects[y][x] = new game.entity.Object({
							type:     value,
							position: {
								x: x,
								y: y
							}
						});

					} else {

						this.objects[y][x] = null;

					}

				}

			}

		}

	};

	var _parse = function(data, tile) {

		for (var y = 0; y < data.height; y++) {
			this.terrain[y] = new Array(data.width);
			this.blitzes[y] = new Array(data.width);
			this.objects[y] = new Array(data.width);
		}


		_parse_layer.call(this, data.terrain, 'terrain');
		_parse_layer.call(this, data.blitzes, 'blitzes');
		_parse_layer.call(this, data.objects, 'objects');

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		this.width   = 0;
		this.height  = 0;

		this.terrain = [];
		this.objects = [];
		this.blitzes = [];


		_parse.call(this, data);


		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});

