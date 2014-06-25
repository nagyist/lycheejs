
lychee.define('sorbet.net.remote.Debugger').includes([
	'lychee.net.Service'
]).requires([
	'lychee.Storage'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _model = {
		identifier:  'boilerplate-' + Date.now(),
		project:     'boilerplate',
		definition:  null,
		environment: null,
		file:        'http://localhost:8080/projects/boilerplate/source/Main.js',
		line:        0,
		method:      'Class',
		type:        'ReferenceError',
		message:     'x is a validation error',
		time:        Date.now()
	};

	var _storage = new lychee.Storage({
		id:    'sorbet-debugger',
		model: _model,
		type:  lychee.Storage.TYPE.persistent
	});

	var _on_error = function(data) {

		if (data.message === 'lychee.Debugger Report' && data.blob instanceof Object) {

			var project = data.blob.project || null;
			if (project !== null) {

				_storage.sync();

				data.blob.definition = data.blob.definition || null;
				data.blob.identifier = data.blob.project + '-' + Date.now();
				data.blob.time       = Date.now();

				var result = _storage.insert(data.blob);
				if (result === true) {
					console.log('sorbet.net.remote.Debugger: Report from "' + project + '" at "' + data.blob.file + '#' + data.blob.line + '"');
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		lychee.net.Service.call(this, 'debugger', remote, lychee.net.Service.TYPE.remote);


		this.bind('error', _on_error, this);

	};


	Class.prototype = {

	};


	return Class;

});

