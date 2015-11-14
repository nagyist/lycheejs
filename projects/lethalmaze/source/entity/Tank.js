
lychee.define('game.entity.Tank').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;
	var _sound   = attachments["snd"];


	var _id  = 0;
	var _IDS = [ 'rainbow', 'red', 'green', 'blue', 'black', 'white' ];


	var Class = function(data, main) {

		var settings = lychee.extend({}, data);

		this.main = main || null;

		this.id        = _IDS[_id++];
		this.direction = 'top';
		this.ammo      = 4;
		this.life      = 4;


		this.__clock     = null;
		this.__ammoclock = null;
		this.__lifeclock = null;


		settings.collision = lychee.app.Entity.COLLISION.A;
		settings.texture   = _texture;
		settings.map       = _config.map;
		settings.width     = _config.width;
		settings.height    = _config.height;
		settings.shape     = lychee.app.Entity.SHAPE.rectangle;
		settings.states    = _config.states;
		settings.state     = this.id + '-' + this.direction;


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		destroy: function() {

			_id--;

		},

		update: function(clock, delta) {

			this.__clock = clock;

			lychee.app.Sprite.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			lychee.app.Sprite.prototype.render.call(this, renderer, offsetX, offsetY);


			var position = this.position;
			var texture  = this.texture;


			var clock = this.__clock;
			if (clock < this.__lifeclock) {

				var life_map = this.__map['life'][this.life - 1] || null;
				if (life_map !== null) {

					renderer.drawSprite(
						position.x + offsetX - life_map.w / 2,
						position.y + offsetY - life_map.h / 2,
						texture,
						life_map
					);

				}

			} else if (clock < this.__ammoclock) {

				var ammo_map = this.__map['ammo'][this.ammo - 1] || null;
				if (ammo_map !== null) {

					renderer.drawSprite(
						position.x + offsetX - ammo_map.w / 2,
						position.y + offsetY - ammo_map.h / 2,
						texture,
						ammo_map
					);

				}

			}

		},

		shoot: function() {

			if (this.ammo > 0) {

				this.main.jukebox.play(_sound);
				this.__ammoclock = this.__clock + 2000;
				this.ammo--;

				return true;

			}


			return false;

		},

		hit: function() {

			if (this.life > 0) {

				this.__lifeclock = this.__clock + 2000;
				this.life--;

				if (this.life === 0) {
					return false;
				}


				return true;

			}


			return false;

		},

		powerup: function() {

			if (this.ammo < 4) {

				this.__ammoclock = this.__clock + 2000;
				this.ammo = 4;

				return true;

			} else if (this.life < 4) {

				this.__lifeclock = this.__clock + 2000;
				this.life++;

				return true;

			}


			return false;

		},

		setDirection: function(direction) {

			var result = this.setState(this.id + '-' + direction);
			if (result === true) {

				this.direction = direction;

				return true;

			}


			return false;

		}

	};


	return Class;

});

