
lychee.define('sorbet.net.client.Debugger').includes([
	'lychee.net.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	var Class = function(client) {

		lychee.net.Service.call(this, 'debugger', client, lychee.net.Service.TYPE.client);

	};


	Class.prototype = {

	};


	return Class;

});

