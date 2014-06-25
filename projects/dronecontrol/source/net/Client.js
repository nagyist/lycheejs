
lychee.define('game.net.Client').requires([
	'lychee.data.BitON',
	'game.net.client.Control'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _BitON   = lychee.data.BitON;
	var _control = game.net.client.Control;


	var Class = function(settings) {

		lychee.net.Client.call(this, {
			encoder: settings.encoder || _BitON.encode,
			decoder: settings.decoder || _BitON.decode
		});


		this.bind('connect', function() {

			this.addService(new _control(this));

		}, this);

		this.bind('disconnect', function(code, reason) {

			console.log('Client disconnected!', code, reason);

		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});

