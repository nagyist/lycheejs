
lychee.define('game.Main').requires([
	'game.Camera',
	'game.Compositor',
	'game.Renderer',
	'game.state.Game'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, global) {

	var _instance_id = 0;


	var Class = function(data) {

		var settings = lychee.extend({

			title:      'Mode7 Game',
			fullscreen: true,
			distance:   400,

			renderer: null

		}, data);


		lychee.game.Main.call(this, settings);

		this.__id = _instance_id++;

		this.init();

	};


	Class.prototype = {

		reshape: function(orientation, rotation, width, height) {

			lychee.game.Main.prototype.reshape.call(
				this,
				orientation,
				rotation,
				width,
				height
			);


			var renderer = this.renderer;
			if (renderer !== null) {

				var env = renderer.getEnvironment();

				if (this.camera !== null) {
					this.camera.reset(env.width, env.height);
				}

				if (this.compositor !== null) {
					this.compositor.reset(env.width, env.height);
				}

			}

		},

		reset: function(state) {

			this.reshape();


			if (state === true) {
				this.resetState(null, null);
			}

		},

		init: function() {

			lychee.game.Main.prototype.init.call(this);


			this.camera     = new game.Camera(this);
			this.compositor = new game.Compositor(this);


			var settings = this.settings;
			if (settings.instances > 1) {

				var width  = settings.width | 0;
				var height = settings.height | 0;


				settings.renderer = {
					id: 'mode7-' + this.__id,
					width:  width,
					height: height
				};

				this.defaults.renderer = lychee.extend({}, settings.renderer);

				this.renderer = new game.Renderer(settings.renderer.id);
				this.renderer.reset(width, height);

			} else {

				settings.renderer = {
					id: 'mode7-' + this.__id
				};

				this.renderer = new game.Renderer(settings.renderer.id);
				this.renderer.reset();

			}


			this.renderer.setBackground('#92c9ef');
			this.renderer.setCamera(this.camera);
			this.renderer.setCompositor(this.compositor);


			this.reset();


			this.setState('game', new game.state.Game(this));

			if (this.__id === 0) {
				this.changeState('game', 'valley');
			} else {
				this.changeState('game', 'circuit');
			}

		},

		// Do nothing, keep on demoing :)
		start: function() {},
		stop:  function() {}

	};


	return Class;

});
