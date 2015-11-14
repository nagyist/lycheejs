
lychee.define('sorbet.mod.Package').requires([
	'sorbet.data.Package'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _get_diff = function(project) {

		var diff = {
			api:    [ project.package.api,    []],
			build:  [ project.package.build,  []],
			source: [ project.package.source, []]
		};


		_walk_directory.call(project.filesystem, diff.api[1],    '/api',    true);
		_walk_directory.call(project.filesystem, diff.build[1],  '/build',  false);
		_walk_directory.call(project.filesystem, diff.source[1], '/source', true);

		diff.api[1] = diff.api[1].map(function(value) {
			return value.substr('/api'.length);
		});

		diff.build[1] = diff.build[1].map(function(value) {
			return value.substr('/build'.length);
		});

		diff.source[1] = diff.source[1].map(function(value) {
			return value.substr('/source'.length);
		});


		return diff;

	};

	var _insert = function(root, url) {

		var pointer    = root;
		var path       = [];
		var attachment = '';

		var has = url.lastIndexOf('.') > url.lastIndexOf('/');
		if (has === true) {
			path       = url.substr(1, url.lastIndexOf('.') - 1).split('/');
			attachment = url.substr(url.lastIndexOf('.') + 1);
		} else {
			path       = url.substr(1, url.length - 1).split('/');
		}


		while (path.length > 0) {

			var name = path.shift();
			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = pointer[name] = path.length > 0 ? {} : [];
			}

		}


		if (pointer instanceof Array) {

			if (pointer.indexOf(attachment) === -1) {
				pointer.push(attachment);
			}

		}

	};

	var _delete = function(root, url) {

		var pointer    = root;
		var path       = [];
		var attachment = '';

		var has = url.lastIndexOf('.') > url.lastIndexOf('/');
		if (has === true) {
			path       = url.substr(1, url.lastIndexOf('.') - 1).split('/');
			attachment = url.substr(url.lastIndexOf('.') + 1);
		} else {
			path       = url.substr(1, url.length - 1).split('/');
		}


		var name   = null;
		var parent = root;

		while (path.length > 0) {

			name = path.shift();

			if (pointer[name] !== undefined) {
				parent  = pointer;
				pointer = pointer[name];
			} else {
				break;
			}

		}


		if (pointer instanceof Array) {

			if (pointer.indexOf(attachment) !== -1) {
				pointer.splice(pointer.indexOf(attachment), 1);
			}


			if (pointer.length === 0 && name !== null) {
				delete parent[name];
			}

		} else if (pointer instanceof Object) {

			if (path.length === 0) {
				delete parent[name];
			}

		}

	};

	var _walk_directory = function(files, path, check) {

		var that = this;
		var info = this.info(path);

		if (info !== null) {

			if (info.type === 'file') {

				if (check === true) {

					var ext = path.split('.').slice(-1)[0];
					if (ext === 'mp3' || ext === 'ogg') {
						ext  = path.split('.').slice(-2)[0];
					}

					if (ext === 'msc' || ext === 'snd') {

						path = path.substr(0, path.length - 4);

						if (files.indexOf(path) === -1) {
							files.push(path);
						}

					} else if (ext.match(/fnt|html|js|json|md|png/)) {

						if (files.indexOf(path) === -1) {
							files.push(path);
						}

					}

				} else {

					if (files.indexOf(path) === -1) {
						files.push(path);
					}

				}

			} else if (info.type === 'directory') {

				this.dir(path).forEach(function(child) {
					_walk_directory.call(that, files, path + '/' + child, check);
				});

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'sorbet.mod.Package',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (project.filesystem !== null && project.package !== null) {

				var diff = _get_diff(project);

				for (var id in diff) {

					var data = diff[id];
					if (data[0].length !== data[1].length) {
						return true;
					}

				}

			}


			return false;

		},

		process: function(project) {

			if (project.package !== null) {

				var diff       = _get_diff(project);
				var json       = JSON.parse(JSON.stringify(project.package.json));
				var operations = [];
				var merge_diff = function(a, b) {

					return a.filter(function(value) {
						return b.indexOf(value) === -1;
					});

				};


				for (var id in diff) {

					if (typeof json[id] === 'undefined')       json[id]       = {};
					if (typeof json[id].files === 'undefined') json[id].files = {};


					var data    = diff[id];
					var pointer = json[id].files;

					if (data[1].length > data[0].length) {

						operations.push({
							pointer: pointer,
							mode:    'insert',
							files:   merge_diff(data[1], data[0])
						});

					} else if (data[0].length > data[1].length) {

						operations.push({
							pointer: pointer,
							mode:    'delete',
							files:   merge_diff(data[0], data[1])
						});

					}

				}


				if (operations.length > 0) {

					operations.forEach(function(operation) {

						switch (operation.mode) {

							case 'insert':

								operation.files.forEach(function(file) {
									_insert(operation.pointer, file);
								});

							break;

							case 'delete':

								operation.files.forEach(function(file) {
									_delete(operation.pointer, file);
								});

							break;

						}

					});


					var output = null;

					try {
						output = JSON.stringify(json, null, '\t');
					} catch(e) {
					}

					if (output !== null) {
						project.filesystem.write('/lychee.pkg', output);
						project.package = new sorbet.data.Package(new Buffer(output, 'utf8'));
					}

				}

			}

		}

	};


	return Module;

});

