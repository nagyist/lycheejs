
lychee.define('game.net.Server').requires([
	'lychee.data.BitON',
	'game.net.remote.Multiplayer'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _BitON       = lychee.data.BitON;
	var _multiplayer = game.net.remote.Multiplayer;


	var Class = function(data) {

		var settings = lychee.extend({
			codec: _BitON
		}, data);


		lychee.net.Server.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('(Blitzkrieg) game.net.Server: Remote connected (' + remote.host + ':' + remote.port + ')');

			remote.addService(new _multiplayer(remote));

		}, this);

		this.bind('disconnect', function(remote) {

			console.log('(Blitzkrieg) game.net.Server: Remote disconnected (' + remote.host + ':' + remote.port + ')');

		}, this);


		this.connect();

	};


	Class.prototype = {

	};


	return Class;

});

