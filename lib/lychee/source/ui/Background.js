
lychee.define('lychee.ui.Background').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _is_color = function(color) {

		if (typeof color === 'string') {

			if (color.match(/(#[AaBbCcDdEeFf0-9]{6})/) || color.match(/(#[AaBbCcDdEeFf0-9]{8})/)) {
				return true;
			}

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.color  = null;
		this.origin = { x: 0, y: 0 };

		this.__buffer  = null;
		this.__isDirty = true;


		lychee.ui.Sprite.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('reshape', function(orientation, rotation, width, height) {

			if (typeof width === 'number' && typeof height === 'number') {

				this.width  = width;
				this.height = height;

			}

		}, this);


		this.setColor(settings.color);
		this.setOrigin(settings.origin);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.ui.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Background';

			var settings = data['arguments'][0];


			if (this.origin.x !== 0 || this.origin.y !== 0) {

				settings.origin = {};

				if (this.origin.x !== 0) settings.origin.x = this.origin.x;
				if (this.origin.y !== 0) settings.origin.y = this.origin.y;

			}


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			var alpha    = this.alpha;
			var color    = this.color;
			var texture  = this.texture;
			var position = this.position;
			var map      = this.getMap();


			var x1 = position.x + offsetX - this.width  / 2;
			var y1 = position.y + offsetY - this.height / 2;
			var x2 = x1 + this.width;
			var y2 = y1 + this.height;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (color !== null) {

				renderer.drawBox(
					x1,
					y1,
					x2,
					y2,
					color,
					true
				);

			}


			if (texture !== null && map !== null) {

				if (this.__buffer === null) {

					this.__buffer = renderer.createBuffer(
						this.width,
						this.height
					);

				}


				var buffer = this.__buffer;

				if (this.__isDirty === true) {

					renderer.setBuffer(buffer);


					if (map.w !== 0 && map.h !== 0 && (map.w <= this.width || map.h <= this.height)) {

						var px = this.origin.x - map.w;
						var py = this.origin.y - map.h;


						while (px < this.width) {

							py = this.origin.y - map.h;

							while (py < this.height) {

								renderer.drawSprite(
									px,
									py,
									texture,
									map
								);

								py += map.h;

							}

							px += map.w;

						}

					} else {

						renderer.drawSprite(
							0,
							0,
							texture,
							map
						);

					}


					renderer.setBuffer(null);

					this.__buffer  = buffer;
					this.__isDirty = false;

				}


				renderer.drawBuffer(
					x1,
					y1,
					buffer
				);

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}


			if (lychee.debug === true) {

				renderer.drawBox(
					x1,
					y1,
					x2,
					y2,
					'#ffff00',
					false,
					1
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		setColor: function(color) {

			color = _is_color(color) ? color : null;


			if (color !== null) {

				this.color = color;

				return true;

			}


			return false;

		},

		setOrigin: function(origin) {

			origin = origin instanceof Object ? origin : null;


			if (origin !== null) {

				this.origin.x = typeof origin.x === 'number' ? origin.x : this.origin.x;
				this.origin.y = typeof origin.y === 'number' ? origin.y : this.origin.y;

				var map = this.getMap();
				if (map !== null) {
					this.origin.x %= map.w;
					this.origin.y %= map.h;
				}

				this.__isDirty = true;


				return true;

			}


			return false;

		}

	};


	return Class;

});

