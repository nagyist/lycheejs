
lychee.define('game.state.Scene').requires([
	'game.entity.ui.Navigation',
	'game.entity.ui.Properties',
	'game.entity.ui.Sandbox'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _ui    = game.entity.ui;
	var _main  = game.Main;


	var _resolve_constructor = function(identifier, scope) {

		var pointer = scope;

		var ns = identifier.split('.');
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = null;
				break;
			}

		}


		return pointer;

	};


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.__buffer = null;

		this.__entities = {
			layers:     null,
			navigation: null,
			properties: null
		};


		this.reset();

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		reset: function() {

			var env    = this.renderer.getEnvironment();
			var width  = env.width;
			var height = env.height;


			// TODO: Make this more generic,
			// dependent on current screen
			// resolution and dpi-resolution
			var tile = 32;


			this.removeLayer('ui');


			var layer = new lychee.game.Layer();


			var navigation = new _ui.Navigation({
				width:    width - tile * 12,
				height:   2 * tile,
				position: {
					x: 0,
					y: -1/2 * height + tile
				},
				scrollable: false
			}, this);

			layer.addEntity(navigation);


			var layers = new _ui.Layers({
				width:    tile * 6,
				height:   height,
				position: {
					x: -1/2 * width + 3 * tile,
					y: 0
				},
				scrollable: false
			}, this);

			layer.addEntity(layers);


			var properties = new _ui.Properties({
				width:    tile * 6,
				height:   height,
				position: {
					x: 1/2 * width - 3 * tile,
					y: 0
				},
				scrollable: false
			}, this);

			layer.addEntity(properties);


			this.__buffer = this.renderer.createBuffer(
				width - tile * 12,
				height - tile * 2
			);

/*
			var sandbox = new _ui.Sandbox({
				width: width - tile * 12,
				height: height - tile * 2,
				position: {
					x: 0,
					y: tile
				}
			}, this);

			layer.addEntity(sandbox);
*/

			navigation.bind('select', function(project) {
				this.game.builder.build(project);
			}, this);

			layers.bind('select', function(layer, entity) {
				properties.refresh(layer, entity);
			}, this);

			properties.bind('change', function(layer, entity, diff) {
				console.log('CHANGES: ', layer, entity, diff);
			}, this);


			this.__entities.layers     = layers;
			this.__entities.navigation = navigation;
			this.__entities.properties = properties;


			this.setLayer('ui', layer);

		},

		render: function(clock, delta) {

			lychee.game.State.prototype.render.call(this, clock, delta);


			if (
				this.renderer !== null
				&& this.__buffer !== null
			) {

				var x1 = this.__buffer.width / 2;
				var y1 = this.__buffer.height / 2;

				this.renderer.drawBuffer(
					x1,
					y1,
					this.__buffer
				);

			}

		},

		enter: function(project) {

			this.game.builder.bind('build', this.__processBuild, this);
			this.game.builder.build(project);


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			this.game.builder.unbind('build', this.__processBuild, this);


			lychee.game.State.prototype.leave.call(this);

		},



		/*
		 * PRIVATE API
		 */

		__processBuild: function(environment, sandbox) {

			var base = environment.bases.game;

			// This will modify game/[id]/source to game/[id]/asset
			base = base.split('/');
			base.pop();
			base.push('asset');
			base = base.join('/');


			with (sandbox) {

				var main = new game.Main({
					base: base
				});

				if (main.renderer !== null) {

					var id = main.settings.renderer.id;
					var element = document.getElementById(id);
					if (element !== null) {

						element.style.cssText = '';

// TODO: HTML HACKS

					}

				}

//				if (main.renderer !== null) {
//					main.renderer.setBuffer(this.__buffer);
//				}

				main.viewport.unbind('reshape');

			}

console.log('SANDBOXED BUILD READY', environment, sandbox);

		}

	};


	return Class;

});
