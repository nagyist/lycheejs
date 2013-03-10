
lychee.define('game.webserver.mod.Redirect').requires([
	'game.webserver.Template'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(webserver) {

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		execute: function(host, url, callback) {

			var target = url;

			// Assume it's a local redirect
			if (url.charAt(0) === '/') {
				target = url.substr(host.root.length);
			}


			callback({
				status: 301,
				header: {
					'Location': target
				},
				body: ''
			});

		}

	};


	return Class;

});

