
lychee.define('game.demo.RoomService').requires([
	'lychee.ui.Layer',
	'lychee.ui.Button',
	'lychee.ui.Input',
	'lychee.ui.Textarea',
	'lychee.net.client.RoomService',
	'lychee.net.Client'
]).includes([
	'game.demo.Base'
]).exports(function(lychee, game, global, attachments) {

	var _base = game.demo.Base;

	var Demo = function(state) {

		_base.call(this, state);



		this.__client  = null;
		this.__service = null;
		this.__mode    = 'login';


		var client = new lychee.net.Client(
			JSON.stringify, JSON.parse
		);

		client.bind('connect', function() {

			var service = new lychee.net.client.RoomService(client);

			// service.bind('ready', function() {
			// 	service.enter();
			// }, this);

			service.bind('refresh', this.__refresh, this);

			client.plug(service);
			this.__service = service;

		}, this);

		client.bind('disconnect', function(code, reason) {

			console.warn('Disconnect', code, reason);

		}, this);

		client.listen(
			this.state.game.settings.port,
			this.state.game.settings.host
		);


		this.__client = client;


		this.reset();

	};

	Demo.TITLE = 'lychee.net: RoomService';

	Demo.prototype = {

		reset: function() {

			var layer  = this.state.getLayer('demo');

			var fonts  = this.state.game.fonts;
			var env    = this.state.renderer.getEnvironment();
			var width  = env.width;
			var height = env.height;


			if (this.__mode === 'login') {

				var login = new lychee.ui.Layer({
					width: 400,
					height: 96,
					position: {
						x: 0,
						y: 0
					}
				});

				layer.addEntity(login);

				this.__entities.login = login;


				var username = new lychee.ui.Input({
					font: fonts.normal,
					type: lychee.ui.Input.TYPE.text,
					value: 'Enter your name',
					width: 400,
					height: 48,
					position: {
						x: 0,
						y: -24
					}
				});

				var button = new lychee.ui.Button({
					label: 'Connect',
					font: fonts.normal,
					position: {
						x: 0,
						y: 24
					}
				});

				button.bind('touch', function() {

					var user = username.value;
					if (
						typeof user === 'string'
						&& user !== 'Enter your name'
					) {

						if (this.__service !== null) {
							this.__service.enter(user, 0);
						}

					}

				}, this);


				login.addEntity(username);
				login.addEntity(button);


			} else if (this.__mode === 'chat') {

				if (this.__entities.login !== undefined) {
					layer.removeEntity(this.__entities.login);
					delete this.__entities.login;
				}


				var chat = new lychee.ui.Layer({
					width:  width,
					height: height,
					position: {
						x: 0,
						y: 0
					}
				});

				layer.addEntity(chat);


				var messages = new lychee.ui.Textarea({
					font:   fonts.small,
					value:  '',
					width:  width * 0.6,
					height: height * 0.8,
					position: {
						x: 0,
						y: 0
					}
				});

				chat.addEntity(messages);


				var message = new lychee.ui.Input({
					font:   fonts.small,
					value:  'Hello :)',
					width:  width * 0.6,
					height: 24,
					position: {
						x: 0,
						y: height * 0.46
					}
				});

				message.bind('blur', function() {

					var value = message.value;

					if (this.__service !== null) {
						this.__service.message(value);
						message.setValue('');
					}

				}, this);

				chat.addEntity(message);


				this.__entities.chat     = chat;
				this.__entities.messages = messages;
				this.__entities.message  = message;

			}

		},

		__refresh: function(userId, roomId, users, messages) {

			if (this.__mode === 'login') {
				this.__mode = 'chat';
				this.reset();
			}


			var entity = this.__entities.messages;
			if (
				entity !== undefined
				&& this.__mode === 'chat'
			) {

				var strvalue = '';
				for (var m = 0, ml = messages.length; m < ml; m++) {
					var message = messages[m];
					strvalue += message.user + ': ' + message.content + '\n';
				}

				entity.setValue(strvalue);

			}

		}

	};


	return Demo;

});

