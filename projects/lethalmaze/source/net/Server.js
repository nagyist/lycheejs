
lychee.define('game.net.Server').requires([
	'lychee.data.BitON',
	'game.net.remote.Controller'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _BitON      = lychee.data.BitON;
	var _Controller = game.net.remote.Controller;


	var Class = function(data) {

		var settings = lychee.extend({
			codec: _BitON
		}, data);


		lychee.net.Server.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('(Lethal Maze) game.net.Server: Remote connected (' + remote.host + ':' + remote.port + ')');

			remote.addService(new _Controller(remote));

		}, this);

		this.bind('disconnect', function(remote) {

			console.log('(Lethal Maze) game.net.Server: Remote disconnected (' + remote.host + ':' + remote.port + ')');

		}, this);


		this.connect();

	};


	Class.prototype = {

	};


	return Class;

});

