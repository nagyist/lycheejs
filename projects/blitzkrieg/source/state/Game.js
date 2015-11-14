
lychee.define('game.state.Game').requires([
	'lychee.app.Layer',
	'lychee.effect.Offset',
	'lychee.effect.Shake',
	'lychee.ui.Background',
	'game.ui.Button',
	'game.ui.Cursor',
	'game.ui.Overlay',
	'game.ui.Path',
	'game.entity.Emblem'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob  = attachments["json"].buffer;
	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};

	var _levels = {
		debug: attachments['debug.json'].buffer
	};



	/*
	 * HELPERS
	 */

	var _process_touch = function(id, position, delta, swipe) {

		this.loop.setTimeout(200, function() {

			if (this.__swiping === false) {

				var logic        = this.logic;
				var game_terrain = this.queryLayer('game', 'terrain');
				var ui_overlay   = this.queryLayer('ui',   'overlay');

				if (logic !== null && game_terrain !== null && ui_overlay !== null) {

					position.x -= game_terrain.offset.x;
					position.y -= game_terrain.offset.y;


					var tileposition = logic.toTilePosition(position, 'terrain');
					var object       = logic.get(tileposition, 'objects');
					var terrain      = logic.get(tileposition, 'terrain');

					logic.trigger('select', [ object, terrain, tileposition ]);

				}

			}

		}, this);

	};

	var _process_swipe = function(id, state, position, delta, swipe) {

		var terrain = this.queryLayer('game', 'terrain');
		var objects = this.queryLayer('game', 'objects');
		var ui      = this.queryLayer('ui',   'game');

		if (this.__scrolling === false && state === 'move') {
			this.__swiping = true;
		}

		if (this.__scrolling === false && state === 'end') {

			var tile = this.main.TILE;
			if (Math.abs(swipe.x) < tile.width && Math.abs(swipe.y) < tile.offset) {
				this.__swiping = false;
				return;
			}


			var ox = terrain.offset.x;
			var oy = terrain.offset.y;
			var tx = ox + swipe.x;
			var ty = oy + swipe.y;
			var dx = this.renderer.width  - terrain.width;
			var dy = this.renderer.height - terrain.height;


			var bx1 = -1/2 * Math.abs(dx);
			var bx2 =  1/2 * Math.abs(dx);
			var by1 = -1/2 * Math.abs(dy);
			var by2 =  1/2 * Math.abs(dy);
			var tx2 = Math.min(Math.max(tx, bx1), bx2);
			var ty2 = Math.min(Math.max(ty, by1), by2);


			var type = lychee.effect.Offset.TYPE.easeout;
			if ((tx !== tx2 && Math.abs(ty) > Math.abs(tx)) || (ty !== ty2 && Math.abs(tx) > Math.abs(ty))) {
				type = lychee.effect.Offset.TYPE.bounceeaseout;
			}


			terrain.addEffect(new lychee.effect.Offset({
				type:     type,
				duration: 500,
				offset:   {
					x: tx2,
					y: ty2
				}
			}));

			objects.addEffect(new lychee.effect.Offset({
				type:     type,
				duration: 500,
				offset:   {
					x: tx2,
					y: ty2
				}
			}));

			ui.addEffect(new lychee.effect.Offset({
				type:     type,
				duration: 500,
				offset:   {
					x: tx2,
					y: ty2
				}
			}));


			this.__scrolling = true;

			this.loop.setTimeout(500, function() {
				this.__swiping   = false;
				this.__scrolling = false;
			}, this);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.app.State.call(this, main);


		this.logic = main.logic || null;

		this.__swiping   = false;
		this.__scrolling = false;


		this.deserialize(_blob);



		/*
		 * INITIALIZATION
		 */

		var viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				var renderer = this.renderer;
				if (renderer !== null) {

					var entity = null;
					var width  = renderer.width;
					var height = renderer.height;


					entity = this.getLayer('background');
					entity.width  = width;
					entity.height = height;

					entity = this.queryLayer('background', 'background');
					entity.width  = width;
					entity.height = height;

					entity = this.getLayer('ui');
					entity.width  = width;
					entity.height = height;

					entity = this.queryLayer('ui', 'background');
					entity.width  = width;
					entity.height = height;

					entity = this.queryLayer('ui', 'emblem');
					entity.position.x = 1/2 * width - 128;
					entity.position.y = 1/2 * height - 32;

					entity = this.queryLayer('ui', 'overlay');
					entity.width      = width;
					entity.height     = 128;
					entity.position.y = height / 2 - 64;
					entity.reshape();

				}

			}, this);

		}

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.app.State.prototype.deserialize.call(this, blob);

		},

		enter: function(data) {

			var settings = lychee.extend({
				level: 'debug'
			}, data);


			lychee.app.State.prototype.enter.call(this);


			var logic = this.logic;
			if (logic !== null) {

				var level = lychee.deserialize(_levels[settings.level] || null);
				if (level !== null) {

					logic.enter(this, level);


					var game_terrain = this.queryLayer('game', 'terrain');
					var ui_game      = this.queryLayer('ui',   'game');
					var ui_overlay   = this.queryLayer('ui',   'overlay');

					if (game_terrain !== null && ui_game !== null) {

						ui_game.width  = game_terrain.width;
						ui_game.height = game_terrain.height;
						ui_game.bind('touch', _process_touch, this);

					}

					if (ui_overlay !== null) {

						ui_overlay.bind('#action', function(overlay, action) {
							this.trigger(action, []);
						}, logic);

					}

				}

			}


			this.input.bind('swipe', _process_swipe, this);

		},

		leave: function() {

			lychee.app.State.prototype.leave.call(this);


			var ui_game = this.queryLayer('ui', 'game');
			if (ui_game !== null) {
				ui_game.unbind('touch', _process_touch, this);
			}

			var ui_overlay = this.queryLayer('ui', 'overlay');
			if (ui_overlay !== null) {
				ui_overlay.bind('action', _process_action, this);
			}


			var logic = this.logic;
			if (logic !== null) {
				logic.leave();
			}

			this.input.unbind('swipe', _process_swipe, this);

		},

		update: function(clock, delta) {

			this.logic.update(clock, delta);
			lychee.app.State.prototype.update.call(this, clock, delta);

		}

	};


	return Class;

});
