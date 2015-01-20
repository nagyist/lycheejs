
lychee.define('game.ui.Highscores').requires([
	'lychee.ui.Label'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, game, global, attachments) {

	var _font = attachments["fnt"];


	var Class = function(data, main) {

		var settings = lychee.extend({}, data);


		this.font = null;

		this.__client      = main.client;
		this.__initialized = false;
		this.__table       = [];


		this.setFont(settings.font || _font);

		delete settings.font;


		settings.width  = settings.width  || 416;
		settings.height = settings.height || 192;


		lychee.ui.Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {
			this.refresh();
		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.font instanceof Object) {
				this.font = lychee.deserialize(blob.font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.Highscores';

			var blob = data['blob'] || {};


			if (this.font !== null) {
				blob.font = lychee.serialize(this.font);
			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			var font  = this.font;
			var table = this.__table;
			if (font !== null) {

				var hw = this.width  / 2;
				var hh = this.height / 2;
				var x1 = position.x + offsetX - hw;
				var y1 = position.y + offsetY - hh;
				var x2 = position.x + offsetX + hw;
				var y2 = position.y + offsetY + hh;


				if (table.length > 0) {

					var ox = table[0][1].length * 12;
					var oy = 0;

					for (var t = 0, tl = table.length; t < tl; t++) {

						var user   = table[t][0];
						var score  = table[t][1];

						oy = t * 24;

						if (y1 + oy < y2) {

							renderer.drawText(
								x1,
								y1 + oy,
								user,
								font
							);

							renderer.drawText(
								x2 - ox,
								y1 + oy,
								score,
								font
							);

						}

					}

				} else {

					renderer.drawText(
						x1 + hw,
						y1 + hh,
						'Waiting for Multicast ...',
						font,
						true
					);

				}

			}


			if (alpha !== 1) {
				renderer.setAlpha(1);
			}

		},



		/*
		 * CUSTOM API
		 */

		refresh: function() {

			if (this.__initialized === false) {

				var service = this.__client.getService('highscore');
				if (service !== null) {

					service.bind('sync', function(data) {

                        var ol = data.objects.length;


						this.__table = [];

						for (var o2 = 0; o2 < ol; o2++) {

							var user  = '' + data.objects[o2].user;
							var score = '' + data.objects[o2].score;

							if (score.length < 8) {
								score = '00000000'.substr(0, 8 - score.length) + score;
							} else if (score.length > 8) {
								score = '_HAXXOR_';
							}

							this.__table.push([ user, score ]);

						}

						this.__table.sort(function(a, b) {
							if (a[1] < b[1]) return  1;
							if (a[1] > b[1]) return -1;
							return 0;
						});

					}, this);

					this.__initialized = true;

				}

			}

		},

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				return true;

			}


			return false;

		}

	};


	return Class;

});

