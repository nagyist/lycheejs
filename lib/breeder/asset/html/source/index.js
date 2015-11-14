
(function(lychee, global) {

	var environment = new lychee.Environment({
		id:      'separated-boilerplate',
		debug:   true,
		sandbox: false,
		build:   'app.Main',
		type:    'source',
		packages: [
			new lychee.Package('app', '../lychee.pkg')
		],
		tags:     {
			platform: [ 'html' ]
		}
	});


	lychee.setEnvironment(environment);

	lychee.inject(lychee.ENVIRONMENTS['lychee']);

	lychee.init(function(sandbox) {

		var lychee = sandbox.lychee;
		var app    = sandbox.app;


		// This allows using #MAIN in JSON files
		sandbox.MAIN = new app.Main();
		sandbox.MAIN.init();

	});

})(lychee, typeof global !== 'undefined' ? global : this);

