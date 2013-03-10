
lychee.define('game.entity.ui.Navigation').requires([
	'lychee.ui.Button',
	'lychee.ui.Input'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data, state) {

		this.state = state;


		var fonts = this.state.game.fonts;


		var settings = lychee.extend({}, data);


		lychee.ui.Layer.call(this, settings);


		var label = new lychee.ui.Button({
			font:  fonts.normal,
			label: 'Title:'
		});

		label.setPosition({
			x: -1/2 * this.width + label.width / 2,
			y: 0
		})

		this.addEntity(label);


		var title = new lychee.ui.Input({
			font:  fonts.normal,
			type:  lychee.ui.Input.TYPE.text,
			value: 'Empty Title',
			width: 200
		});

		title.setPosition({
			x: -1/2 * this.width + label.width + title.width / 2,
			y: 0
		});

		this.addEntity(title);


		this.__title = title;


		settings = null;

	};


	Class.prototype = {

		refresh: function(data) {

			if (typeof data.title === 'string') {
				this.__title.setValue(data.title);
			}

		}

	};


	return Class;

});

