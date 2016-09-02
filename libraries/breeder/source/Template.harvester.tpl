#!/usr/local/bin/lycheejs-helper env:node

const _PORT = parseInt(process.argv[2], 10);
const _HOST = process.argv[3] === 'null' ? null : process.argv[3];

require('/opt/lycheejs/libraries/lychee/build/node/core.js')(__dirname);



/*
 * INITIALIZATION
 */

(function(lychee, global) {

	lychee.pkginit('node/main', {
		debug:   false,
		sandbox: false
	}, {
		renderer: null,
		client:   null,
		server:   {
			host: _HOST,
			port: _PORT
		}
	});

})(lychee, typeof global !== 'undefined' ? global : this);

