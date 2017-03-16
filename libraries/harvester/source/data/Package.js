
lychee.define('harvester.data.Package').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _Emitter = lychee.import('lychee.event.Emitter');



	/*
	 * HELPERS
	 */

	const _parse_buffer = function() {

		let json = null;

		try {
			json = JSON.parse(this.buffer.toString('utf8'));
		} catch (err) {
		}


		if (json instanceof Object) {

			if (json.api instanceof Object) {

				if (json.api.files instanceof Object) {
					_walk_directory(this.api, json.api.files, '');
				}

			} else {

				json.api = {
					files: {}
				};

			}


			if (json.build instanceof Object) {

				if (json.build.files instanceof Object) {
					_walk_directory(this.build, json.build.files, '');
				}

			} else {

				json.build = {
					environments: {},
					files:        {}
				};

			}


			if (json.source instanceof Object) {

				if (json.source.files instanceof Object) {
					_walk_directory(this.source, json.source.files, '');
				}

			} else {

				json.source = {
					environments: {},
					files:        {},
					tags:         {}
				};

			}


			this.json = json;

		}

	};

	const _walk_directory = function(files, node, path) {

		if (node instanceof Array) {

			node.forEach(function(ext) {

				if (/msc|snd/.test(ext)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				} else if (/js|json|fnt|png/.test(ext)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				} else if (/md/.test(ext)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				}

			});

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child);
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(buffer) {

		this.buffer = null;

		this.api    = [];
		this.build  = [];
		this.source = [];
		this.json   = {};


		this.setBuffer(buffer);


		_Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let buffer = lychee.deserialize(blob.buffer);
			if (buffer !== null) {
				this.setBuffer(buffer);
			}

		},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'harvester.data.Package';


			let blob = data['blob'] || {};


			if (this.buffer !== null) blob.buffer = lychee.serialize(this.buffer);


			data['arguments'][0] = null;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setBuffer: function(buffer) {

			buffer = buffer instanceof Buffer ? buffer : null;


			if (buffer !== null) {

				this.buffer = buffer;
				_parse_buffer.call(this);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

