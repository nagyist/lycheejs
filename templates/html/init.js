
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

			if (typeof sandbox.MAIN.load === 'function') {
				sandbox.MAIN.load();
			}

		});

	}

})(lychee, typeof global !== 'undefined' ? global : this);

