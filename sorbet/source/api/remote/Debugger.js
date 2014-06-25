
lychee.define('sorbet.api.remote.Debugger').requires([
	'lychee.Storage'
]).includes([
	'sorbet.api.remote.Service'
]).exports(function(lychee, sorbet, global, attachments) {

	var _fs = require('fs');



	/*
	 * HELPERS
	 */

	var _refresh_storage = function() {

		var blob = null;
		try {
			blob = JSON.parse(_fs.readFileSync(this.main.root + '/sorbet/lychee.store', 'utf8'));
			blob = blob['sorbet-debugger'] || null;
		} catch(e) {
			blob = null;
		}


		if (blob !== null) {

			var model    = blob['@model']    || null;
			var objects  = blob['@objects']  || null;
			var document = blob['@document'] || null;

			this.storage.setModel(model);
			this.storage.deserialize({
				document: document,
				objects:  objects
			});

		}

	};

	var _serialize_report = function(report, environment) {

		environment = environment === true;


		return {
			'project':     report.project,
			'identifier':  report.identifier,
			'definition':  report.definition,
			'environment': environment === true ? report.environment : null,
			'file':        report.file,
			'line':        report.line,
			'method':      report.method,
			'type':        report.type,
			'message':     report.message,
			'time':	       report.time
		};

	};

	var _get_reports = function(filters) {

		var project  = filters.project;
		var filtered = [];


		var reports = this.storage.filter(function(index, object) {
			return (project === null || project === object.project);
		});

		for (var r = 0, rl = reports.length; r < rl; r++) {
			filtered.push(_serialize_report(reports[r], false));
		}


		filtered.sort(function(a, b) {
			if (a.project < b.project) return -1;
			if (a.project > b.project) return  1;
			return 0;
		});


		return filtered;

	};

	var _get_report = function(filters) {

		var identifier = filters.identifier;
		var found      = null;


		if (identifier !== null) {

			var report = this.storage.filter(function(index, object) {
				return identifier === object.identifier;
			})[0] || null;


			if (report !== null) {
				found = _serialize_report(report, true);
			}

		}


		return found;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id   = 'Debugger';
		this.main = main;

		this.storage = new lychee.Storage({
			id:   'sorbet-api-debugger',
			type: lychee.Storage.TYPE.temporary
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

			filters.identifier = typeof filters.identifier === 'string' ? filters.identifier : null;
			filters.project    = typeof filters.project === 'string'    ? filters.project    : null;


			_refresh_storage.call(this);


			var data = null;

			if (filters.identifier === null) {
				data = _get_reports.call(this, filters);
			} else {
				data = _get_report.call(this, filters);
			}

			if (data !== null) {
				response(true, data);
			} else {
				response(false, data);
			}

		}, this);

		this.bind('OPTIONS', function(vhost, filters, response) {

			var data = {
				identifier: 'Identifier of the Error, e.g. "boilerplate-' + Date.now() + '"',
				project:    'Identifier of the Project, e.g. "boilerplate"'
			};

			response(true, data);

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

