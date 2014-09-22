
(function(lychee, global) {

	var environment = global.ENVIRONMENT;

	if (environment !== null) {

		lychee.setEnvironment(environment);

		lychee.init(function(sandbox) {

			var lychee = sandbox.lychee;
			var game   = sandbox.game;
			var sorbet = sandbox.sorbet;

			// This allows using #MAIN in JSON files
			sandbox.MAIN = new {{build}}();

			if (typeof sandbox.MAIN.init === 'function') {
				sandbox.MAIN.init();
			}

		});

	}

})(lychee, typeof global !== 'undefined' ? global : this);

