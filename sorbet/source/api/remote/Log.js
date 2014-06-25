
lychee.define('sorbet.api.remote.Log').includes([
	'sorbet.api.remote.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _serialize_vlog = function(vlog) {

		return {
			'identifier':  vlog.id        || null,
			'virtualhost': vlog.host      || null,
			'project':     vlog.project   || null,
			'browser':     vlog.browser   || null,
			'device':      vlog.device    || null,
			'os':          vlog.os        || null,
			'useragent':   vlog.useragent || null,
			'remote':      vlog.remote    || null,
			'time':        vlog.time      || null
		};

	};

	var _get_logs = function(filters) {

		var vlogs = this.storage.filter(function(index, object) {

			return (
				   (filters.identifier === null  || object.id === filters.identifier)
				&& (filters.virtualhost === null || object.host === filters.virtualhost)
				&& (filters.project === null     || object.project === filters.project)
				&& (filters.browser === null     || object.browser === filters.browser)
				&& (filters.device === null      || object.device === filters.device)
				&& (filters.os === null          || object.os === filters.os)
				&& (filters.remote === null      || object.remote === filters.remote)
			);

		});


		var filtered = [];

		for (var v = 0, vl = vlogs.length; v < vl; v++) {
			filtered.push(_serialize_vlog(vlogs[v]));
		}

		filtered.sort(function(a, b) {
			if (a.project < b.project) return -1;
			if (a.project > b.project) return  1;
			return 0;
		});


		return filtered;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id   = 'Log';
		this.main = main;

		this.storage = new lychee.Storage({
			id:   'sorbet-log',
			type: lychee.Storage.TYPE.persistent
		});


		sorbet.api.remote.Service.call(this, {
			'PATCH': false,
			'POST':  false,
			'PUT':   false
		});



		/*
		 * INITIALIZATION
		 */

		this.bind('GET', function(vhost, filters, response) {

			filters.identifier  = typeof filters.identifier === 'string'  ? filters.identifier  : null;
			filters.virtualhost = typeof filters.virtualhost === 'string' ? filters.virtualhost : null;
			filters.project     = typeof filters.project === 'string'     ? filters.project     : null;
			filters.browser     = typeof filters.browser === 'string'     ? filters.browser     : null;
			filters.device      = typeof filters.device === 'string'      ? filters.device      : null;
			filters.os          = typeof filters.os === 'string'          ? filters.os          : null;
			filters.remote      = typeof filters.remote === 'string'      ? filters.remote      : null;


			this.storage.sync();


			var data = _get_logs.call(this, filters);
			if (data !== null) {
				response(true, data);
			} else {
				response(false, data);
			}

		}, this);

		this.bind('OPTIONS', function(vhost, filters, response) {

			var data = {
				identifier:  'Identifier of the Report, e.g. "boilerplate-' + Date.now() + '"',
				virtualhost: 'Identifier of the VirtualHost, e.g. "boilerplate.lycheejs.org"',
				project:     'Identifier of the Project, e.g. "boilerplate"',
				browser:     'Identifier of the Browser, e.g. "Chrome"',
				device:      'Identifier of the Device, e.g. "HTC Phone"',
				os:          'Identifier of the OS, e.g. "Android"',
				remote:      'Identifier of the Remote, e.g. "127.0.0.1"',
			};

			response(true, data);

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

