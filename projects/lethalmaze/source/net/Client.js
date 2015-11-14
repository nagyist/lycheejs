
lychee.define('game.net.Client').requires([
	'lychee.data.BitON',
	'game.net.client.Controller'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _BitON      = lychee.data.BitON;
	var _Controller = game.net.client.Controller;


	var Class = function(data, main) {

		var settings = lychee.extend({
			codec:     _BitON,
			reconnect: 10000
		}, data);


		lychee.net.Client.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _Controller(this));

			if (lychee.debug === true) {
				console.log('(Lethal Maze) game.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code) {

			if (lychee.debug === true) {
				console.log('(Lethal Maze) game.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);

		this.bind('receive', function(data) {

			var service = this.getService('controller');
			if (service !== null) {
				service.setSid(data.sid);
			}

		}, this);


		this.connect();

	};


	Class.prototype = {

	};


	return Class;

});

