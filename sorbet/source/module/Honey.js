
lychee.define('sorbet.module.Honey').requires([
	'sorbet.module.honey.Admin',
	'sorbet.module.honey.Robots'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _get_module = function(data) {

		if (sorbet.module.honey instanceof Object) {

			for (var id in sorbet.module.honey) {

				var module = sorbet.module.honey[id];

				for (var url in module.URLS) {

					if (url === data.url) {
						return module;
					}

				}

			}

		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id   = 'Honey';
		this.main = main || null;

	};


	Class.prototype = {

		process: function(vhost, response, data) {

			var module = _get_module(data);
			if (module !== null) {
				return module.process(vhost, response, data);
			}


			return false;

		}

	};


	return Class;

});

