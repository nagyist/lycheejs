
lychee.define('sorbet.net.remote.Session').includes([
	'lychee.net.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		lychee.net.Service.call(this, 'session', remote, lychee.net.Service.TYPE.remote);

	};


	Class.prototype = {

	};


	return Class;

});

