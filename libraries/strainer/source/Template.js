
lychee.define('strainer.Template').requires([
	'lychee.Stash',
	'strainer.data.API'
//	'strainer.data.FIX'
]).includes([
	'lychee.event.Flow'
]).exports(function(lychee, global, attachments) {

	const _API   = lychee.import('strainer.data.API');
	const _FIX   = lychee.import('strainer.data.FIX');
	const _Flow  = lychee.import('lychee.event.Flow');
	const _Stash = lychee.import('lychee.Stash');
	const _STASH = new _Stash({
		type: _Stash.TYPE.persistent
	});



	/*
	 * HELPERS
	 */

	const _walk_directory = function(files, node, path, attachments) {

		if (node instanceof Array) {

			if (node.indexOf('js') !== -1) {
				files.push(path + '.js');
			}

			if (attachments === true) {

				node.filter(function(ext) {
					return ext !== 'js';
				}).forEach(function(ext) {
					files.push(path + '.' + ext);
				});

			}

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child, attachments);
			});

		}

	};

	const _package_files = function(json) {

		let files = [];


		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '', false);
			}


			files = files.map(function(value) {
				return value.substr(1);
			}).filter(function(value) {
				return value.substr(0, 4) !== 'core' && value.substr(-12) !== 'bootstrap.js';
			}).filter(function(value) {
				return value.indexOf('__') === -1;
			}).sort();

		}


		return files;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.codes    = [];
		this.configs  = [];
		this.sandbox  = '';
		this.settings = {};
		this.stash    = new _Stash({
			type: _Stash.TYPE.persistent
		});


		this.setSandbox(settings.sandbox);
		this.setSettings(settings.settings);


		_Flow.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read', function(oncomplete) {

			let project = this.settings.project;
			let sandbox = this.sandbox;
			let stash   = this.stash;

			if (sandbox !== '' && stash !== null) {

				console.log('strainer: READ ' + project);


				let that = this;
				let pkg  = new Config(sandbox + '/lychee.pkg');


				pkg.onload = function(result) {

					if (result === true) {

						let files = _package_files(this.buffer);
						if (files.length > 0) {

							stash.bind('batch', function(type, assets) {

								this.setCodes(assets);
								oncomplete(true);

							}, that, true);

							stash.batch('read', files.map(function(value) {
								return sandbox + '/source/' + value;
							}));

						} else {

							oncomplete(false);

						}

					} else {

						oncomplete(false);

					}

				};

				pkg.load();

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('read-fix', function(oncomplete) {

			// TODO: Implementation for automated fixes

			oncomplete(true);

		}, this);

		this.bind('read-api', function(oncomplete) {

			let codes = this.codes;
			if (codes.length > 0) {

				let configs = [];

				for (let c = 0, cl = codes.length; c < cl; c++) {

					let code = codes[c];
					let url  = code.url.replace(/source/, 'api').replace(/\.js$/, '.json');

					if (code.buffer !== null) {

						let data   = _API.decode(code.buffer);
						let config = new lychee.Asset(code.url.replace(/source/, 'api').replace(/\.js$/, '.json'), 'json', true);
						if (config !== null) {

							config.buffer = data;
							configs.push(config);

						} else {

							codes.splice(c, 1);
							cl--;
							c--;

						}

					}

				}


				this.setConfigs(configs);
				this.setCodes(codes);

				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('write', function(oncomplete) {

			let project = this.settings.project;
			let stash   = this.stash;


			if (project !== null && stash !== null) {

				console.log('strainer: WRITE ' + project);


				let sandbox = this.sandbox;
				let codes   = this.codes;
				let configs = this.configs;


				stash.bind('batch', function(type, assets) {

					if (assets.length === configs.length) {
						oncomplete(true);
					} else {
						oncomplete(false);
					}

				}, this, true);


				stash.batch('write', configs.map(function(config) {
					return config.url;
				}), configs);

			} else {

				oncomplete(false);

			}

		});

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.codes instanceof Array) {

				let codes = [];

				for (let bc1 = 0, bc1l = blob.codes.length; bc1 < bc1l; bc1++) {
					codes.push(lychee.deserialize(blob.codes[bc1]));
				}

				if (codes.length > 0) {
					this.setCodes(codes);
				}

			}


			if (blob.configs instanceof Array) {

				let configs = [];

				for (let bc2 = 0, bc2l = blob.configs.length; bc2 < bc2l; bc2++) {
					configs.push(lychee.deserialize(blob.codes[bc2]));
				}

				if (configs.length > 0) {
					this.setConfigs(configs);
				}

			}


			let stash = lychee.deserialize(blob.stash);
			if (stash !== null) {
				this.stash = stash;
			}

		},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'strainer.Template';


			let settings = data['arguments'][0] || {};
			let blob     = data['blob'] || {};


			if (this.sandbox !== '')                   settings.sandbox  = this.sandbox;
			if (Object.keys(this.settings).length > 0) settings.settings = this.settings;


			if (this.stash !== null)     blob.stash   = lychee.serialize(this.stash);
			if (this.codes.length > 0)   blob.codes   = this.codes.map(lychee.serialize);
			if (this.configs.length > 0) blob.configs = this.configs.map(lychee.serialize);


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setCodes: function(codes) {

			codes = codes instanceof Array ? codes : null;


			if (codes !== null) {

				this.codes = codes.filter(function(asset) {

					if (typeof asset.buffer === 'string' && asset.buffer.length > 0) {
						return true;
					}

					return false;

				});


				return true;

			}


			return false;

		},

		setConfigs: function(configs) {

			configs = configs instanceof Array ? configs : null;


			if (configs !== null) {

				this.configs = configs.filter(function(asset) {

					if (asset.buffer instanceof Object) {
						return true;
					}

					return false;

				});


				return true;

			}


			return false;

		},

		setSandbox: function(sandbox) {

			sandbox = typeof sandbox === 'string' ? sandbox : null;


			if (sandbox !== null) {

				this.sandbox = sandbox;


				return true;

			}


			return false;

		},

		setSettings: function(settings) {

			settings = settings instanceof Object ? settings : null;


			if (settings !== null) {

				this.settings = settings;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

