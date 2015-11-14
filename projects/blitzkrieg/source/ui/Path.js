
lychee.define('game.ui.Path').requires([
	'lychee.effect.Shake'
]).includes([
	'lychee.ui.Entity',
	'game.logic.Path'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(settings) {

		lychee.ui.Entity.call(this, settings);
		game.logic.Path.call(this, settings);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		render: function(renderer, offsetX, offsetY) {

		},

		update: function(clock, delta) {

		},



		/*
		 * CUSTOM API
		 */

		setPosition: function(position) {

			var buffer = this.buffer;
			var logic  = this.logic;

			var result = game.logic.Path.prototype.setPosition.call(this, position);
			if (logic !== null && result === true) {

				var b, bl, terrain;

				for (b = 0, bl = buffer.length; b < bl; b++) {

					terrain = logic.get(buffer[b], 'terrain');

					if (terrain !== null) {
						terrain.removeEffects();
					}

				}


				for (b = 0, bl = this.buffer.length; b < bl; b++) {

					terrain = logic.get(this.buffer[b], 'terrain');

					if (terrain !== null && terrain.effects.length === 0) {

						terrain.addEffect(new lychee.effect.Shake({
							type:     lychee.effect.Shake.TYPE.linear,
							delay:    b * 50,
							duration: 250,
							shake:    { y: 20 }
						}));

					}

				}


				logic.trigger('resort', []);

			}

		}

	};


	return Class;

});

