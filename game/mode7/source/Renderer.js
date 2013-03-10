
lychee.define('game.Renderer').includes([
	'lychee.Renderer'
]).requires([
	'game.Camera',
	'game.Compositor'
]).exports(function(lychee, game, global, attachments) {

	var _camera     = game.Camera;
	var _compositor = game.Compositor;


	var Class = function(id) {

		this.__camera     = null;
		this.__compositor = null;


		lychee.Renderer.call(this, id);

	};

	Class.prototype = {

		setCamera: function(camera) {

			if (
				camera instanceof _camera
				|| camera === null
			) {
				this.__camera = camera;
			}

		},

		setCompositor: function(compositor) {

			if (
				compositor instanceof _compositor
				|| compositor === null
			) {
				this.__compositor = compositor;
			}

		},

		renderEntity: function(entity, offsetX, offsetY) {

			if (typeof entity.render === 'function') {

				var camera     = this.__camera;
				var compositor = this.__compositor;
				if (
					camera !== null
					&& compositor !== null
				) {

					entity.render(
						this,
						offsetX || 0,
						offsetY || 0,
						camera,
						compositor
					);

				} else {

					entity.render(
						this,
						offsetX || 0,
						offsetY || 0
					);

				}

			}

		}

	};


	return Class;

});

