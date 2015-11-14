
(function(lychee, global) {

	var environment = new lychee.Environment({
		id:       'chat',
		debug:    false,
		sandbox:  true,
		build:    'app.Main',
		packages: [
			new lychee.Package('app', '../lychee.pkg')
		],
		tags:     {
			platform: [ 'html' ]
		}
	});


	lychee.setEnvironment(environment);

	lychee.init(function(sandbox) {

		var lychee = sandbox.lychee;
		var app    = sandbox.app;

		// This allows using #MAIN in JSON files
		sandbox.MAIN = new app.Main();
		sandbox.MAIN.init();

	});

})(lychee, typeof global !== 'undefined' ? global : this);

