
lychee.define('sorbet.module.Log').requires([
	'lychee.Storage'
]).exports(function(lychee, sorbet, global, attachments) {

	var _rules = {
		'device':  {},
		'browser': {},
		'os':      {}
	};

	(function(database) {

		for (var module in database) {

			if (module === 'version') continue;

			for (var identifier in database[module]) {
				_rules[module][identifier] = new RegExp(database[module][identifier]);
			}

		}

	})(attachments['json'].buffer);



	/*
	 * HELPERS
	 */

	var _get_os = function(ua) {

		var found = 'Unknown';

		for (var name in _rules.os) {

			if (_rules.os[name].test(ua) === true) {
				found = name;
				break;
			}

		}

		return found;

	};

	var _get_device = function(ua) {

		var found = 'Unknown';

		for (var name in _rules.device) {

			if (_rules.device[name].test(ua) === true) {
				found = name;
				break;
			}

		}

		return found;

	};

	var _get_browser = function(ua) {

		var found = 'Unknown';

		for (var name in _rules.browser) {

			if (_rules.browser[name].test(ua) === true) {
				found = name;
				break;
			}

		}

		return found;

	};

	var _get_project = function(url, parameters) {

		var tmp, id;

		if (url === '/api/Server') {

			tmp = parameters.split('identifier=')[1] || null;
			if (tmp !== null) {

				id = tmp.split('&')[0] || null;
				if (id !== null) {
					return id;
				}

			}

		} else {

			tmp = url.split('/');
			if (tmp.pop() === 'index.html') {

				id = tmp.pop();
				if (id === 'source') {
					id = tmp.pop();
				}

				return id;
			}

		}


		return null;

	};

	var _validate_remote = function(remote) {

		remote = typeof remote === 'string' ? remote : null;


		if (remote !== null) {

			var regexp  = new RegExp("(^127\.*)|(^10\.*)|(^192\.168\.*)|(^172\.(1[6-9]|2[0-9]|3[01]))", "g");
			if (regexp.test(remote) === false) {
				return true;
			}

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var _model = {
		id:        'boilerplate-' + Date.now(),
		host:      'localhost',
		project:   'boilerplate',
		browser:   'Unknown',
		device:    'Unknown',
		os:        'Unknown',
		useragent: 'Unknown',
		remote:    '127.0.0.1',
		time:      Date.now()
	};

	var Class = function(main) {

		this.id      = 'Log';
		this.main    = main || null;

		this.storage = new lychee.Storage({
			id:    'sorbet-log',
			model: _model,
			type:  lychee.Storage.TYPE.persistent
		});

	};


	Class.prototype = {

		/*
		 * MODULE API
		 */

		process: function(vhost, response, data) {
			return false;
		},



		/*
		 * CUSTOM API
		 */

		report: function(vhost, data) {

			var resolved = vhost.fs.resolve(vhost.root + '/sorbet/public' + data.url);
			if (resolved === null) {
				resolved = vhost.fs.resolve(vhost.root + data.url);
			}


			var host      = data.host || null;
			var project   = _get_project(resolved || data.url, data.parameters);
			var remote    = data.remote || null;
			var useragent = data.useragent || null;

			if (host !== null && project !== null && remote !== null) {

				if (_validate_remote(remote) === true) {

					var object = lychee.extend(this.storage.create(), {
						id:        project + '-' + Date.now(),
						host:      host,
						project:   project,
						browser:   _get_browser(data.useragent),
						device:    _get_device(data.useragent),
						os:        _get_os(data.useragent),
						useragent: useragent,
						remote:    remote,
						time:      Date.now()
					});

					this.storage.insert(object);


					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

