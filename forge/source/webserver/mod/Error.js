
lychee.define('game.webserver.mod.Error').requires([
	'game.webserver.Template'
]).exports(function(lychee, game, global, attachments) {

	var _html     = attachments['html'] || null;
	var _template = game.webserver.Template;


	var Class = function(webserver) {

		this.__template  = null;
		this.__webserver = webserver;


		if (_html !== null) {
			this.__template = new _template(_html);
		}

	};


	Class.STATUS = {
		400: 'I could not understand the Request.',
		401: 'You have no authorization to process this Request.',
//		402: 'Payment Required',
		403: 'This Request is forbidden.',
		404: 'The requested file you were looking for could not be found.',
		405: 'The requested Method is not allowed.',
//		406: 'Not Acceptable.',
//		407: 'You need to authorize to the Proxy before.',
//		408: 'Request Timeout',
		409: 'There was an access conflict for the requested resource.',
		410: 'Oh noez! The requested resource has disappeared!',
//		411: 'Length Required',
//		412: 'Precondition Failed',
//		413: 'Request Entity Too Large',
//		414: 'Request-URI Too Long',
		415: 'Unsupported Media Type',
//		416: 'Request Range Not Statisfiable',
		417: 'Expectation Failed',
		500: 'Damn. You broke it!'
	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		execute: function(code, host, url, callback) {

			code = typeof code === 'number'                        ? code      : 500;
			host = (host != null && typeof host.host === 'string') ? host.host : null;


			if (lychee.debug === true) {
				console.error('game.webserver.mod.Error: ' + code + ' for "' + host + ' , ' + url + '"');
			}


			var webserver = this.__webserver;


			var content = '';

			if (this.__template !== null) {

				var message = Class.STATUS[code];


				try {

					content = this.__template.render({
						code: code,
						message: message,
						webserver_version: webserver.version
					});

				} catch(e) {

					content = '';

				}

			}


			callback({
				status: code,
				header: {
					'Content-Type':   'text/html',
					'Content-Length': content.length
				},
				body: content
			});

		}

	};


	return Class;

});

