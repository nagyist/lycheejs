
lychee.define('game.state.Chat').requires([
	'lychee.effect.Color',
	'lychee.effect.Offset',
	'lychee.game.Background',
	'lychee.ui.Button',
	'lychee.ui.Select',
	'lychee.ui.Slider',
	'lychee.ui.Textarea',
	'game.ui.Avatar',
	'game.ui.Messages'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob   = attachments["json"].buffer;
	var _sounds = {
		join_empty: attachments["join_empty.snd"],
		join_full:  attachments["join_full.snd"],
		message:    attachments["message.snd"]
	};



	/*
	 * HELPERS
	 */

	var _get_user_diff = function(users) {

		var raw = this.__cache.users;


		return users.filter(function(usr) {

			if (raw.indexOf(usr) !== -1) {
				return false;
			}

			return true;

		});

	};

	var _get_message_diff = function(messages) {

		var raw = this.__cache.messages.map(function(obj) {
			return obj.message;
		});


		return messages.map(function(obj) {
			return obj.message;
		}).filter(function(msg) {

			if (raw.indexOf(msg) !== -1) {
				return false;
			}

			return true;

		});

	};

	var _on_sync = function(room) {

		var background = this.queryLayer('background', 'background');
		if (background !== null) {

			if (background.effects.length === 0) {

				background.color = '#32afe5',
				background.addEffect(new lychee.effect.Color({
					type:     lychee.effect.Color.TYPE.easeout,
					duration: 300,
					color:    '#404948'
				}));

			}

		}


		var channel = '#home';
		var entity  = this.queryLayer('ui', 'channel');
		if (entity !== null) {
			channel = entity.value;
		}


		if (this.__cache.channel !== channel) {

			this.__cache.channel  = channel;
			this.__cache.messages = [{
				user:    'system',
				message: 'You are now chatting in ' + channel
			}];


			this.loop.setTimeout(100, function() {
				this.queryLayer('ui', 'slider').setValue(100);
			}, this);


			if (room.users.length > 1) {
				this.jukebox.play(_sounds.join_full);
			} else {
				this.jukebox.play(_sounds.join_empty);
			}

		}


		var user_diff = _get_user_diff.call(this, room.users);
		if (user_diff.length > 0) {
			this.__cache.users = room.users;
		}


		var message_diff = _get_message_diff.call(this, room.messages);
		if (message_diff.length > 0) {

			var found = false;

			room.messages.forEach(function(obj) {

				var index = this.__cache.messages.map(function(o) {
					return o.message;
				}).indexOf(obj.message);

				if (index === -1) {
					this.__cache.messages.push(obj);
					found = true;
				}

			}.bind(this));


			if (found === true) {
				this.jukebox.play(_sounds.message);
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.__cache = {
			channel:  '#home',
			users:    [],
			messages: [{
				user:    'system',
				message: 'Welcome to the lycheeJS Anonymous Chat.'
			}, {
				user:    'system',
				message: 'Touch on lycheeJS logo to randomize username.'
			}]
		};


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


					entity = this.queryLayer('ui', 'background');
					entity.width  = width;
					entity.position.y = 1/2 * height - entity.height / 2;

					entity = this.queryLayer('ui', 'channel');
					entity.position.y = 1/2 * height - 32 - entity.height / 2;

					entity = this.queryLayer('ui', 'message');
					entity.position.y = 1/2 * height - 32 - entity.height / 2;

					entity = this.queryLayer('ui',  'avatar');
					entity.position.y = 1/2 * height - 128;

					entity = this.queryLayer('ui',  'button');
					entity.position.y = 1/2 * height - 64;

					entity = this.queryLayer('ui', 'messages');
					entity.width  = width;
					entity.height = height - 192;
					entity.position.y = -192/2;

					entity = this.queryLayer('ui', 'slider');
					entity.height = height - 192;
					entity.position.x = 1/2 * width - entity.width - 16;
					entity.position.y = -192/2;
					entity.setValue(entity.value);

				}

			}, this);

		}

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		serialize: function() {

			var data = lychee.game.State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Chat';


			return data;

		},

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			var entity = null;


			entity = this.queryLayer('ui', 'channel');
			entity.bind('change', function(value) {

				var service = this.client.getService('chat');
				if (service !== null) {
					service.setRoom(value);
				}

			}, this);

			entity = this.queryLayer('ui',  'avatar');
			entity.bind('change', function(value) {

				var service = this.client.getService('chat');
				if (service !== null) {
					service.setUser(value);
				}

			}, this);

			entity = this.queryLayer('ui',  'button');
			entity.bind('touch', function() {

				var message = this.queryLayer('ui', 'message');
				var service = this.client.getService('chat');

				if (message !== null && service !== null) {
					service.message(message.value);
					message.setValue('');
				}

			}, this);

			entity = this.queryLayer('ui', 'messages');
			entity.setAvatar(this.queryLayer('ui', 'avatar'));
			entity.setCache(this.__cache);

			entity = this.queryLayer('ui', 'slider');
			entity.bind('change', function(value) {

				var index = (100 - value) / 100;
				var layer = this.queryLayer('ui', 'messages');

				if (layer !== null) {

					layer.addEffect(new lychee.effect.Offset({
						type:     lychee.effect.Offset.TYPE.easeout,
						duration: 500,
						offset: {
							y: index * (this.__cache.messages.length * 32 - layer.height)
						}
					}));
				}

			}, this);

		},

		update: function(clock, delta) {

			lychee.game.State.prototype.update.call(this, clock, delta);

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);


			var service = this.client.getService('chat');
			if (service !== null) {

				var user = this.queryLayer('ui', 'avatar').value;
				var room = this.queryLayer('ui', 'channel').value;

				service.setUser(user);
				service.setRoom(room);
				service.bind('sync', _on_sync, this);

			}

		},

		leave: function() {

			var service = this.client.getService('chat');
			if (service !== null) {
				service.unbind('sync', _on_sync, this);
			}


			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
