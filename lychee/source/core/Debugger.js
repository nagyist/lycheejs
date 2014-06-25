
lychee.Debugger = typeof lychee.Debugger !== 'undefined' ? lychee.Debugger : (function(global) {

	/*
	 * HELPERS
	 */

	var _client = null;

	var _report = function(data) {

		if (_client === null && typeof sorbet === 'object' && typeof sorbet.net === 'object' && typeof sorbet.net.Client === 'function') {

			_client = new sorbet.net.Client();
			_client.bind('connect', function() {
				_report.call(this, data);
			}, this, true);

		} else if (_client !== null) {

			var service = _client.getService('debugger');
			if (service !== null) {
				service.report('lychee.Debugger Report', data);
			}

		}


		console.error('lychee.Debugger: Report', data);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		/*
		 * CUSTOM API
		 */

		report: function(error, environment, definition) {

			var project = environment instanceof lychee.Environment ? environment.id          : null;

			environment = environment instanceof lychee.Environment ? environment.serialize() : null;
			definition  = definition instanceof lychee.Definition   ? definition.id           : null;


			var data = {
				project:     project,
				definition:  definition,
				environment: environment,
				file:        null,
				line:        null,
				method:      null,
				type:        error.toString().split(':')[0],
				message:     error.message
			};


			if (typeof Error.captureStackTrace === 'function') {

				var orig = Error.prepareStackTrace;

				Error.prepareStackTrace = function(err, stack) { return stack; };
				Error.captureStackTrace(new Error());


				var callsite = error.stack[0];

				data.file   = callsite.getFileName();
				data.line   = callsite.getLineNumber();
				data.method = callsite.getFunctionName() || callsite.getMethodName();


				Error.prepareStackTrace = orig;

			}


			_report(data);


			return true;

		}

	};


	return Module;

})(typeof global !== 'undefined' ? global : this);

