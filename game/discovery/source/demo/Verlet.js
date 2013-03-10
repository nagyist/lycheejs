
lychee.define('game.demo.Verlet').requires([
	'lychee.verlet.Tire',
	'lychee.verlet.World'
]).includes([
	'game.demo.Base'
]).exports(function(lychee, game, global, attachments) {

	var _base    = game.demo.Base;
	var _tire    = lychee.verlet.Tire;
	var _world   = lychee.verlet.World;


	var Demo = function(state) {

		_base.call(this, state);

		this.world = new _world();

		this.__x = 0;
		this.__y = 0;

		this.reset();

	};

	Demo.TITLE = 'lychee.verlet: Tire';

	Demo.prototype = {

		reset: function() {

			var demolayer = this.state.getLayer('demo');
			var uilayer   = this.state.getLayer('ui');


			var env = this.state.renderer.getEnvironment();


			var world = this.world;

			world.reset(env.width, env.height);
			world.setGravity(0.2);
			world.setFriction(0.01);
			world.setGroundFriction(0.2);


			var oldtire = world.getObject('tire');
			if (oldtire !== null) {
				world.removeObject(oldtire);
			}


			this.tire = new _tire({
				radius:   100,
				segments: 15,
				rigidity: {
					spoke: 0.9,
					tread: 0.5
				}
			});

			world.setObject('tire', this.tire);



			var root = uilayer.getEntity('root');

			root.bind('touch', function() {});

			root.bind('swipe', function(id, type, position, delta, swipe) {

				if (type === 'start') {
					this.__x = this.tire.origin.position.x;
					this.__y = this.tire.origin.position.y;
				} else if (type === 'move') {
					this.tire.origin.position.set(this.__x + swipe.x, this.__y + swipe.y);
				}

			}, this);

			demolayer.addEntity(this.tire);

		},

		update: function(clock, delta) {

			this.world.update(clock, delta);

		}

	};


	return Demo;

});

