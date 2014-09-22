
lychee.define('game.state.Game').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Color',
	'lychee.effect.Shake',
	'lychee.game.Background',
	'lychee.game.Emitter',
	'lychee.ui.Label',
	'game.entity.Circle',
	'game.entity.Particle',
	'game.ui.Button',
	'game.ui.Layer'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob = attachments["json"].buffer;
	var _font = attachments["fnt"];



	/*
	 * HELPERS
	 */

	var _bind_pingservice = function() {

		var entity  = this.queryLayer('ui', 'help > statistics');
		var service = this.client.getService('ping');
		if (entity !== null && service !== null) {

			service.bind('unplug', function() {
				this.setLabel('Ping: --- ms / --- ms');
			}, entity);

			service.bind('statistics', function(ping, pong) {
				this.setLabel('Ping: ' + ping + ' ms / ' + pong + ' ms');
			}, entity);


			this.__interval = this.loop.setInterval(2000, function() {

				var service = this.client.getService('ping');
				if (service !== null) {
					service.ping();
				}

			}, this);

		}

	};

	var _unbind_pingservice = function() {

		var entity  = this.queryLayer('ui', 'help > statistics');
		var service = this.client.getService('ping');
		if (entity !== null && service !== null) {

			service.unbind('unplug',     null, entity);
			service.unbind('statistics', null, entity);

			if (this.__interval !== null) {
				this.loop.removeInterval(this.__interval);
			}

		}

	};



	var _create_emitter = function(x, y) {

		var emitter = new lychee.game.Emitter({
			type:     lychee.game.Emitter.TYPE.explosion,
			duration: 500,
			lifetime: 2000,
			position: {
				x: x,
				y: y
			},
			entity:   lychee.serialize(new game.entity.Particle({
				radius: 16,
				color:  '#ffffff'
			}))
		});

		emitter.bind('create', function(entity) {

			entity.color = _random_color();

			entity.addEffect(new lychee.effect.Color({
				type:     lychee.effect.Color.TYPE.bounceeaseout,
				duration: 500,
				color:    '#000000'
			}));

			entity.addEffect(new lychee.effect.Alpha({
				type:     lychee.effect.Alpha.TYPE.bounceeaseout,
				duration: 500,
				alpha:    0
			}));

			var layer = this.getLayer('background');
			if (layer !== null) {
				layer.addEntity(entity);
			}

		}, this);

		emitter.bind('destroy', function(entity) {

			var layer = this.getLayer('background');
			if (layer !== null) {
				layer.removeEntity(entity);
			}

		}, this);


		this.emitters.push(emitter);

	};


	var _random_color = function() {

		var strr = (16 + Math.random() * 239 | 0).toString(16);
		var strg = (16 + Math.random() * 239 | 0).toString(16);
		var strb = (16 + Math.random() * 239 | 0).toString(16);

		return '#' + strr + strg + strb;
	};



	/*
	 * IMPLEMENTATION
	 */


	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.emitters = [];


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			var entity = null;



			/*
			 * HELP LAYER
			 */

			entity = this.queryLayer('ui', 'help > back');
			entity.bind('touch', function() {
				this.main.changeState('menu');
			}, this);

			entity = this.queryLayer('ui', 'help > statistics');
			entity.setFont(_font);

			entity = this.queryLayer('ui', 'help > message');
			entity.setFont(_font);

			entity = this.queryLayer('ui', 'circle');
			entity.bind('touch', function() {

				var color      = this.queryLayer('ui', 'circle').color;
				var layer      = this.getLayer('ui');
				var background = this.queryLayer('background', 'background');

				var action = (layer.effects.length === 0 && background.effects.length === 0);
				if (action === true) {

					layer.addEffect(new lychee.effect.Shake({
						type:     lychee.effect.Shake.TYPE.bounceeaseout,
						duration: 500,
						shake: {
							x: Math.random() > 0.5 ? -24 : 24,
							y: Math.random() > 0.5 ? -24 : 24
						}
					}));

					background.addEffect(new lychee.effect.Color({
						type:     lychee.effect.Color.TYPE.bounceeaseout,
						duration: 500,
						color:    color
					}));


					for (var e = 0, el = this.emitters.length; e < el; e++) {
						this.emitters[e].create(50);
					}

				}

			}, this);


			var width  = this.renderer.width;
			var height = this.renderer.height;

			var x1 = -1/2 * width  + 64;
			var x2 =  1/2 * width  - 64;
			var y1 = -1/2 * height + 64;
			var y2 =  1/2 * height - 64;


			_create_emitter.call(this, x1, y1);
			_create_emitter.call(this, x2, y1);
			_create_emitter.call(this, x2, y2);
			_create_emitter.call(this, x1, y2);

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.width;
				var height = renderer.height;


				entity = this.queryLayer('background', 'background');
				entity.width  = width;
				entity.height = height;

			}

		},

		update: function(clock, delta) {

			lychee.game.State.prototype.update.call(this, clock, delta);


			for (var e = 0, el = this.emitters.length; e < el; e++) {
				this.emitters[e].update(clock, delta);
			}

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			_bind_pingservice.call(this);


			this.queryLayer('ui', 'circle').setColor('#434343');

		},

		leave: function() {

			_unbind_pingservice.call(this);

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
