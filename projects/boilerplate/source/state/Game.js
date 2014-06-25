
lychee.define('game.state.Game').requires([
	'lychee.ui.Button',
	'lychee.ui.Layer',
	'game.entity.Button',
	'game.entity.Circle'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob  = attachments["json"].buffer;
	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};


	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.intervalId = null;


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.width;
				var height = renderer.height;


				entity = this.queryLayer('ui', 'button');
				entity.position.y = 1/2 * height - 42;

			}

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);


			var circle = this.queryLayer('ui', 'circle');
			if (circle !== null) {
				circle.setColor('#888888', true);
			}


			var entity  = null;
			var service = this.client.getService('ping');
			if (service !== null) {

				entity = this.queryLayer('ui', 'statistics');

				service.bind('unplug', function() {
					this.setLabel('Ping: - ms / - ms');
				}, entity);

				service.bind('statistics', function(ping, pong) {
					this.setLabel('Ping: ' + ping + ' ms / ' + pong + ' ms');
				}, entity);

			}


			var loop = this.loop;
			if (loop !== null) {

				this.intervalId = loop.setInterval(1000, function() {

					var client = this.client;
					if (client !== null) {

						var service = this.client.getService('ping');
						if (service !== null) {
							service.ping();
						}

					}

				}, this);

			}

		},

		leave: function() {

			var loop = this.loop;
			if (loop !== null) {
				loop.removeInterval(this.intervalId);
			}


			var entity  = null;
			var service = this.client.getService('ping');
			if (service !== null) {

				entity = this.queryLayer('ui', 'statistics');

				service.unbind('unplug',     null, entity);
				service.unbind('statistics', null, entity);

			}


			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
