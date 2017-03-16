
(function(lychee, global) {

	let   _filename = null;
	const _Buffer   = require('buffer').Buffer;



	/*
	 * FEATURE DETECTION
	 */

	(function(location, selfpath) {

		let origin = location.origin || '';
		let cwd    = (location.pathname || '');
		let proto  = origin.split(':')[0];


		// Hint: CDNs might have no proper redirect to index.html
		if (cwd.split('/').pop() === 'index.html') {
			cwd = cwd.split('/').slice(0, -1).join('/');
		}


		if (/http|https/g.test(proto)) {

			// Hint: The harvester (HTTP server) understands
			// /projects/* and /libraries/* requests.

			lychee.ROOT.lychee = '';


			if (cwd !== '') {
				lychee.ROOT.project = cwd === '/' ? '' : cwd;
			}

		} else if (/app|file|chrome-extension/g.test(proto)) {

			let tmp1 = selfpath.indexOf('/libraries/lychee');
			let tmp2 = selfpath.indexOf('://');

			if (tmp1 !== -1 && tmp2 !== -1) {
				lychee.ROOT.lychee = selfpath.substr(0, tmp1).substr(tmp2 + 3);
			} else if (tmp1 !== -1) {
				lychee.ROOT.lychee = selfpath.substr(0, tmp1);
			}


			if (typeof process !== 'undefined') {
				cwd      = process.cwd() || '';
				selfpath = cwd.split('/').slice(0, -1).join('/');
			}


			let tmp3 = selfpath.split('/').slice(0, 3).join('/');
			if (tmp3.substr(0, 13) === '/opt/lycheejs') {
				lychee.ROOT.lychee = tmp3;
			}


			if (cwd !== '') {
				lychee.ROOT.project = cwd;
			}

		}

	})(global.location || {}, (document.currentScript || {}).src || '');


	Buffer.isBuffer = function(buffer) {

		if (buffer instanceof Buffer) {
			return true;
		} else if (buffer instanceof _Buffer) {
			return true;
		}

		return false;

	};



	/*
	 * FEATURES
	 */

	// XXX: This is an incremental platform of 'html'

	const _FEATURES = {

		require: function(id) {

			if (id === 'child_process') return {};
			if (id === 'fs')            return {};
			if (id === 'http')          return {};
			if (id === 'https')         return {};
			if (id === 'net')           return {};
			if (id === 'path')          return {};


			throw new Error('Cannot find module \'' + id + '\'');

		}

	};

	Object.assign(lychee.Environment.__FEATURES, _FEATURES);

})(this.lychee, this);

