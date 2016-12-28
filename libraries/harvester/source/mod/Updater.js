
lychee.define('harvester.mod.Updater').requires([
	'harvester.net.Client'
]).exports(function(lychee, global, attachments) {

	const _Client = lychee.import('harvester.net.Client');
	let   _CLIENT = null;



	/*
	 * HELPERS
	 */

	const _on_sync = function(project, data) {

		console.log('SYNCHRONIZING UPDATES', project, data);

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'harvester.mod.Updater',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (_CLIENT === null) {

				_CLIENT = new _Client({
					host: 'harvester.artificial.engineering',
					port: 8080
				});

			}


			if (project.identifier.indexOf('__') === -1 && project.package !== null) {

				let service = _CLIENT.getService('update');
				if (service !== null) {
					return true;
				}

			}


			return false;

		},

		process: function(project) {

			if (project.package !== null) {

				let service = _CLIENT.getService('update');
				if (service !== null) {

					service.sync({
						identifier: project.identifier
					});

					service.bind('sync', function(data) {
						_on_sync.call(this, project, data);
					}, this, true);

				}

			}

		}

	};


	return Module;

});

