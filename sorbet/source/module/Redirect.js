
lychee.define('sorbet.module.Redirect').exports(function(lychee, sorbet, global, attachments) {

	var Class = function(main) {

		this.id   = 'Redirect';
		this.main = main || null;

	};


	Class.prototype = {

		process: function(vhost, response, data) {

			var url = typeof data.url === 'string' ? data.url : null;
			if (url !== null) {

				var vroot = vhost.root;
				if (url.substr(0, vroot.length) === vroot) {
					url = url.substr(vroot.length);
				}


				response.status             = 301;
				response.header['Location'] = url;
				response.content            = '';

				return true;

			}


			return false;

		}

	};


	return Class;

});

