
(function(lychee, global) {

	// The identifier is unique among all projects, it is used for remote debugging features

	var environment = new lychee.Environment({
		id:       'blitzkrieg',
		debug:    false,
		sandbox:  true,
		build:    'game.Main',
		packages: [
			new lychee.Package('game', '../lychee.pkg')
		],
		tags:     {
			platform: [ 'html' ]
		}
	});


	lychee.setEnvironment(environment);

	lychee.init(function(sandbox) {

		var lychee = sandbox.lychee;
		var game   = sandbox.game;

		// This allows using #MAIN in JSON files
		sandbox.MAIN = new game.Main({
			jukebox: {
				music: true,
				sound: true
			}
		});
		sandbox.MAIN.init();

	});

})(lychee, typeof global !== 'undefined' ? global : this);

