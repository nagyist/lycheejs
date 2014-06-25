
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

			var range    = _parse_range(data.range);
			var resolved = data.resolved;
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


			var expires = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days

			response.async                   = true;
			response.status                  = 200;
			response.header['Cache-Control'] = 'no-transform';
			response.header['Content-Type']  = mime.type;
			response.header['Expires']       = new Date(expires).toUTCString();
			response.header['Vary']          = 'Accept-Encoding';
			response.content                 = '';

			if (mime.type.substr(0, 4) === 'text') {
				response.header['Content-Type'] = mime.type + '; charset=utf-8';
			}



			// TODO: Use fs.read(resolved, frombyte, tobyte, function(partial) {}, this); for Range Requests


			vhost.fs.read(resolved, function(buffer) {

				if (buffer === null) {

					this.main.modules.get('Error').process(vhost, response, {
						status: 501,
						host:   data.host,
						url:    data.url
					});

				} else {

					var info = vhost.fs.info(resolved);
					if (info !== null) {
						response.header['ETag']          = '"' + info.index + '-' + info.size + '-' + Date.parse(info.mtime) + '"';
						response.header['Last-Modified'] = new Date(info.mtime).toUTCString();
					}


					if (data.version >= 1.1) {

						if (range !== null) {

							range[1] = Math.min(range[1], buffer.length - 1);

							response.status                  = 206;
							response.header['Content-Range'] = 'bytes ' + range[0] + '-' + range[1] + '/' + buffer.length;
							response.content = buffer.slice(range[0], range[1] + 1);

						} else if (mime.stream === true) {

							response.status                  = 206;
							response.header['Content-Range'] = '0-' + (buffer.length - 1) + '/' + buffer.length;
							response.content = buffer;

						} else {

							if (mime.stream === true) {
								response.header['Accept-Ranges'] = 'bytes';
							}

							response.content = buffer;

						}

					} else {

						response.content = buffer;

					}

				}


				// Check if VFS cache was faster than the JS callstack.
				if (typeof response.ready === 'function') {
					response.ready();
				} else {
					response.async = false;
				}

			}, this);


			return true;

		}

	};


	return Class;

});

