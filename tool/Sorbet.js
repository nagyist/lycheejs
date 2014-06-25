#!/usr/bin/env nodejs



var root = __dirname;
if (root.split('/').pop() === 'tool') {
	var tmp = root.split('/'); tmp.pop();
	root = tmp.join('/');
}



var fs      = require('fs');
var path    = require('path');
var profile = root + '/sorbet/profile/' + (process.argv[2] || 'localhost') + '.json';
var lychee  = null;

try {
	lychee  = require(root + '/lychee/build/nodejs/core.js')(root);
} catch(e) {
	console.error('Please build the lycheeJS core first, run "nodejs ./tool/configure.js".');
	process.exit(1);
}



(function(lychee, root, profile) {

	var file   = null;
	var config = null;

	try {
		file   = path.resolve(root, profile);
		config = JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch(e) {
		file   = path.resolve(root + '/sorbet/profile/localhost.json');
		config = JSON.parse(fs.readFileSync(file, 'utf8'));
	}


	var environment = new lychee.Environment({
		id:       'sorbet',
		debug:    true,
		sandbox:  false,
		build:    'sorbet.Main',
		timeout:  3000,
		packages: [
			new lychee.Package('lychee', path.relative(root, './lychee/lychee.pkg')),
			new lychee.Package('sorbet', path.relative(root, './sorbet/lychee.pkg'))
		],
		tags:    {
			platform: [ 'nodejs' ]
		}
	});


	lychee.setEnvironment(environment);

	lychee.init(function(sandbox) {

		var lychee = sandbox.lychee;
		var sorbet = sandbox.sorbet;

		var main = new sorbet.Main(
			root,
			profile,
			config
		);

		main.listen(config.port);

		process.on('exit', function() {
			main.destroy();
		});

	});

})(lychee, root, profile);

