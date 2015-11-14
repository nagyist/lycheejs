
${info}

${core}

(function(lychee, global) {

	var environment = lychee.deserialize(${blob});

	if (environment !== null) {

		lychee.setEnvironment(environment);

		lychee.init(function(sandbox) {

			${init}

			// This allows using #MAIN in JSON files
			sandbox.MAIN = new ${build}();

			if (typeof sandbox.MAIN.init === 'function') {
				sandbox.MAIN.init();
			}

		});

	}

})(lychee, typeof global !== 'undefined' ? global : this);

