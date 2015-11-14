
lychee.define('sorbet.serve.API').requires([
	'lychee.data.JSON',
	'sorbet.serve.api.Asset',
//	'sorbet.serve.api.Console',
	'sorbet.serve.api.Profile',
	'sorbet.serve.api.Project',
	'sorbet.serve.api.Server'
]).exports(function(lychee, sorbet, global, attachments) {

	var _JSON = lychee.data.JSON;

	var _ADMIN  = {
		'Asset':   sorbet.serve.api.Asset,
		'Console': sorbet.serve.api.Console,
		'Profile': sorbet.serve.api.Profile,
		'Project': sorbet.serve.api.Project
	};

	var _PUBLIC = {
		'Server': sorbet.serve.api.Server
	};


	var Module = {

		can: function(host, url) {

			if (url.substr(0, 5) === '/api/') {
				return true;
			}


			return false;

		},

		process: function(host, url, data, ready) {

			var api  = url.split('/').pop().split('?')[0];
			var name = (data.headers.host || '');

			if (name === 'localhost:4848' && _ADMIN[api] !== undefined) {

				_ADMIN[api].process(host, url, data, ready);

			} else if (_PUBLIC[api] !== undefined) {

				_PUBLIC[api].process(host, url, data, ready);

			} else {

				ready({
					headers: { 'status': 404, 'content-type': 'application/json' },
					payload: _JSON.encode({
						error: 'API not found.'
					})
				});

			}

		}

	};


	return Module;

});

