
lychee.define('sorbet.api.remote.Service').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _dispatch_response = function(response, status, apidata, data) {

		if (data.method === 'OPTIONS') {

			var origin = data.origin;
			var port   = this.main.port || 80;
			var tmp    = [];

			for (var method in this.methods) {

				if (this.methods[method] === true) {
					tmp.push(method);
				}

			}


			var credentials = this.session === true ? 'true' : 'false';
			var methods     = tmp.join(',');

			response.header['Vary']                             = 'Origin';
			response.header['Access-Control-Allow-Credentials'] = credentials;
			response.header['Access-Control-Allow-Origin']      = 'http://' + origin + ':' + port;
			response.header['Access-Control-Allow-Methods']     = methods;
			response.header['Access-Control-Max-Age']           = 60 * 60;

		}


		response.status                 = status;
		response.header['Content-Type'] = 'application/json';
		response.content                = JSON.stringify(apidata, null, '\t');

	};

	var _parse_parameters = function(data) {

		var parameters = {};


		if (data.url.indexOf('?') !== -1) {

			var tmp = data.url.substr(data.url.indexOf('?') + 1).split('&');
			for (var t = 0, tl = tmp.length; t < tl; t++) {

				var tmp2 = tmp[t].split('=');
				parameters[tmp2[0]] = tmp2[1];

			}

		}

		if (typeof data.blob === 'string') {

			if (data.blob.length > 2) {

				var tmp3 = null;

				try {
					tmp3 = JSON.parse(data.blob);
				} catch(e) {
					tmp3 = null;
				}


				if (tmp3 !== null) {

					for (var prop in tmp3) {
						parameters[prop] = tmp3[prop];
					}

				}

			}

		}

		if (typeof data.identifier === 'string') {
			parameters.identifier = data.identifier;
		} else if (parameters.identifier === undefined) {
			parameters.identifier = null;
		}

		if (typeof data.host === 'string') {
			parameters.host = data.host;
		}

		if (typeof data.referer === 'string') {
			parameters.referer = data.referer;
		}


		for (var p in parameters) {

			if (parameters[p] === 'null' || parameters[p] === 'undefined') {
				parameters[p] = null;
			}

		}


		return parameters;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data, session) {

		this.session = session === true;
		this.methods = lychee.extend({
			'GET':     true,
			'OPTIONS': true,
			'PATCH':   true,
			'POST':    true,
			'PUT':     true
		}, data);


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		process: function(vhost, response, data) {

			var parameters = _parse_parameters(data);
			var origin     = this.main.vhosts.get(data.origin || data.host);
			var method     = this.methods[data.method];

			if (origin !== null && method === true) {

				var result = this.trigger(data.method, [ vhost, parameters, function(apiresult, apidata) {

					if (apiresult === true) {

						_dispatch_response.call(this, response, 200, apidata, data);

					} else {

						_dispatch_response.call(this, response, 404, apidata, data);

					}

					return true;

				}]);


				if (result === false) {

					_dispatch_response.call(this, response, 500, {}, data);

					return true;

				}


				return true;

			}


			return false;

		}

	};


	return Class;

});

