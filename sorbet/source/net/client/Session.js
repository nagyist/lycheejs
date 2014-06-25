
lychee.define('sorbet.net.client.Session').includes([
	'lychee.net.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		lychee.net.Service.call(this, 'session', client, lychee.net.Service.TYPE.client);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

	};


	return Class;

});

