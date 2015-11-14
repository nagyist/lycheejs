
lychee.define('sorbet.serve.api.Asset').requires([
	'lychee.data.JSON',
	'sorbet.data.Filesystem'
]).exports(function(lychee, sorbet, global, attachments) {

	var _JSON = lychee.data.JSON;



	/*
	 * HELPERS
	 */

	var _filesystem = new sorbet.data.Filesystem();

	var _HEADER = {
		'status':                      200,
		'access-control-allow-origin': '*',
		'content-control':             'no-transform',
		'content-cype':                'application/json'
	};

	var _read_asset = function(identifier, url, callback) {

		if (url.substr(0, ('/projects/' + identifier).length) === '/projects/' + identifier) {

			_filesystem.asset(url, function(data) {
				callback(data);
			}, this);

		} else {
			callback(null);
		}

	};

	var _save_asset = function(identifier, data) {

		if (data !== null) {

			var asset = lychee.deserialize(data);
			if (asset !== null) {

				var url = asset.url;
				if (url.substr(0, ('/projects/' + identifier).length) === '/projects/' + identifier) {

					var blob = asset.serialize().blob || null;
					if (blob !== null) {

						var index = blob.buffer.indexOf(',');
						if (index !== -1) {

							var result = _filesystem.write(url, new Buffer(blob.buffer.substr(index), 'base64'));
							if (result === true) {
								return true;
							}

						}

					}

				}

			}

		}


		return false;

	};

	var _deserialize = function(asset) {

		return lychee.deserialize(asset);

	};

	var _serialize = function(asset) {

		return lychee.serialize(asset);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		process: function(host, url, data, ready) {

			var method     = data.headers.method;
			var parameters = data.headers.parameters;
			var identifier = null;
			var local_url  = null;


			if (parameters instanceof Object) {
				identifier = parameters.identifier || null;
				local_url  = parameters.url        || null;
			}



			/*
			 * 1: OPTIONS
			 */

			if (method === 'OPTIONS') {

				ready({
					headers: {
						'status':                       200,
						'access-control-allow-headers': 'Content-Type',
						'access-control-allow-origin':  '*',
						'access-control-allow-methods': 'GET, PUT',
						'access-control-max-age':       60 * 60
					},
					payload: ''
				});



			/*
			 * 2: GET
			 */

			} else if (method === 'GET') {

				if (identifier !== null) {

					_read_asset(identifier, local_url, function(asset) {

						if (asset !== null) {

							ready({
								headers: _HEADER,
								payload: _JSON.encode(_serialize(asset))
							});

						} else {

							ready({
								headers: { 'status': 404, 'content-type': 'application/json' },
								payload: _JSON.encode({
									error: 'Asset not found.'
								})
							});

						}

					});

				} else {

	   				ready({
						headers: { 'status': 400, 'content-type': 'application/json' },
						payload: _JSON.encode({
							error: 'Bad Request: Invalid Identifier.'
						})
					});

				}



			/*
			 * 3: PUT
			 */

			} else if (method === 'PUT') {

				if (identifier !== null) {

					var result = _save_asset(identifier, _JSON.decode(data.payload));
					if (result === true) {

						ready({
							headers: _HEADER,
							payload: ''
						});

					} else {

						ready({
							headers: { 'status': 400, 'content-type': 'application/json' },
							payload: _JSON.encode({
								error: 'Bad Request: Invalid Payload.'
							})
						});

					}

				} else {

					ready({
						headers: { 'status': 400, 'content-type': 'application/json' },
						payload: _JSON.encode({
							error: 'Bad Request: Invalid Identifier.'
						})
					});

				}



			/*
			 * X: OTHER
			 */

			} else {

				ready({
					headers: { 'status': 405, 'content-type': 'application/json' },
					payload: _JSON.encode({
						error: 'Method not allowed.'
					})
				});

			}

		}

	};


	return Module;

});

