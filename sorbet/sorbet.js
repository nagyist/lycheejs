#!/usr/bin/env nodejs



/*
 * BOOTSTRAP
 */

var _root   = process.argv[2];
var _folder = __dirname.substr(_root.length);
var _port   = parseInt(process.argv[3], 10);
var _host   = process.argv[4] === 'null' ? null : process.argv[4];

require(_root + '/lychee/build/nodejs/core.js')(_root);



/*
 * INITIALIZATION
 */

(function(lychee, global) {

	var environment = new lychee.Environment({
		debug:    false,
		sandbox:  false,
		build:    'sorbet.net.Server',
		packages: [
			new lychee.Package('sorbet', _folder + '/lychee.pkg')
		],
		tags:     {
			platform: [ 'nodejs' ]
		}
	});


	lychee.setEnvironment(environment);

	lychee.init(function(sandbox) {

		var lychee = sandbox.lychee;
		var sorbet = sandbox.sorbet;

		sandbox.SERVER = new sorbet.net.Server();
		sandbox.SERVER.listen(_port, _host);

	});

})(lychee, typeof global !== 'undefined' ? global : this);

