
(function(lychee, global) {

	var environment = new lychee.Environment({
		id:      'editor',
		debug:   false,
		sandbox: false,
		build:   'tool.Main',
		packages: [
			new lychee.Package('tool', '../lychee.pkg')
		],
		tags:     {
			platform: [ 'html' ]
		}
	});


	lychee.setEnvironment(environment);


	lychee.init(function(sandbox) {

		var lychee = sandbox.lychee;
		var tool   = sandbox.tool;


		// This allows using #MAIN in JSON files
		sandbox.MAIN = new tool.Main();
		sandbox.MAIN.init();

	});

})(lychee, typeof global !== 'undefined' ? global : this);

