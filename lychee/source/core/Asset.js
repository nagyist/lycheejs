
lychee.Asset = typeof lychee.Asset !== 'undefined' ? lychee.Asset : (function(global) {

	var lychee  = global.lychee;
	var console = global.console;



	/*
	 * HELPERS
	 */

	var _resolve_constructor = function(type) {

		var construct = null;


		if (type === 'json') construct = global.Config  || null;
		if (type === 'fnt')  construct = global.Font    || null;
		if (type === 'msc')  construct = global.Music   || null;
		if (type === 'snd')  construct = global.Sound   || null;
		if (type === 'png')  construct = global.Texture || null;


		if (construct === null) {
			construct = global.Stuff || null;
		}


		return construct;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Callback = function(url, type, ignore) {

		url    = typeof url === 'string'  ? url  : null;
		type   = typeof type === 'string' ? type : null;
		ignore = ignore === true;


		if (url !== null) {

			if (type === null) {
				type = url.split('/').pop().split('.').pop();
			}


			var construct = _resolve_constructor(type);
			if (construct !== null) {
				return new construct(url, ignore);
			}

		}


		return null;

	};


	return Callback;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

