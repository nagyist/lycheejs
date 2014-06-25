
lychee.define('dashboard.net.Storage').requires([
	'lychee.Storage'
]).exports(function(lychee, dashboard, global, attachments) {

	/*
	 * HELPERS
	 */

	var _default_storage = {

		filter: function() {
			return [];
		}

	};

	var _on_sync = function(service, data) {

		var storage = this.storages[service.id] || null;
		if (storage !== null) {

			if (data.length > 0) {

				if (Object.keys(storage.model).length === 0) {

					var model = JSON.parse(JSON.stringify(data[0]));
					if (model instanceof Object) {
						model.identifier = null;
						storage.setModel(model);
					}

				}


				for (var d = 0, dl = data.length; d < dl; d++) {

					var object = data[d];
					var stored = storage.filter(function(i, obj) {
						return obj.identifier === object.identifier;
					})[0] || null;


					if (stored !== null) {

						if (lychee.diff(stored, object) === true) {

							if (lychee.debug === true) {
								console.log('dashboard.net.Storage-' + service.id + ': UPDATE "' + object.identifier + '"');
							}

							lychee.extend(stored, object);
							storage.update(object);

						}

					} else if (object instanceof Object && object.identifier !== null) {

						if (lychee.debug === true) {
							console.log('dashboard.net.Storage-' + service.id + ': INSERT "' + object.identifier + '"');
						}

						storage.insert(object);

					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings, main) {

		this.storages = {
			'debugger':    new lychee.Storage({ id: 'dashboard-debugger'    }),
			'log':         new lychee.Storage({ id: 'dashboard-log'         }),
			'project':     new lychee.Storage({ id: 'dashboard-project'     }),
			'virtualhost': new lychee.Storage({ id: 'dashboard-virtualhost' })
		};


		var that   = this;
		var client = main.client;
		if (client !== null) {

			for (var identifier in this.storages) {

				var service = client.getService(identifier);
				if (service !== null) {
					service.bind('#sync', _on_sync, that);
				}

			};

		}

	};


	Class.prototype = {

		getStorage: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			var storage = null;

			if (identifier !== null) {
				storage = this.storages[identifier] || null;
			}

			if (storage === null) {
				storage = _default_storage;
			}


			return storage;

		}

	};


	return Class;

});

