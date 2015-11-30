
lychee.define('harvester.data.Host').requires([
	'harvester.data.Project'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, harvester, global, attachments) {

	/*
	 * HELPERS
	 */

	var _on_update = function(project) {

		this.trigger('update', [ project ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.cultivator = false;
		this.libraries  = [];
		this.projects   = [];


		this.setCultivator(settings.cultivator);
		this.setLibraries(settings.libraries);
		this.setProjects(settings.projects);


		lychee.event.Emitter.call(this);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.libraries instanceof Array) {

				var libraries = blob.libraries.map(lychee.deserialize);
				if (libraries.length > 0) {
					this.setLibraries(libraries);
				}

			}

			if (blob.projects instanceof Array) {

				var projects = blob.projects.map(lychee.deserialize);
				if (projects.length > 0) {
					this.setProjects(projects);
				}

			}

		},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'harvester.data.Host';

			var settings = {};
			var blob     = (data['blob'] || {});


			if (this.cultivator !== false) settings.cultivator = this.cultivator;


			if (this.libraries.length > 0) {
				blob.libraries = this.libraries.map(lychee.serialize);
			}

			if (this.projects.length > 0) {
				blob.projects = this.projects.map(lychee.serialize);
			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setCultivator: function(cultivator) {

			if (cultivator === true || cultivator === false) {

				this.cultivator = cultivator;

				return true;

			}


			return false;

		},

		addLibrary: function(library) {

			library = library instanceof harvester.data.Project ? library : null;


			if (library !== null) {

				if (this.libraries.indexOf(library) === -1) {

					library.bind('#update', _on_update, this);
					this.libraries.push(library);

					return true;

				}

			}


			return false;

		},

		getLibrary: function(id) {

			id = typeof id === 'string' ? id : null;


			var found = null;


			if (id !== null) {

				for (var l = 0, ll = this.libraries.length; l < ll; l++) {

					var library = this.libraries[l];
					if (library.identifier === id) {
						found = library;
						break;
					}

				}

			}


			return found;

		},

		removeLibrary: function(library) {

			library = library instanceof harvester.data.Project ? library : null;


			if (library !== null) {

				var index = this.libraries.indexOf(library);
				if (index !== -1) {

					library.unbind('#update', _on_update, this);
					this.libraries.splice(index, 1);

					return true;

				}

			}


			return false;

		},

		setLibraries: function(libraries) {

			var all = true;

			if (libraries instanceof Array) {

				for (var l = 0, ll = libraries.length; l < ll; l++) {

					var result = this.addLibrary(libraries[l]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		removeLibraries: function() {

			var libraries = this.libraries;

			for (var l = 0, ll = libraries.length; l < ll; l++) {

				this.removeLibrary(libraries[l]);

				ll--;
				l--;

			}

			return true;

		},

		addProject: function(project) {

			project = project instanceof harvester.data.Project ? project : null;


			if (project !== null) {

				if (this.projects.indexOf(project) === -1) {

					project.bind('#update', _on_update, this);
					this.projects.push(project);

					return true;

				}

			}


			return false;

		},

		getProject: function(id) {

			id = typeof id === 'string' ? id : null;


			var found = null;


			if (id !== null) {

				for (var p = 0, pl = this.projects.length; p < pl; p++) {

					var project = this.projects[p];
					if (project.identifier === id) {
						found = project;
						break;
					}

				}

			}


			return found;

		},

		removeProject: function(project) {

			project = project instanceof harvester.data.Project ? project : null;


			if (project !== null) {

				var index = this.projects.indexOf(project);
				if (index !== -1) {

					project.unbind('#update', _on_update, this);
					this.projects.splice(index, 1);

					return true;

				}

			}


			return false;

		},

		setProjects: function(projects) {

			var all = true;

			if (projects instanceof Array) {

				for (var p = 0, pl = projects.length; p < pl; p++) {

					var result = this.addProject(projects[p]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		removeProjects: function() {

			var projects = this.projects;

			for (var p = 0, pl = projects.length; p < pl; p++) {

				this.removeProject(projects[p]);

				pl--;
				p--;

			}

			return true;

		}

	};


	return Class;

});

