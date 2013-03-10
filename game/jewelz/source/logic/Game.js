
lychee.define('game.logic.Game').requires([
	'game.logic.Level',
	'game.logic.Score',
	'lychee.game.Layer'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _score = game.logic.Score;


	var Class = function(game) {

		this.game  = game;
		this.score = new _score();

		this.__grid   = [];
		this.__level  = null;
		this.__sizeX  = 0;
		this.__sizeY  = 0;
		this.__tile   = 1;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */

		__processTouch: function(grid, id, position, delta) {

			if (this.__locked === true) return;


			var tile = this.__tile;

			var x = ((position.x + grid.width / 2) / tile) | 0;
			var y = ((position.y + grid.height / 2) / tile) | 0;


			if (this.__level !== null) {
				this.__locked = true;
				this.__level.touch(x, y);
			}

		},

		__processUnlock: function() {

			this.__locked = false;

		},

		__processSuccess: function(amount) {

			var time   = (amount - 3) * 1000;
			var points = amount * 100;
			for (var a = 3; a < amount; a++) {
				points += (amount - a) * 100;
			}

			this.score.add('time',   time);
			this.score.add('points', points);


			if (
				this.game.settings.sound === true
				&& this.game.jukebox !== undefined
			) {
				this.game.jukebox.play('success');
			}

		},

		__processFail: function(amount) {

			if (
				this.game.settings.sound === true
				&& this.game.jukebox !== undefined
			) {
				this.game.jukebox.play('fail');
			}

		},



		/*
		 * PUBLIC API
		 */

		enter: function(state, mode) {

			var tile = this.game.settings.tile;

			this.__tile = tile;


			if (this.__level !== null) {
				this.__level.unbind('success');
				this.__level.unbind('fail');
				this.__level.unbind('unlock');
			}


			this.__level = new game.logic.Level({
				bglayer: state.getLayer('gamebg'),
				fglayer: state.getLayer('gamefg'),
				mode:    mode,
				tile:    tile
			});


			this.__level.bind('unlock',  this.__processUnlock,  this);
			this.__level.bind('success', this.__processSuccess, this);
			this.__level.bind('fail',    this.__processFail,    this);


			var layer = state.getLayer('gamefg');
			if (layer !== null) {

				var root = layer.getEntity('root');
				if (root !== null) {

					root.unbind('touch', this.__processTouch, this);
					root.bind('#touch', this.__processTouch, this);

					this.__level.reset(
						(root.width  / tile)  | 0,
						(root.height / tile)  | 0
					);

				}

			}


			var data = this.__level.getData();

			this.score.reset({
				time:   data.time || 0,
				points: data.points || 0
			});

		},

		leave: function(state, data) {

			this.__tile  = 1;

		},

		update: function(clock, delta) {

			this.score.subtract('time', delta);

			if (this.score.get('time') < 0) {
				this.trigger('result', [ this.score.get() ]);
			}


			var level = this.__level;
			if (level !== null) {
				level.update(clock, delta);
			}

		}

	};


	return Class;

});

