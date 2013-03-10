
lychee.define('game.state.Test').requires([
	'lychee.ui.Input',
	'lychee.ui.Select',
	'lychee.ui.Slider',
	'lychee.ui.Textarea'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.__locked = false;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

			var env    = this.renderer.getEnvironment();
			var width  = env.width;
			var height = env.height;


			var layer = new lychee.game.Layer();


			layer.addEntity(new lychee.ui.Slider({
				type: lychee.ui.Slider.TYPE.horizontal,
				range: {
					from:  0,
					to:    360,
					delta: 10
				},
				position: {
					x: -1/2 * width + 128 + 32,
					y: 100
				},
				value: 180
			}));

			layer.addEntity(new lychee.ui.Slider({
				type: lychee.ui.Slider.TYPE.vertical,
				range: {
					from:  -20,
					to:     50,
					delta:  5
				},
				position: {
					x: -1/2 * width + 256 + 32 - 24,
					y: 100 - 128 - 32
				},
				value: 0
			}));

			layer.addEntity(new lychee.ui.Textarea({
				font:   this.game.fonts.normal,
				value:  ':)',
				position: {
					x: -100,
					y: -100
				}
			}));

			layer.addEntity(new lychee.ui.Input({
				font: this.game.fonts.normal,
				type: lychee.ui.Input.TYPE.text,
				value: 'test',
				position: {
					x: -100,
					y: 50
				}
			}));

			layer.addEntity(new lychee.ui.Input({
				font: this.game.fonts.normal,
				type: lychee.ui.Input.TYPE.number,
				value: 12345,
				min: 123,
				max: 12347,
				position: {
					x: -100,
					y: 100
				}
			}));

			layer.addEntity(new lychee.ui.Select({
				font: this.game.fonts.normal,
				options: [ 'foo', 'bar', 'foobar' ],
				position: {
					x: -100,
					y: 150
				}
			}));


			this.setLayer('ui', layer);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
