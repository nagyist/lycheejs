
{{info}}


(function(lychee, global) {

	var environment = lychee.deserialize({{blob}});

	if (environment !== null) {

		lychee.setEnvironment(environment);

		lychee.init(function(sandbox) {

			var lychee = sandbox.lychee;
			var app    = sandbox.app;
			var game   = sandbox.game;
			var tool   = sandbox.tool;

			// This allows using #MAIN in JSON files
			sandbox.MAIN = new {{build}}();

			if (typeof sandbox.MAIN.init === 'function') {
				sandbox.MAIN.init();
			}

		});

	}

})(lychee, typeof global !== 'undefined' ? global : this);

