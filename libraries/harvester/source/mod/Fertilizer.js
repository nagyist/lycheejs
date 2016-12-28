
lychee.define('harvester.mod.Fertilizer').tags({
	platform: 'node'
}).requires([
	'harvester.data.Filesystem'
]).supports(function(lychee, global) {

	if (typeof global.require === 'function') {

		try {

			global.require('child_process');

			return true;

		} catch (err) {

		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	const _child_process = global.require('child_process');
	const _setInterval   = global.setInterval;
	const _Filesystem    = lychee.import('harvester.data.Filesystem');
	const _CACHE         = { active: false, queue: [] };
	const _ROOT          = new _Filesystem().root;



	/*
	 * FEATURE DETECTION
	 */

	(function(cache) {

		_setInterval(function() {

			if (cache.active === false) {

				let tmp = cache.queue.splice(0, 1);
				if (tmp.length === 1) {

					cache.active = true;
					_fertilize(tmp[0].project, tmp[0].target);

				}

			}

		}, 1000);

	})(_CACHE);



	/*
	 * HELPERS
	 */

	const _is_queue = function(project, target) {

		return _CACHE.queue.find(function(entry) {
			return entry.project === project && entry.target === target;
		}) !== undefined;

	};

	const _fertilize = function(project, target) {

		_child_process.execFile(_ROOT + '/bin/fertilizer.sh', [
			target,
			project
		], {
			cwd: _ROOT
		}, function(error, stdout, stderr) {

			_CACHE.active = false;

			if (error || stdout.indexOf('SUCCESS') === -1) {
				console.error('harvester.mod.Fertilizer: FAILURE ("' + project + ' | ' + target + '")');
			} else {
				console.info('harvester.mod.Fertilizer: SUCCESS ("' + project + ' | ' + target + '")');
			}

		});

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
				'reference': 'harvester.mod.Fertilizer',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (project.identifier.indexOf('__') === -1 && project.package !== null) {

				let build = project.package.json.build || null;
				if (build !== null) {

					let environments = build.environments || null;
					if (environments !== null) {

						let targets = Object.keys(environments).filter(function(target) {
							return _is_queue(project.identifier, target) === false;
						});

						if (targets.length > 0) {
							return true;
						}

					}

				}

			}


			return false;

		},

		process: function(project) {

			if (project.filesystem !== null && project.package !== null) {

				let build = project.package.json.build || null;
				if (build !== null) {

					let environments = build.environments || null;
					if (environments !== null) {

						Object.keys(environments).filter(function(target) {
							return _is_queue(project.identifier, target) === false;
						}).forEach(function(target) {

							_CACHE.queue.push({
								project: project.identifier,
								target:  target
							});

						});

					}

				}

			}

		}

	};


	return Module;

});

