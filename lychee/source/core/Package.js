
lychee.Package = typeof lychee.Package !== 'undefined' ? lychee.Package : (function(global) {

	var lychee = global.lychee;


	/*
	 * HELPERS
	 */

	var _resolve_root = function() {

		var root = this.root;
		var type = this.type;
		if (type === 'source') {
			root += '/source';
		} else if (type === 'export') {
			root += '/source';
		} else if (type === 'build') {
			root += '/build';
		}


		return root;

	};

	var _resolve_path = function(candidate) {

		var path = typeof candidate === 'string' ? candidate.split('/') : null;


		if (path !== null) {

			var type = this.type;
			if (type === 'export') {
				type = 'source';
			}


			var pointer = this.config.buffer[type].files || null;
			if (pointer !== null) {

				for (var p = 0, pl = path.length; p < pl; p++) {

					var name = path[p];
					if (pointer[name] !== undefined) {
						pointer = pointer[name];
					} else {
						pointer = null;
						break;
					}

				}

			}


			return pointer !== null ? true : false;

		}


		return false;

	};

	var _resolve_attachments = function(candidate) {

		var attachments = {};
		var path        = candidate.split('/');
		if (path.length > 0) {

			var pointer = this.config.buffer.source.files || null;
			if (pointer !== null) {

				for (var pa = 0, pal = path.length; pa < pal; pa++) {

					var name = path[pa];
					if (pointer[name] !== undefined) {
						pointer = pointer[name];
					} else {
						pointer = null;
						break;
					}

				}


				if (pointer !== null && pointer instanceof Array) {

					var classpath = _resolve_root.call(this) + '/' + path.join('/');

					for (var po = 0, pol = pointer.length; po < pol; po++) {

						var type = pointer[po];
						if (type !== 'js') {
							attachments[type] = classpath + '.' + type;
						}

					}

				}

			}

		}


		return attachments;

	};

	var _resolve_candidates = function(classId, tags) {

		var candidatepath = classId.split('.').join('/');
		var candidates    = [];

		for (var tag in tags) {

			var values = tags[tag];
			for (var v = 0, vl = values.length; v < vl; v++) {

				var path = _resolve_tag.call(this, tag, values[v]) + '/' + candidatepath;
				if (_resolve_path.call(this, path) === true) {
					candidates.push(path);
				}

			}

		}


		if (_resolve_path.call(this, candidatepath) === true) {
			candidates.push(candidatepath);
		}


		return candidates;

	};

	var _resolve_tag = function(tag, value) {

		tag   = typeof tag === 'string'   ? tag   : null;
		value = typeof value === 'string' ? value : null;


		if (tag !== null && value !== null) {

			var type = this.type;
			if (type === 'export') {
				type = 'source';
			}


			var pointer = this.config.buffer[type].tags || null;
			if (pointer !== null) {

				if (pointer[tag] instanceof Object) {

					var path = pointer[tag][value] || null;
					if (path !== null) {
						return path;
					}

				}

			}

		}


		return '';

	};

	var _load_candidate = function(classId, candidates) {

		var map = {
			classId:      classId,
			candidate:    null,
			attachments:  [],
			dependencies: [],
			loading:      candidates.length + 1
		};

		this.requests[classId] = map;


		for (var c = 0, cl = candidates.length; c < cl; c++) {

			var candidate = candidates[c];
			if (this.__blacklist[candidate] === 1) continue;

			var url            = _resolve_root.call(this) + '/' + candidates[c] + '.js';
			var implementation = lychee.Environment.createAsset(url);
			var attachments    = _resolve_attachments.call(this, candidate);

			if (implementation !== null) {

				(function(that, candidate, implementation, attachments, map) {

					var identifier = that.id + '.' + map.classId;

					implementation.onload = function(result) {

						map.loading--;


						// Fastest path, file doesn't exist
						if (result === false) {
							that.__blacklist[candidate] = 1;
							return;
						}



						var environment = that.environment;
						var definition  = environment.definitions[identifier] || null;
						if (definition !== null) {

							map.candidate = this;


							var attachmentIds = Object.keys(attachments);

							// Temporary delete definition from environment and re-define it after attachments are all loaded
							if (attachmentIds.length > 0) {
								delete environment.definitions[identifier];
							}


							attachmentIds.forEach(function(assetId) {

								var url   = attachments[assetId];
								var asset = lychee.Environment.createAsset(url);
								if (asset !== null) {

									map.loading++;

									asset.onload = function(result) {

										map.loading--;

										var tmp = {};
										if (result === true) {
											tmp[assetId] = this;
										} else {
											tmp[assetId] = null;
										}

										definition.attaches(tmp);


										if (map.loading === 0) {
											environment.definitions[identifier] = definition;
										}

									};

									asset.load();

								}

							});


							for (var i = 0, il = definition._includes.length; i < il; i++) {
								environment.load(definition._includes[i]);
							}

							for (var r = 0, rl = definition._requires.length; r < rl; r++) {
								environment.load(definition._requires[r]);
							}


							map.loading--;


							if (map.loading === 0) {
								environment.definitions[identifier] = definition;
							}

						} else {
							that.__blacklist[candidate] = 1;
						}

					};

					implementation.load();

				})(
					this,
					candidate,
					implementation,
					attachments,
					map
				);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id, url) {

		id = typeof id === 'string' ? id : 'game';


		this.environment = null;
		this.root        = null;
		this.tags        = {};
		this.type        = 'source';
		this.url         = null;
		this.config      = null;

		this.__blacklist = {};
		this.requests  = {};


		var tmp  = url.split('/');
		var file = tmp.pop();
		if (file === 'lychee.pkg') {

			this.id   = id;
			this.root = tmp.join('/');
			this.url  = url;


			var that = this;

			this.config = new Config(this.url);
			this.config.onload = function(result) {

				if (that.isReady() === false) {
					result = false;
				}


				if (result === true) {

					if (lychee.debug === true) {
						console.log('lychee.Package-' + that.id + ': Package at ' + this.url + ' ready');
					}

				} else {

					if (lychee.debug === true) {
						console.error('lychee.Package-' + that.id + ': Package at ' + this.url + ' corrupt');
					}

				}

			};
			this.config.load();

		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.Package',
				'arguments':   [ this.id, this.url ]
			};

		},



		/*
		 * CUSTOM API
		 */

		isReady: function() {

			var ready  = false;
			var config = this.config;

			if (config !== null && config.buffer !== null) {

				if (config.buffer.source instanceof Object && config.buffer.build instanceof Object) {
					ready = true;
				}

			}


			return ready;

		},

		load: function(classId, tags) {

			classId = typeof classId === 'string' ? classId : null;


			if (classId !== null && this.isReady() === true) {

				var request = this.requests[classId] || null;
				if (request === null) {

					var candidates = _resolve_candidates.call(this, classId, tags);
					if (candidates.length > 0) {

						_load_candidate.call(this, classId, candidates);

						return true;

					} else {

						if (lychee.debug === true) {
							var info = Object.keys(tags).length > 0 ? ('(' + JSON.stringify(tags) + ')') : '';
							console.error('lychee.Package-' + this.id + ': Invalid Definition "' + classId + '" ' + info);
						}

						return false;

					}

				} else {

					return true;

				}

			}


			return false;

		},

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {

				this.environment = environment;

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = typeof type === 'string' ? type : null;


			if (type !== null) {

				if (type === 'source' || type === 'export' || type === 'build') {

					this.type = type;

					return true;

				}

			}


			return false;

		}

	};


	return Class;

})(typeof global !== 'undefined' ? global : this);

