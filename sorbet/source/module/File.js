
lychee.define('sorbet.module.File').exports(function(lychee, sorbet, global, attachments) {

	var _mime_types = attachments['json'].buffer;


	/*
	 * HELPERS
	 */

	var _parse_range = function(range) {

		if (typeof range !== 'string') return null;


		var tmp = range.split('=');
		if (tmp[0] === 'bytes') {

			var tmp1 = tmp[1].split('-');
			var min  = parseInt(tmp1[0], 10);
			var max  = parseInt(tmp1[1], 10);

			if (!isNaN(min)) {

				if (isNaN(max)) {
					max = Infinity;
				}

				return [ min, max ];

			}

		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.id   = 'File';
		this.main = main || null;

	};


	Class.MIME = lychee.extend({
		'default': { encoding: 'binary', type: 'application/octet-stream' }
	}, _mime_types);


	Class.prototype = {

		process: function(vhost, response, data) {

			var expires  = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
			var range    = _parse_range(data.range);
			var resolved = data.resolved;
			var info     = vhost.fs.info(resolved);
			var tmp1     = resolved.split('/');
			var tmp2     = tmp1[tmp1.length - 1].split('.');
			var ext      = tmp2[tmp2.length - 1];


			var mime = Class.MIME['default'];
			if (Class.MIME[ext] !== undefined) {

				mime = Class.MIME[ext];

			} else {

				if (lychee.debug === true) {
					console.error('sorbet.module.File: Invalid MIME Type for "' + resolved + '"');
				}

			}


			if (info === null) {

				this.main.modules.get('Error').process(vhost, response, {
					status: 404,
					host:   data.host,
					url:    data.url
				});

			} else {

				var timestamp = data.timestamp || null;
				if (timestamp !== null) {

					var modified = new Date(timestamp) > new Date(info.time);
					if (modified === false) {

						response.async   = false;
						response.status  = 304;

						return true;

					}

				}


				response.async                   = true;
				response.header['ETag']          = '"' + info.index + '-' + info.length + '-' + Date.parse(info.time) + '"';
				response.header['Last-Modified'] = new Date(info.time).toUTCString();
				response.header['Cache-Control'] = 'no-transform';
				response.header['Content-Type']  = mime.type;
				response.header['Expires']       = new Date(expires).toUTCString();
				response.header['Vary']          = 'Accept-Encoding';
				response.content                 = '';

				if (mime.type.substr(0, 4) === 'text') {
					response.header['Content-Type'] = mime.type + '; charset=utf-8';
				}



				if (data.version >= 1.1) {

					if (range === null) {

						vhost.fs.read(resolved, function(buffer) {

							if (buffer !== null) {

								response.status  = 200;
								response.content = buffer;

							} else {

								response.status  = 500;
								response.content = '';

							}

							response.ready();

						}, this);

					} else {

						range[1] = Math.min(range[1], info.length);

						vhost.fs.readchunk(resolved, range[0], range[1], function(chunk) {

							if (chunk !== null) {

								response.status                  = 206;
								response.header['Content-Range'] = 'bytes ' + range[0] + '-' + (range[1] - 1) + '/' + chunk.length;
								response.content                 = chunk;

							} else {

								response.status  = 500;
								response.content = '';

							}

							response.ready();

						}, this);

					}

				} else {

					vhost.fs.read(resolved, function(buffer) {

						if (buffer !== null) {

							response.status  = 200;
							response.content = buffer;

						} else {

							response.status  = 500;
							response.content = '';

						}

						response.ready();

					}, this);

				}

			}


			return true;

		}

	};


	return Class;

});

