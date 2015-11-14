
lychee.define('lychee.app.state.Menu').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Color',
	'lychee.ui.Background',
	'lychee.ui.Emblem',
	'lychee.ui.Label',
	'lychee.ui.Layer',
	'lychee.ui.Switch',
	'lychee.ui.Menu'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	var _blob = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.app.State.call(this, main);


		this.deserialize(_blob);



		/*
		 * INITIALIZATION
		 */

		var input = this.input;
		if (input !== null) {

			input.bind('escape', function(delta) {

				var entity = this.queryLayer('ui', 'menu');
				if (entity !== null) {

					if (entity.state === 'active') {

						entity.trigger('blur');

						if (this.__focus !== null) {
							this.__focus.trigger('blur');
						}

						this.__focus = this.queryLayer('ui', entity.value.toLowerCase());
						this.__focus.trigger('focus');

					} else {

						entity.trigger('focus');

						this.__focus = entity.getEntity('select');
						this.__focus.trigger('focus');

					}

				}

			}, this);

		}

		var viewport = this.viewport;
		if (viewport !== null) {

			viewport.relay('reshape', this.queryLayer('bg', 'background'));
			viewport.relay('reshape', this.queryLayer('bg', 'emblem'));
			viewport.relay('reshape', this.queryLayer('ui', 'menu'));

		}

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		serialize: function() {

			var data = lychee.app.State.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.state.Menu';


			return data;

		},

		deserialize: function(blob) {

			lychee.app.State.prototype.deserialize.call(this, blob);


			this.queryLayer('ui', 'menu').bind('change', function(value) {

				var others = this.getLayer('ui').entities.filter(function(entity) {
					return lychee.interfaceof(lychee.ui.Menu, entity) === false;
				});

				var entity = this.queryLayer('ui', value.toLowerCase());
				if (entity !== null) {

					others.forEach(function(other) {

						if (entity === other) {

							other.addEffect(new lychee.effect.Alpha({
								type:     lychee.effect.Alpha.TYPE.easeout,
								duration: 300,
								delay:    300,
								alpha:    1.0
							}));

						} else {

							other.addEffect(new lychee.effect.Alpha({
								type:     lychee.effect.Alpha.TYPE.easeout,
								duration: 300,
								alpha:    0.0
							}));

						}

					});

				}

			}, this);

		},

		update: function(clock, delta) {

			lychee.app.State.prototype.update.call(this, clock, delta);

		},

		enter: function(data) {

			lychee.app.State.prototype.enter.call(this);

		}

	};


	return Class;

});
