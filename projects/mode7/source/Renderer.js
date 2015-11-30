
lychee.define('game.Renderer').includes([
	'lychee.Renderer'
]).requires([
	'game.Camera',
	'game.Compositor'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);

		this.camera     = null;
		this.compositor = null;


		lychee.Renderer.call(this, settings);

		settings = null;

	};

	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.Renderer.prototype.serialize.call(this);
			data['constructor'] = 'game.Renderer';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setCamera: function(camera) {

			camera = camera instanceof game.Camera ? camera : null;


			if (camera !== null) {

				this.camera = camera;

				return true;

			}


			return false;

		},

		setCompositor: function(compositor) {

			compositor = compositor instanceof game.Compositor ? compositor : null;


			if (compositor !== null) {

				this.compositor = compositor;

				return true;

			}


			return false;

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

