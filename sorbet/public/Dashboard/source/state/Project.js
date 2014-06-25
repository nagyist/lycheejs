
lychee.define('dashboard.state.Project').includes([
	'lychee.game.State'
]).exports(function(lychee, dashboard, global, attachments) {

	var _template = attachments["tpl"].buffer;



	/*
	 * HELPERS
	 */

	var _aggregate_builds = function(storage, identifier) {

		var builds  = [];
		var objects = storage.filter(function(index, object) {
			return object.identifier === identifier;
		});

		for (var o = 0, ol = objects.length; o < ol; o++) {

			var project = objects[o];
			for (var id in project.builds) {

				var build  = project.builds[id];
				var target = build.build;
				var type   = (build.type || '').match(/library|folder|file/) ? build.type : 'file';

				builds.push({
					target:   target,
					type:     type,
					location: project.root + '/build/' + id + (type === 'folder' ? '/' : '.js'),
					tags:     JSON.stringify(build.tags)
				});

			}

		}

		return builds;

	};

	var _aggregate_errors = function(storage, identifier) {

		var errors  = [];
		var hashmap = [];
		var objects = storage.filter(function(index, object) {
			return object.project === identifier;
		});

		for (var o = 0, ol = objects.length; o < ol; o++) {

			var report = objects[o];
			var hash   = report.type + '-' + report.file + '-' + report.line;
			var index  = hashmap.indexOf(hash);
			if (index !== -1) {

				errors[index].frequency++;
				errors[index].time = Math.max(errors[index].time, report.time);

			} else {

				var location = report.file + '#L' + (report.line || 0);

				errors.push({
					frequency:   1,
					type:        report.type,
					message:     report.message,
					file:        location.split('/').pop(),
					location:    location,
					time:        report.time
				});

				hashmap.push(hash);

			}

		}


		return errors;

	};

	var _aggregate_visits = function(storage, identifier) {

		var visits  = [];
		var objects = storage.filter(function(index, object) {
			return object.project === identifier;
		});

		for (var o = 0, ol = objects.length; o < ol; o++) {

			var object = objects[o];

			visits.push({
				browser: object.browser,
				device:  object.device,
				time:    object.time
			});

		}

		return visits;

	};

	var _create_graph_array = function(buckets) {

		var array = new Array(buckets);
		for (var a = 0, al = array.length; a < al; a++) {
			array[a] = 0;
		}

		return array;

	};

	var _aggregate_graphdata = function(visits) {

		var graphdata = {
			overview: {},
			browsers: {},
			devices:  {}
		};

		var buckets = 14;
		var daytime = 86400 * 1000; // milliseconds per day
		var mintime = Date.now() - buckets * daytime;
		var maxtime = Date.now();


		graphdata.overview['Visits'] = _create_graph_array(buckets);

		for (var v = 0, vl = visits.length; v < vl; v++) {

			var visit   = visits[v];
			var browser = visit.browser;
			var device  = visit.device;

			if (visit.time > mintime && visit.time < maxtime) {

				if (graphdata.browsers[browser] === undefined) {
					graphdata.browsers[browser] = _create_graph_array(buckets);
				}

				if (graphdata.devices[device] === undefined) {
					graphdata.devices[device] = _create_graph_array(buckets);
				}


				var x = ((visit.time - mintime) / (maxtime - mintime) * buckets) | 0;

				graphdata.overview['Visits'][x]++;
				graphdata.browsers[browser][x]++;
				graphdata.devices[device][x]++;

			}

		}


		return graphdata;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.content = null;
		this.storage = main.storage || null;


		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);

		},

		render: function() {

			var content = JSON.parse(JSON.stringify(this.content));
			var storage = this.storage;
			if (content !== null && storage !== null) {

				var builds    = _aggregate_builds(storage.getStorage('project'),  content.identifier);
				var errors    = _aggregate_errors(storage.getStorage('debugger'), content.identifier);
				var visits    = _aggregate_visits(storage.getStorage('log'),      content.identifier);
				var graphdata = _aggregate_graphdata(visits);

				content.builds        = builds;
				content.builds_length = builds.length;
				content.errors        = errors;
				content.errors_length = errors.length;
				content.visits        = visits;
				content.visits_length = visits.length;

				if (errors.length < visits.length) {
					content.errors_percentage = ((errors.length / visits.length) || 0).toFixed(2) + '%';
				} else {
					content.errors_percentage = '100.00%';
				}


				ui.render('main > section', content, _template);
				ui.state('main > section > article', 'project');

				this.loop.setTimeout(0, function() {
					ui.graph('main > section > article.project div.ui-graph', graphdata);
				}, this);

			}

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);


			var storage = this.storage;
			if (storage !== null) {

				this.content = storage.getStorage('project').filter(function(index, object) {
					return object.identifier === data.identifier;
				})[0] || null;

			} else {

				this.content = null;

			}

		},

		leave: function() {

			this.content = null;


			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
