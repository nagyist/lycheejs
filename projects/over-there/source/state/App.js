
lychee.define('app.state.App').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Color',
	'lychee.effect.Position',
	'lychee.effect.Shake',
	'app.entity.Astronaut',
	'app.entity.Background',
	'app.entity.Emblem',
	'app.entity.Midground',
	'app.entity.Airlock',
	'app.entity.Room',
	'app.ui.Overlay'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, app, global, attachments) {

	var _blob = attachments["json"].buffer;
	var _font = attachments["fnt"];



	/*
	 * HELPERS
	 */

	var _get_room = function(name) {

		var entities = this.queryLayer('foreground', 'ship').entities.filter(function(val) {
			return val instanceof app.entity.Room && val.state === name;
		});


		if (entities.length > 0) {
			return entities[0];
		}


		return null;

	};

	var _animate_astronaut = function(astronaut) {

		// sleeping ... zZzZz
		if (astronaut.state === 'default') {
			return;
		}


		var room = astronaut.room || null;
		if (room !== null) {

			var rw = room.width  - 16;
			var rh = room.height - 16;

			var target_x = room.position.x - (rw / 2) + (Math.random() * rw);
			var target_y = room.position.y - (rh / 2) + (Math.random() * rh);

			if (target_x > astronaut.position.x) {
				astronaut.state = 'working-right';
			} else {
				astronaut.state = 'working-left';
			}


			astronaut.addEffect(new lychee.effect.Position({
				type:     lychee.effect.Position.TYPE.linear,
				duration: 6000,
				origin:   {
					x: astronaut.position.x,
					y: astronaut.position.y
				},
				position: {
					x: target_x,
					y: target_y
				}
			}));

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.app.State.call(this, main);


		this.__entity = null;


		this.deserialize(_blob);

		/*
		 * INITIALIZATION
		 */

		var viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				var renderer = this.renderer;
				if (renderer !== null) {

					var entity = null;
					var width  = renderer.width;
					var height = renderer.height;


					entity = this.queryLayer('background', 'background');
					entity.width  = width;
					entity.height = height;

					entity = this.queryLayer('midground', 'midground');
					entity.width  = width;
					entity.height = height;

					entity = this.queryLayer('midground', 'emblem');
					entity.position.x = 1/2 * width - 128;
					entity.position.y = 1/2 * height - 32;

				}

			}, this);

		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.App';


			return data;

		},

		deserialize: function(blob) {

			lychee.app.State.prototype.deserialize.call(this, blob);


			var entity = null;

			/*
			 * HELP LAYER
			 */

			this.__overlay = this.queryLayer('ui', 'overlay');


			entity = this.getLayer('ui');
			entity.bind('touch', function(id, position, delta) {

				var target = this.queryLayer('foreground', 'ship').getEntity(null, position);
				if (target !== null) {
					this.__entity = target;
					this.__overlay.setEntity(target);
					this.__overlay.setPosition(target.position);
					this.__overlay.setVisible(true);
				} else {
					this.__entity = null;
					this.__overlay.setEntity(null);
					this.__overlay.setVisible(false);
				}

			}, this);


			this.client.bind('sensor', function(name, property, value) {

				var room = _get_room.call(this, name);
				if (room !== null) {
					room.properties[property] = value;
				}

			}, this);


			var rooms = this.queryLayer('foreground', 'ship').entities.filter(function(val) {
				return val instanceof app.entity.Room;
			});

			rooms.forEach(function(room) {
				room.properties['name'] = room.state;
			});



			var astronauts      = [];
			var astronaut_index = 0;

			this.client.bind('astronaut', function(data) {

				var room     = _get_room.call(this, data.room);
				var state    = data.activity === 'sleep' ? 'default' : (Math.random() > 0.5 ? 'working-right' : 'working-left');
				var position = {
					x: room.position.x,
					y: room.position.y,
					z: 2
				};

				var astronaut = new app.entity.Astronaut({
					state:      state,
					position:   position,
					properties: {
						name:         data.firstName,
						agency:       data.agency,
						teamPosition: data.position,
						activity:     data.activity,
						avatar:       data.position
					}
				});

				astronaut.room = room;
				astronauts.push(astronaut);

				this.queryLayer('foreground', 'ship').addEntity(astronaut);

			}, this);

			this.loop.setInterval(3000, function() {

				astronaut_index++;
				astronaut_index %= astronauts.length;

				var astronaut = astronauts[astronaut_index] || null;
				if (astronaut !== null) {
					_animate_astronaut.call(this, astronaut);
				}

			}, this);

		},



		/*
		 * CUSTOM API
		 */

		update: function(clock, delta) {

			var background = this.queryLayer('background', 'background');
			if (background !== null) {

				var x = background.origin.x;

				background.setOrigin({
					x: x + delta/250
				});

			}


			lychee.app.State.prototype.update.call(this, clock, delta);

		},

		render: function(clock, delta) {

			var entity   = this.__entity;
			var renderer = this.renderer;

			if (entity !== null) {

				renderer.clear();

				renderer.setAlpha(0.4);
				this.getLayer('background').render(renderer, 0, 0);

				renderer.setAlpha(0.4);
				this.getLayer('midground').render(renderer, 0, 0);

				renderer.setAlpha(0.4);
				this.getLayer('foreground').render(renderer, 0, 0);

				renderer.setAlpha(1);
				this.getLayer('ui').render(renderer, 0, 0);

				renderer.flush();

			} else {

				lychee.app.State.prototype.render.call(this, clock, delta, false);

			}

		},

		enter: function() {

			lychee.app.State.prototype.enter.call(this);

		},

		leave: function() {

			lychee.app.State.prototype.leave.call(this);

		}

	};


	return Class;

});
