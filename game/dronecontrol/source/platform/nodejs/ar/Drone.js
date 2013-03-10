
lychee.define('game.ar.Drone').requires([
	'game.ar.command.CONFIG',
	'game.ar.command.PCMD',
	'game.ar.command.REF',
	'game.ar.command.Socket',
	'game.ar.navdata.Socket'
//	'game.ar.video.Socket'
]).exports(function(lychee, game, global, attachments) {

	var _id = 0;

	var _config = game.ar.command.CONFIG;
	var _pcmd   = game.ar.command.PCMD;
	var _ref    = game.ar.command.REF;
	var _commandsocket = game.ar.command.Socket;
	var _navdatasocket = game.ar.navdata.Socket;


	var Class = function(id, data) {

		var settings = lychee.extend({
			ip:   '192.168.1.1'
		}, data);


		this.id = id || ('drone-' + _id++);

		this.__ref    = new _ref(false, false);
		this.__pcmd   = new _pcmd(0, 0, 0, 0);
		this.__config = new _config();


		var ip = settings.ip;

		this.__commandSocket = new _commandsocket(ip);
		this.__navdataSocket = new _navdatasocket(ip);
		this.__navdataSocket.bind('receive', this.__processNavdata, this);

		//this.__videoSocket   = new _videosocket(
		// settings.ip, 5555
		//);

		this.__isFlying         = false;
		this.__isInEmergency    = false;
		this.__disableEmergency = false;

		this.__navdata = null;

		this.__state = {};
		this.__state.roll  = 0;
		this.__state.pitch = 0;
		this.__state.yaw   = 0;
		this.__state.heave = 0;
		this.__state.config = {
			'general:navdata_demo': [ 'TRUE' ]
		};


		this.__flightanimation = {};
		this.__flightanimation.active   = false;
		this.__flightanimation.type     = null;
		this.__flightanimation.start    = null;
		this.__flightanimation.duration = null;
		this.__flightanimation.sent     = false;

		this.__clock = null;


		settings = null;

	};


	Class.FLIGHTANIMATION = {
		'turn':         6,
		'turn-down':    7,
		'yaw-shake':    8,
		'roll-dance':  10,
		'pitch-dance': 11,
		'yaw-dance':    9,

		'wave':        13,

		'flip-ahead':  16,
		'flip-behind': 17,
		'flip-left':   18,
		'flip-right':  19
	};


	Class.LEDANIMATION = {
		'blinkGreenRed':  0,
		'blinkGreen':     1,
		'blinkRed':       2,
		'blinkOrange':    3,
		'snakeGreenRed':  4,
		'fire':           5,
		'standard':       6,
		'red':            7,
		'green':          8,
		'redSnake':       9,
		'blank':         10
	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */

		__processNavdata: function(data) {

// console.log('processing navdata', data.demo);

			if (data instanceof Object) {

				if (
					data.states
					&& data.states.emergency_landing === 1
					&& this.__disableEmergency === true
				) {
					console.log('disabling emergency case');
					this.__ref.setEmergency(true);
				} else {
					this.__ref.setEmergency(false);
					this.__disableEmergency = false;
				}


				this.__navdata = data;

			}

		},

		isFlying: function() {
			return this.__isFlying === true;
		},

		isLanding: function() {
			return this.__isFlying === false;
		},

		disableEmergency: function() {
			this.__disableEmergency = true;
		},

		update: function(clock, delta) {

			if (this.__commandSocket !== null) {

				var state = this.__state;
				for (var id in state.config) {

					this.__config.set(id, state.config[id]);
					this.__commandSocket.add(this.__config);

				}

				for (var id in state.config) {
					delete state.config[id];
				}



				this.__commandSocket.add(this.__ref);

				this.__pcmd.set(
					state.roll,
					state.pitch,
					state.yaw,
					state.heave
				);

				this.__commandSocket.add(this.__pcmd);

				this.__commandSocket.flush();

			}


			this.__clock = clock;

		},



		/*
		 * INTERACTION API
		 */

		takeoff: function() {
			this.__isFlying = true;
			this.__ref.setFlying(this.__isFlying);
		},

		land: function() {
			this.__isFlying = false;
			this.__ref.setFlying(this.__isFlying);
		},

		stop: function() {

			var state = this.__state;

			state.roll  = 0;
			state.pitch = 0;
			state.yaw   = 0;
			state.heave = 0;

		},

		roll: function(speed) {

			if (
				typeof speed === 'number'
				&& speed >= -1.0
				&& speed <=  1.0
			) {
				this.__state.roll = speed;
				return true;
			}


			return false;

		},

		pitch: function(speed) {

			if (
				typeof speed === 'number'
				&& speed >= -1.0
				&& speed <=  1.0
			) {
				this.__state.pitch = speed;
				return true;
			}


			return false;

		},

		yaw: function(speed) {

			if (
				typeof speed === 'number'
				&& speed >= -1.0
				&& speed <=  1.0
			) {
				this.__state.yaw = speed;
				return true;
			}


			return false;

		},

		heave: function(speed) {

			if (
				typeof speed === 'number'
				&& speed >= -1.0
				&& speed <=  1.0
			) {
				this.__state.heave = speed;
				return true;
			}


			return false;

		},

		animateFlight: function(type, duration) {

			duration = typeof duration === 'number' ? duration : null;


			var valid   = false;
			var enumval = 0;

			for (var id in Class.FLIGHTANIMATION) {
				if (id === type) {
					enumval = Class.FLIGHTANIMATION[id];
					valid   = true;
					break;
				}
			}


			if (
				valid === true
				&& duration !== null
			) {
				this.__state.config['control:flight_anim'] = [ enumval, duration ];
				return true;
			}


			return false;

		},

		animateLEDs: function(type, duration, hertz) {

			duration = typeof duration === 'number' ? duration : null;
			hertz    = typeof hertz === 'number' ? hertz : 2;


			var enumval = 0;
			var valid   = false;

			for (var id in Class.LEDANIMATION) {
				if (id === type) {
					enumval = Class.LEDANIMATION[id];
					valid   = true;
					break;
				}
			}


			if (
				valid === true
				&& duration !== null
			) {
				this.__state.config['control:leds_anim'] = [ enumval, hertz, (duration / 1000) | 0 ];
				return true;
			}


			return false;

		}

	};


	return Class;

});

