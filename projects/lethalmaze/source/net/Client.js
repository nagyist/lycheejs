
lychee.define('game.net.Client').requires([
	'lychee.data.BitON',
	'game.net.client.Control'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data, main) {

		var settings = lychee.extend({
			codec:     lychee.data.BitON,
			reconnect: 10000
		}, data);


		lychee.net.Client.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new game.net.client.Control(this));

			if (lychee.debug === true) {
				console.log('game.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code) {

			if (lychee.debug === true) {
				console.log('game.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);

		this.bind('receive', function(data) {

			var service = this.getService('control');
			if (service !== null) {
				service.setSid(data.sid);
			}

		}, this);


		this.connect();

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.net.Client.prototype.serialize.call(this);
			data['constructor'] = 'game.net.Client';


			return data;

		}

	};


	return Class;

});

