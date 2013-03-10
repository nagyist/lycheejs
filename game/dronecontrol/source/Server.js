
lychee.define('game.Server').requires([
	'game.ar.Drone',
	'lychee.game.Loop',
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _drone = game.ar.Drone;

	var Class = function(drones) {

		this.drones = drones instanceof Array ? drones : [];

		this.loop = new lychee.game.Loop({
			render: 0,
			update: 33
		});

		this.loop.bind('update', this.update, this);


		this.server = new lychee.net.Server(
			JSON.stringify, JSON.parse
		);

		this.server.listen(
			1338,
			null
		);

		this.server.bind('connect', function(remote) {

			remote.accept();

			remote.bind('receive', this.__onReceive, this);

		}, this);


	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		update: function(clock, delta) {

			for (var d = 0, dl = this.drones.length; d < dl; d++) {
				this.drones[d].update(clock, delta);
			}

		},



		/*
		 * CUSTOM API
		 */

		getDroneById: function(id) {

			for (var d = 0, dl = this.drones.length; d < dl; d++) {

				if (this.drones[d].id === id) {
					return this.drones[d];
				}

			}


			return null;

		},

		__onReceive: function(data) {

			var drone  = this.getDroneById(data.droneId || null);
			var method = data.method;
			var type   = data.type || null;
			var value  = data.value;


			if (drone === null) {
				return false;
			}


			switch(method) {

				case 'takeoff':
					drone.disableEmergency();
					drone.takeoff();
				break;

				case 'land':
					drone.land();
				break;

				case 'stop':
					drone.stop();
				break;

				case 'roll':
					drone.roll(value);
				break;
				case 'pitch':
					drone.pitch(value);
				break;
				case 'yaw':
					drone.yaw(value);
				break;
				case 'heave':
					drone.heave(value);
				break;

				case 'animateFlight':
					drone.animateFlight(type, value);
				break;

				case 'animateLEDs':
					drone.animateLEDs(type, value);
				break;

			}


			console.log('SERVER RECEIVED DATA', data);

		}

	};


	return Class;

});

