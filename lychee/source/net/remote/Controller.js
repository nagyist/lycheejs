
lychee.define('lychee.net.remote.Controller').includes([
	'lychee.net.remote.Session'
]).exports(function(lychee, global, attachments) {

	var Class = function(id, remote, data) {

		id = typeof id === 'string' ? id : 'controller';


		var settings = lychee.extend({}, data);


		lychee.net.remote.Session.call(this, id, remote, settings);

		settings = null;

	};

});

