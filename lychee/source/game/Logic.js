
lychee.define('lychee.game.Logic').requires([
	'lychee.game.Entity',
	'lychee.game.Layer',
	'lychee.game.Physic'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _project_layer = function(layer) {

		var projection = this.projection;
		var entities   = layer.entities;

		for (var e = 0, el = entities.length; e < el; e++) {
			this.projectPosition(entities[e].position, true);
		}

	};

	var _unproject_layer = function(layer) {

		var projection = this.projection;
		var entities   = layer.entities;

		for (var e = 0, el = entities.length; e < el; e++) {
			this.unprojectPosition(entities[e].position, true);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.physic     = null;
		this.projection = Class.PROJECTION.pixel;
		this.tile       = {
			width:  1,
			height: 1,
			depth:  1
		};

		this.__layers   = [];


		this.setLayers(settings.layers);
		this.setPhysic(settings.physic);
		this.setProjection(settings.projection);
		this.setTile(settings.tile);


		settings = null;

	};


	Class.PROJECTION = {
		pixel:    0,
		tile:     1,
		isometry: 2
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			// TODO: Deserialize layer query paths

		},

		serialize: function() {

			var settings = {};
			var blob     = {};


			if (this.physic !== null)                       settings.physic     = this.physic;
			if (this.projection !== Class.PROJECTION.pixel) settings.projection = this.projection;

			if (this.tile.width !== 1 || this.tile.height !== 1 || this.tile.depth !== 1) {

				settings.tile = {};

				if (this.tile.width !== 1)  settings.tile.width  = this.tile.width;
				if (this.tile.height !== 1) settings.tile.height = this.tile.height;
				if (this.tile.depth !== 1)  settings.tile.depth  = this.tile.depth;

			}


			if (this.__layers.length > 0) {
				// TODO: Serialize layers and their query paths
			}


			return {
				'constructor': 'lychee.game.Logic',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * STATE API
		 */

		enter: function(data) {

			var layers = this.__layers;
			for (var l = 0, ll = layers.length; l < ll; l++) {
				_project_layer.call(this, layers[l]);
			}

		},

		leave: function(data) {

			var layers = this.__layers;
			for (var l = 0, ll = layers.length; l < ll; l++) {
				_unproject_layer.call(this, layers[l]);
			}

		},

		update: function(clock, delta) {

			var physic = this.physic;
			if (physic !== null) {
				physic.update(clock, delta);
			}

		},



		/*
		 * CUSTOM API
		 */

		addLayer: function(layer) {

			layer = lychee.interfaceof(lychee.game.Layer, layer) ? layer : null;


			if (layer !== null) {

				var index = this.__layers.indexOf(layer);
				if (index === -1) {

					this.__layers.push(layer);

					return true;

				}

			}


			return false;

		},

		removeLayer: function(layer) {

			layer = lychee.interfaceof(lychee.game.Layer, layer) ? layer : null;


			if (layer !== null) {

				var index = this.__layers.indexOf(layer);
				if (index !== -1) {

					this.__layers.splice(index, 1);

					return true;

				}

			}


			return false;

		},

		setLayers: function(layers) {

			var all = true;

			if (layers instanceof Array) {

				for (var l = 0, ll = layers.length; l < ll; l++) {

					var result = this.addLayer(layers[l]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		removeLayers: function() {

			var layers = this.__layers;

			for (var l = 0, ll = layers.length; l < ll; l++) {

				this.removeLayer(layers[l]);

				ll--;
				l--;

			}

			return true;

		},

		setPhysic: function(physic) {

			physic = lychee.interfaceof(lychee.game.Physic, physic) ? physic : null;


			if (physic !== null) {

				this.physic = physic;

				return true;

			}


			return false;

		},

		setProjection: function(projection) {

			projection = lychee.enumof(Class.PROJECTION, projection) ? projection : null;


			if (projection !== null) {

				this.projection = projection;

				return true;

			}


			return false;

		},

		setTile: function(tile) {

			if (tile instanceof Object) {

				this.tile.width  = typeof tile.width === 'number'  ? (tile.width  | 0) : this.tile.width;
				this.tile.height = typeof tile.height === 'number' ? (tile.height | 0) : this.tile.height;
				this.tile.depth  = typeof tile.depth === 'number'  ? (tile.depth  | 0) : this.tile.depth;

				return true;

			}


			return false;

		},

		projectPosition: function(position, bound) {

			position = position instanceof Object ? position : null;
			bound    = bound === true;


			if (position !== null) {

				var projection = this.projection;
				var tile       = this.tile;

				var x = position.x;
				var y = position.y;
				var z = position.z;


				if (bound === true) {

					x |= 0;
					y |= 0;
					z |= 0;

				}


				if (projection === Class.PROJECTION.tile) {

					x = x * tile.width;
					y = y * tile.height;
					z = z * tile.depth;

				} else if (projection === Class.PROJECTION.isometry) {

					x = (x - y) * tile.width;
					y = (x + y) * (tile.height / 2);
					z = 0;

				}


				position.x = x;
				position.y = y;
				position.z = z;


				return true;

			}


			return false;

		},

		unprojectPosition: function(position, bound) {

			position = position instanceof Object ? position : null;
			bound    = bound === true;


			if (position !== null) {

				var projection = this.projection;
				var tile       = this.tile;

				var x = position.x;
				var y = position.y;
				var z = position.z;


				if (projection === Class.PROJECTION.tile) {

					x = x / tile.width;
					y = y / tile.height;
					z = z / tile.depth;

				} else if (projection === Class.PROJECTION.isometry) {

					x = (y / tile.height) + (x / (2 * tile.width));
					y = (y / tile.height) - (x / (2 * tile.width));
					z = 0;

				}


				if (bound === true) {

					x |= 0;
					y |= 0;
					z |= 0;

				}


				position.x = x;
				position.y = y;
				position.z = z;


				return true;

			}


			return false;

		}

	};


	return Class;

});

