
lychee.define('game.net.Server').requires([
	'lychee.data.BitON',
	'game.net.remote.Control'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({
			codec: lychee.data.BitON
		}, data);


		lychee.net.Server.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('game.net.Server: Remote connected (' + remote.host + ':' + remote.port + ')');

			remote.addService(new game.net.remote.Control(remote));

		}, this);

		this.bind('disconnect', function(remote) {

			console.log('game.net.Server: Remote disconnected (' + remote.host + ':' + remote.port + ')');

		}, this);


		this.connect();

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.net.Server.prototype.serialize.call(this);
			data['constructor'] = 'game.net.Server';


			return data;

		}

	};


	return Class;

});

