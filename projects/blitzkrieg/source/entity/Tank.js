
lychee.define('game.entity.Tank').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	var _rotate_to_target = function() {

		var dx = this.target.x - this.position.x;
		var dy = this.target.y - this.position.y;

		if (dx !== 0 || dy !== 0) {

			var angle = (((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360) / 360;
			var state = '01';
			var part  = 0.25 / 4;

			if (angle > part && angle < part * 3) {
				state = '02';
			} else if (angle > part *  3 && angle < part *  5) {
				state = '03';
			} else if (angle > part *  5 && angle < part *  7) {
				state = '04';
			} else if (angle > part *  7 && angle < part *  9) {
				state = '05';
			} else if (angle > part *  9 && angle < part * 11) {
				state = '06';
			} else if (angle > part * 11 && angle < part * 13) {
				state = '07';
			} else if (angle > part * 13 && angle < part * 15) {
				state = '08';
			}

			this.state = this.color + '-' + state;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.action = 'idle';
		this.color  = 'red';
		this.health = 100;
		this.path   = {
			current: null,
			stack:   []
		};

		this.target = {
			start: null,

		};


		settings.texture = _texture;
		settings.map     = _config.map;
		settings.radius  = _config.radius;
		settings.shape   = _config.shape;
		settings.states  = _config.states;
		settings.state   = this.color + '-01';


		this.setAction(settings.action);
		this.setColor(settings.color);


		delete settings.color;


		lychee.app.Sprite.call(this, settings);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		canAction: function(action) {

			if (action === 'attack' || action === 'move') {
				return true;
			}


			return false;

		},

		setAction: function(action) {

			if (action === 'idle' || action === 'attack' || action === 'move') {

				this.action = action;

				return true;

			}


			return false;

		},

		setColor: function(color) {

			color = (typeof color === 'string' && color.match(/red|green/g)) ? color : null;

			if (color !== null) {

				this.color = color;
				this.state = color + '-01';

				return true;

			}


			return false;

		},

		setTarget: function(target) {

			if (target instanceof Object) {

				this.target.x = typeof target.x === 'number' ? (target.x | 0) : this.target.x;
				this.target.y = typeof target.y === 'number' ? (target.y | 0) : this.target.y;


				_rotate_to_target.call(this);


				return true;

			}


			return false;

		}

	};


	return Class;

});

