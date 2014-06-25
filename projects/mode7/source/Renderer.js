
lychee.define('game.Renderer').includes([
	'lychee.Renderer'
]).requires([
	'game.Camera',
	'game.Compositor'
]).exports(function(lychee, game, global, attachments) {

	var _camera     = game.Camera;
	var _compositor = game.Compositor;


	var Class = function(data) {

		var settings = lychee.extend({}, data);

		this.camera     = null;
		this.compositor = null;


		lychee.Renderer.call(this, settings);

	};

	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		setCamera: function(camera) {

			if (
				   camera instanceof _camera
				|| camera === null
			) {
				this.camera = camera;
			}

		},

		setCompositor: function(compositor) {

			if (
				   compositor instanceof _compositor
				|| compositor === null
			) {
				this.compositor = compositor;
			}

		},

		renderEntity: function(entity, offsetX, offsetY) {

			if (typeof entity.render === 'function') {

				var camera     = this.camera;
				var compositor = this.compositor;

				entity.render(
					this,
					offsetX || 0,
					offsetY || 0,
					camera,
					compositor
				);

			}

		}

	};


	return Class;

});

