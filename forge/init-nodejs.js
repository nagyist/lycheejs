
var path = "../lychee";

require(path + '/core.js');
require(path + '/Builder.js');
require(path + '/Preloader.js');

// bootstrap.js requires the root path to this file.
require(path + '/platform/nodejs/bootstrap.js')(__dirname);


require('./source/MainServer.js');


lychee.debug = true;

lychee.rebase({
	lychee: path,
	game: './source'
});

lychee.tag({
	platform: [ 'nodejs' ]
});

lychee.build(function(lychee, global) {

	/*
	 * HACK
	 * for crappy OS aka Windows
	 */

	var root = __dirname;
	if (
		root.substr(0, 1).match(/([A-Z])/)
		&& root.substr(1, 1) === ':'
	) {
		root = root.split(/\\/).join('/');
		root = root.substr(2, root.length - 2);
	}

	root = root.split('/');
	root.splice(root.length - 1, 1);
	root = root.join('/');



	var settings = {
		root:    root,
		profile: 'default'
	};


	/*
	 * nodejs init-nodejs.js default
	 * nodejs init-nodejs.js lycheejs.org
	 */
	if (
		typeof process !== 'undefined'
		&& process.argv instanceof Array
	) {

		var profile = process.argv[2] || null;
		if (typeof profile === 'string') {
			settings.profile = profile;
		}

	}


	new game.MainServer(settings);

}, typeof global !== 'undefined' ? global : this);

