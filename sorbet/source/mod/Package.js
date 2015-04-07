
lychee.define('sorbet.mod.Package').requires([
	'sorbet.data.Package'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _insert = function(root, url) {

		var pointer    = root;
		var path       = url.substr(1, url.indexOf('.') - 1).split('/');
		var attachment = url.substr(url.indexOf('.') + 1);


		while (path.length > 0) {

			var name = path.shift();
			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer[name] = path.length > 0 ? {} : [];
				pointer = pointer[name];
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
		var path       = url.substr(1, url.indexOf('.') - 1).split('/');
		var attachment = url.substr(url.indexOf('.') + 1);


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

	var _walk_directory = function(files, path) {

		var that = this;
		var info = this.info(path);

		if (info !== null) {

			if (info.type === 'file') {

				var ext = path.split('.').slice(-1)[0];
				if (ext === 'mp3' || ext === 'ogg') {
					ext  = path.split('.').slice(-2)[0];
				}

				if (ext === 'msc' || ext === 'snd') {

					path = path.substr(0, path.length - 4);

					if (files.indexOf(path) === -1) {
						files.push(path);
					}

				} else if (ext.match(/js|json|fnt|png/)) {

					if (files.indexOf(path) === -1) {
						files.push(path);
					}

				}

			} else if (info.type === 'directory') {

				this.dir(path).forEach(function(child) {
					_walk_directory.call(that, files, path + '/' + child);
				});

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		can: function(project) {

			// Ignore lychee core for now, because we want to develop with unstable builds
			if (project.identifier === 'lychee') {
				return false;
			}


			if (project.package !== null) {

				var diff    = null;
				var files_a = project.package.source;
				var files_b = [];
				var files_c = project.package.build;
				var files_d = [];


				_walk_directory.call(project.filesystem, files_b, '/source');
				files_b = files_b.map(function(value) {
					return value.substr('/source'.length);
				});

				_walk_directory.call(project.filesystem, files_d, '/build');
				files_d = files_d.map(function(value) {
					return value.substr('/build'.length);
				});


				if (files_a.length !== files_b.length || files_c.length !== files_d.length) {
					return true;
				}

			}


			return false;

		},

		process: function(project) {

			if (project.package !== null) {

				var diff    = [];
				var mode    = null;
				var json    = JSON.parse(JSON.stringify(project.package.json));
				var files_a = project.package.source;
				var files_b = [];
				var files_c = project.package.build;
				var files_d = [];

				if (json instanceof Object && json.source instanceof Object) {

					_walk_directory.call(project.filesystem, files_b, '/source');
					files_b = files_b.map(function(value) {
						return value.substr('/source'.length);
					});

					_walk_directory.call(project.filesystem, files_d, '/build');
					files_d = files_d.map(function(value) {
						return value.substr('/build'.length);
					});



					if (files_b.length > files_a.length) {

						diff.push({
							json:  json.source.files,
							mode:  'insert',
							files: files_b.filter(function(value) {
								return files_a.indexOf(value) === -1;
							})
						});

					} else if (files_a.length > files_b.length) {

						diff.push({
							json:  json.source.files,
							mode:  'delete',
							files: files_a.filter(function(value) {
								return files_b.indexOf(value) === -1;
							})
						});

					}


					if (files_d.length > files_c.length) {

						diff.push({
							json:  json.build.files,
							mode:  'insert',
							files: files_d.filter(function(value) {
								return files_c.indexOf(value) === -1;
							})
						});

					} else if (files_c.length > files_d.length) {

						diff.push({
							json:  json.build.files,
							mode:  'delete',
							files: files_c.filter(function(value) {
								return files_d.indexOf(value) === -1;
							})
						});

					}


					if (diff.length > 0) {

						diff.forEach(function(entry) {

							var mode = entry.mode;
							if (mode === 'insert') {

								entry.files.forEach(function(file) {
									_insert(entry.json, file);
								});

							} else if (mode === 'delete') {

								entry.files.forEach(function(file) {
									_delete(entry.json, file);
								});

							}

						});


						var data = null;

						try {
							data = JSON.stringify(json, null, '\t');
						} catch(e) {
						}

						if (data !== null) {
							project.filesystem.write('/lychee.pkg', data);
						}

					}

				}

			}

		}

	};


	return Module;

});

