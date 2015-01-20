
lychee.define('sorbet.net.remote.Service').includes([
	'lychee.net.Service'
]).requires([
	'lychee.Storage'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		lychee.net.Service.call(this, 'service', remote, lychee.net.Service.TYPE.remote);

	};


	Class.prototype = {

	};


	return Class;

});

