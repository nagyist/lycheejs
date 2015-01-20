
lychee.define('sorbet.net.client.Service').includes([
	'lychee.net.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	var Class = function(client) {

		lychee.net.Service.call(this, 'service', client, lychee.net.Service.TYPE.client);

	};


	Class.prototype = {

	};


	return Class;

});

