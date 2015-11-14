
lychee.define('game.net.remote.Multiplayer').requires([
	'lychee.Storage'
]).includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _model = {
		id:       '127.0.0.1:1337',
		entities: [],
		time:     Date.now()
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		lychee.net.Service.call(this, 'highscore', remote, lychee.net.Service.TYPE.remote);


		this.storage = new lychee.Storage({
			id:    'blitzkrieg-multiplayer',
			model: _model
		});

	};


	Class.prototype = {

	};


	return Class;

});

