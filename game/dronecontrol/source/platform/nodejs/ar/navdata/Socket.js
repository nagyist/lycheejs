
lychee.define('game.ar.navdata.Socket').tags({
	platform: [ 'nodejs' ]
}).requires([
	'game.ar.data.NAVDATA'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof Buffer !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var _dgram  = require('dgram');
	var _parser = game.ar.data.NAVDATA;


	var Class = function(ip) {

		this.__ip   = typeof ip === 'string' ? ip : '192.168.1.1';
		this.__port = 5554;

		this.__sequence = 0;


		var that = this;

		this.__raw = _dgram.createSocket('udp4');
		this.__raw.bind();
		this.__raw.on('message', function(buffer) {
			that.__processMessage(buffer);
		});


		// Request Navdata from Drone
		var buffer = new Buffer([1]);

		this.__raw.send(
			buffer,
			0,
			buffer.length,
			this.__port,
			this.__ip
		);


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		__processMessage: function(buffer) {

			var navdata = _parser.decode(buffer);

			if (
				navdata instanceof Object
				&& navdata.valid === true
			) {

				this.trigger('receive', [ navdata ]);

			}

		},

		close: function() {
			this.__raw.close();
		}

	};


	return Class;

});

