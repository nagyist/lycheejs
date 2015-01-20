
lychee.define('game.net.Server').requires([
	'lychee.data.BitON',
	'game.net.remote.Highscore',
	'game.net.remote.Ping'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _BitON     = lychee.data.BitON;
	var _highscore = game.net.remote.Highscore;
	var _ping      = game.net.remote.Ping;


	var Class = function(data) {

		var settings = lychee.extend({
			codec: _BitON
		}, data);


		lychee.net.Server.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('(Boilerplate) game.net.Server: Remote connected (' + remote.host + ':' + remote.port + ')');

			remote.addService(new _highscore(remote));
			remote.addService(new _ping(remote));

		}, this);

		this.bind('disconnect', function(remote) {

			console.log('(Boilerplate) game.net.Server: Remote disconnected (' + remote.host + ':' + remote.port + ')');

		}, this);


		this.connect();

	};


	Class.prototype = {

	};


	return Class;

});

