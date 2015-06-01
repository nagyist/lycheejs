
lychee.define('game.ui.Messages').requires([
	'game.ui.Avatar'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, game, global, attachments) {

	var _font = attachments["fnt"];


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.avatar = null;
		this.cache  = {
			channel:  '#home',
			users:    [],
			messages: []
		};
		this.offset = {
			x: 0,
			y: 0
		};

		this.__buffer = null;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.game.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.Messages';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			var avatar   = this.avatar;
			var font     = _font;
			var position = this.position;
			var offset   = this.offset;
			var messages = this.cache.messages;


			var buffer = this.__buffer;
			if (buffer === null) {
				buffer = this.__buffer = renderer.createBuffer(this.width, this.height);
			}


			renderer.clear(buffer);
			renderer.setBuffer(buffer);


			var my1  = this.offset.y + this.height - 32;
			var mx1  = this.offset.x;
			var last = null;


			for (var m = messages.length - 1; m >= 0; m--) {

				var entry = messages[m];
				var color = entry.user === 'system' ? '#d0494b' : entry.user;


				if (avatar !== null && avatar.value === color) {

					renderer.setAlpha(0.2);
					renderer.drawBox(
						0,
						my1,
						this.width,
						my1 + 32,
						color,
						true
					);
					renderer.setAlpha(1);

				}


				renderer.drawCircle(
					mx1 + 32,
					my1 + 16,
					8,
					color,
					true
				);

				renderer.drawText(
					mx1 + 64,
					my1 + 16 - font.lineheight / 2,
					entry.message,
					font,
					false
				);


				if (last !== color) {

					renderer.drawLine(
						0,
						my1 + 32,
						this.width,
						my1 + 32,
						'#545857',
						1
					);

					last = color;

				}


				my1 -= 32;

			}


			renderer.setBuffer(null);


			var position = this.position;

			var x1 = position.x + offsetX - this.width  / 2;
			var y1 = position.y + offsetY - this.height / 2;


			renderer.drawBuffer(
				x1,
				y1,
				buffer
			);

		},



		/*
		 * CUSTOM API
		 */

		setAvatar: function(avatar) {

			avatar = lychee.interfaceof(game.ui.Avatar, avatar) ? avatar : null;


			if (avatar !== null) {

				this.avatar = avatar;

				return true;

			}


			return false;

		},

		setCache: function(cache) {

			cache = cache instanceof Object ? cache : null;


			if (cache !== null) {

				this.cache = cache;

				return true;

			}


			return false;

		}

	};


	return Class;

});

