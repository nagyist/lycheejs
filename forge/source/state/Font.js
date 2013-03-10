
lychee.define('game.state.Font').requires([
	'lychee.ui.Button',
	'lychee.ui.Input',
	'lychee.ui.Slider',
	'game.state.Base',
	'game.entity.ui.Sidebar',
	'game.entity.ui.Widget'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global) {

	var _base = game.state.Base;

	var _sidebar = game.entity.ui.Sidebar;
	var _widget  = game.entity.ui.Widget;


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.reset();

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		reset: function() {

			_base.reset.call(this);


			this.__createSettingsWidget(
				'family',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Family'
				}),
				new lychee.ui.Input({
					font:  this.game.fonts.normal,
					type:  lychee.ui.Input.TYPE.text,
					value: 'Ubuntu Mono'
				})
			);

			this.__createSettingsWidget(
				'style',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Style'
				}),
				new lychee.ui.Select({
					font:    this.game.fonts.normal,
					options: [ 'normal', 'bold', 'italic' ],
					value:   'normal'
				})
			);

			this.__createSettingsWidget(
				'size',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Size'
				}),
				new lychee.ui.Slider({
					type: lychee.ui.Slider.TYPE.horizontal,
					range: {
						from:  1,
						to:    64,
						delta: 1
					},
					value: 32
				})
			);

			this.__createSettingsWidget(
				'spacing',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Spacing'
				}),
				new lychee.ui.Slider({
					type: lychee.ui.Slider.TYPE.horizontal,
					range: {
						from:  1,
						to:    64,
						delta: 1
					},
					value: 8
				})
			);

			this.__createSettingsWidget(
				'outline',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Outline'
				}),
				new lychee.ui.Slider({
					type: lychee.ui.Slider.TYPE.horizontal,
					range: {
						from:  1,
						to:    32,
						delta: 1
					},
					value: 2
				})
			);

			this.__createSettingsWidget(
				'color',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Color'
				}),
				new lychee.ui.Input({
					font:  this.game.fonts.normal,
					type:  lychee.ui.Input.TYPE.color,
					value: '#ffffff'
				})
			);

	   		this.__createSettingsWidget(
				'outlinecolor',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Outline Color'
				}),
				new lychee.ui.Input({
					font:  this.game.fonts.normal,
					type:  lychee.ui.Input.TYPE.color,
					value: '#000000'
				})
			);

		},

		enter: function(data) {


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {


			lychee.game.State.prototype.leave.call(this);

		},



		/*
		 * CUSTOM API
		 */

		__createSettingsWidget: function(property, label, entity) {

			property = typeof property === 'string'      ? property : null;
			label    = label instanceof lychee.ui.Button ? label    : null;
			entity   = entity !== undefined              ? entity   : null;


			if (
				   property !== null
				&& label !== null
				&& entity !== null
			) {

				var tile = 32;
				var settings = this.getLayer('ui').getEntity('settings');


				var widget = new _widget({
					margin: tile / 4
				});


				if (label !== null) {
					if (label.width === 0) label.width = settings.width;
					widget.addEntity(label);
				}

				if (entity !== null) {
					if (entity.width === 0)   entity.width = settings.width;
					widget.addEntity(entity);
				}


				settings.addEntity(widget);

			}

		}

	};


	return Class;

});

