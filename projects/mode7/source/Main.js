
lychee.define('game.Main').requires([
	'game.Camera',
	'game.Compositor',
	'game.Renderer',
	'game.state.Game'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			id:     0,
			title:  'Mode7 Game',

			client: null,

			input:  {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       false,
				swipe:       false
			},

			jukebox: {
				music: false,
				sound: false
			},

			renderer: null,

			viewport: {
				fullscreen: true
			}

		}, data);


		if (settings.id === 0) {

			settings.gamerenderer = {
				id:         'mode7-0',
				// background: '#92c9ef' ,
				background: '#436026',
				width:      null,
				height:     null
			};

		}


		lychee.game.Main.call(this, settings);

	};


	Class.prototype = {

		reshape: function() {

			this.camera.reshape();
			this.compositor.reshape();

		},

		init: function() {

			lychee.game.Main.prototype.init.call(this);


			var settings = this.settings.gamerenderer;
			if (settings instanceof Object) {
				this.renderer = new game.Renderer(settings);
			}

			this.camera     = new game.Camera(this);
			this.compositor = new game.Compositor(this);

			this.reshape();


			this.renderer.setCamera(this.camera);
			this.renderer.setCompositor(this.compositor);


			this.setState('game', new game.state.Game(this));

			this.changeState('game', {
				track: 'valley'
			});

		}

	};


	return Class;

});
