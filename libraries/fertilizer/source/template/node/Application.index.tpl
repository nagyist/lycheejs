
require('./core.js')(__dirname);


(function(lychee, global) {

	let environment = lychee.deserialize(${blob});
	if (environment !== null) {
		lychee.envinit(environment, ${profile});
	}

})(lychee, typeof global !== 'undefined' ? global : this);

