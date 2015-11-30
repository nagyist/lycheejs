
lychee.define('harvester.serve.File').requires([
	'harvester.data.Filesystem'
]).exports(function(lychee, harvester, global, attachments) {

	/*
	 * HELPERS
	 */

	var _public_filesystem     = new harvester.data.Filesystem('/libraries/harvester/public');
	var _cultivator_filesystem = new harvester.data.Filesystem('/projects/cultivator');


	var _get_response = function(info, mime) {

		var response = {
			headers: {
				'status':          200,
				'e-tag':           '"' + info.length + '-' + Date.parse(info.time) + '"',
				'last-modified':   new Date(info.time).toUTCString(),
				'content-control': 'no-transform',
				'content-type':    mime.type,
				'expires':         new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toUTCString(),
				'vary':            'Accept-Encoding'
			},
			payload: null
		};


		if (mime.type.substr(0, 4) === 'text') {
			response.headers['content-type'] = mime.type + '; charset=utf-8';
		}


		return response;

	};

	var _serve_cultivator = function(url, mime, ready) {

		var info = _cultivator_filesystem.info(url);
		if (info !== null && info.type === 'file') {

			_cultivator_filesystem.read(url, function(buffer) {

				var response;

				if (buffer !== null) {

					response = _get_response(info, mime);
					response.payload = buffer;
					ready(response);

				} else {
					ready(null, mime.type);
				}

			}, this);

		} else {

			ready(null, mime.type);

		}

	};

	var _serve_public = function(url, mime, ready) {

		var info = _public_filesystem.info(url);
		if (info !== null && info.type === 'file') {

			_public_filesystem.read(url, function(buffer) {

				var response;

				if (buffer !== null) {

					response = _get_response(info, mime);
					response.payload = buffer;
					ready(response);

				} else {
					ready(null, mime.type);
				}

			}, this);

		} else {

			ready(null, mime.type);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var _MIME = {

		'default': { binary: true,  type: 'application/octet-stream'      },

		'css':     { binary: false, type: 'text/css'                      },
		'env':     { binary: false, type: 'application/json'              },
		'eot':     { binary: false, type: 'application/vnd.ms-fontobject' },
		'gz':      { binary: true,  type: 'application/x-gzip'            },
		'fnt':     { binary: false, type: 'application/json'              },
		'html':    { binary: false, type: 'text/html'                     },
		'ico':     { binary: true,  type: 'image/x-icon'                  },
		'jpg':     { binary: true,  type: 'image/jpeg'                    },
		'js':      { binary: false, type: 'application/javascript'        },
		'json':    { binary: false, type: 'application/json'              },
		'md':      { binary: false, type: 'text/x-markdown'               },
		'mf':      { binary: false, type: 'text/cache-manifest'           },
		'mp3':     { binary: true,  type: 'audio/mp3'                     },
		'ogg':     { binary: true,  type: 'application/ogg'               },
		'pkg':     { binary: false, type: 'application/json'              },
		'store':   { binary: false, type: 'application/json'              },
		'tar':     { binary: true,  type: 'application/x-tar'             },
		'ttf':     { binary: false, type: 'application/x-font-truetype'   },
		'txt':     { binary: false, type: 'text/plain'                    },
		'png':     { binary: true,  type: 'image/png'                     },
		'svg':     { binary: true,  type: 'image/svg+xml'                 },
		'woff':    { binary: false, type: 'application/font-woff'         },
		'xml':     { binary: false, type: 'text/xml'                      },
		'zip':     { binary: true,  type: 'application/zip'               }

	};


	var Module = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			return {
				'reference': 'harvester.serve.File',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(host, url) {

			var project = null;
			var path    = null;
			var info    = null;


			// /libraries/breeder
			if (url.substr(0, 10) === '/libraries') {

				project = host.getLibrary(url.split('/').slice(0, 3).join('/'));

				if (project !== null) {

					path = '/' + url.split('/').slice(3).join('/');
					info = project.filesystem.info(path);

					if (info !== null && info.type === 'file') {
						return true;
					}

				}


			// /projects/cultivator
			} else if (host.cultivator === true && url.substr(0, 20) === '/projects/cultivator') {

				path = url.substr(20);
				info = _cultivator_filesystem.info(path);

				if (info !== null && info.type === 'file') {
					return true;
				}


			// /projects/*
			} else if (url.substr(0, 9) === '/projects') {

				project = host.getProject(url.split('/').slice(0, 3).join('/'));

				if (project !== null) {

					path = '/' + url.split('/').slice(3).join('/');
					info = project.filesystem.info(path);

					if (info !== null && info.type === 'file') {
						return true;
					}

				}


			// /*
			} else if (host.cultivator === false) {

				project = host.projects[0] || null;

				if (project !== null) {

					path = url;
					info = project.filesystem.info(path);

					if (info !== null && info.type === 'file') {
						return true;
					}

				}

			}


			var public_info = _public_filesystem.info(url);
			if (public_info !== null && public_info.type === 'file') {
				return true;
			}


			return false;

		},

		process: function(host, url, data, ready) {

			var identifier = null;
			var path       = null;
			var project    = null;
			var mime       = _MIME[url.split('.').pop()] || _MIME['default'];


			// /libraries/breeder
			if (url.substr(0, 10) === '/libraries') {

				identifier = url.split('/').slice(0, 3).join('/');
				path       = '/' + url.split('/').slice(3).join('/');
				project    = host.getLibrary(identifier);


			// /projects/*
			} else if (url.substr(0, 9) === '/projects') {

				identifier = url.split('/').slice(0, 3).join('/');
				path       = '/' + url.split('/').slice(3).join('/');
				project    = host.getProject(identifier);


			// /*
			} else if (host.cultivator === false) {

				project = host.projects[0] || null;

				if (project !== null) {
					identifier = project.identifier;
					path       = url;
				}

			}


			if (project !== null) {

				var info = project.filesystem.info(path);
				if (info !== null && info.type === 'file') {

					var timestamp = data.headers['if-modified-since'] || null;
					if (timestamp !== null) {

						var diff = new Date(info.time) > new Date(timestamp);
						if (diff === false) {

							ready({
								headers: {
									'status':        304,
									'last-modified': new Date(info.time).toUTCString()
								},
								payload: ''
							});

							return;

						}

					}


					project.filesystem.read(path, function(buffer) {

						var response;

						if (buffer !== null) {

							response = _get_response(info, mime);
							response.payload = buffer;
							ready(response);

						} else {
							ready(null, mime.type);
						}

					}, this);

				} else {

					_serve_public(url, mime, ready);

				}

			} else {

				if (host.cultivator === true && url.substr(0, 20) === '/projects/cultivator') {
					_serve_cultivator(url.substr(20), mime, ready);
				} else {
					_serve_public(url, mime, ready);
				}

			}

		}

	};


	return Module;

});

