
lychee.define('game.entity.ui.Widget').includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.margin   = 10;
		this.overflow = true;

		this.__offsetX = 0;
		this.__offsetY = 0;


		this.setMargin(settings.margin);
		this.setOverflow(settings.overflow);

		delete settings.margin;
		delete settings.overflow;


		lychee.ui.Layer.call(this, settings);


		this.relayout();

		settings = null;

	};


	Class.prototype = {

		/*
		 * GAME UI API
		 */

		relayout: function() {

			var margin = this.margin;


			// 1. Determine the approximate width and height
			var width  = 0;
			var height = 0;

			for (var e = 0, el = this.entities.length; e < el; e++) {

				var entity = this.entities[e];

				width   = Math.max(width, entity.width);
				height += entity.height + margin;

			}


			// 2. Reflow the calculated width/height if required
			if (this.overflow === true) {
				width  = Math.max(width,  this.width);
				height = Math.max(height, this.height);
			} else {
				width  = this.width;
				height = this.height;
			}


			// 3. Reset the offsets and positions
			this.__offsetX = 0;
			this.__offsetY = -1/2 * height + margin;

			var posx = this.__offsetX;
			var posy = this.__offsetY;


			// 4. Relayout the entities
			for (var e = 0, el = this.entities.length; e < el; e++) {

				var entity = this.entities[e];

				posy += entity.height / 2;

				entity.setPosition({
					x: posx,
					y: posy
				});

				posy += entity.height / 2
				posy += margin;

			}

			this.__offsetX = posx;
			this.__offsetY = posy;


			// 5. Relayout this widget (if overflow is wanted)
			if (this.overflow === true) {
				this.width  = width;
				this.height = height;
			}

		},



		/*
		 * CUSTOM API
		 */

		addEntity: function(entity) {

			var result = lychee.ui.Layer.prototype.addEntity.call(this, entity);
			if (result === true) {
				this.relayout();
			}

		},

		removeEntity: function(entity) {

			var result = lychee.ui.Layer.prototype.removeEntity.call(this, entity);
			if (result === true) {
				this.relayout();
			}

		},

		setOverflow: function(overflow) {

			if (
				(
					   overflow === true
					|| overflow === false
				) && this.overflow !== overflow
			) {

				this.overflow = overflow;

				return true;

			}


			return false;

		},

		setMargin: function(margin) {

			margin = typeof margin === 'number' ? margin : null;


			if (margin !== null) {

				this.margin = margin;
				return true;

			}


			return false;

		}

	};


	return Class;

});

