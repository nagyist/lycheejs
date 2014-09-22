
lychee.define('sorbet.module.honey.Admin').exports(function(lychee, sorbet, global, attachments) {

	var _content = {
		'/admin/':               attachments['index.php'].buffer,
		'/admin/index.html':     attachments['index.php'].buffer,
		'/admin/index.php':      attachments['index.php'].buffer,
		'/admin/config.php':     '\n\n\n',
		'/admin/config.php.bak': attachments['config.php.bak'].buffer
	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {};


	Module.URLS = {
		'/admin/':               true,
		'/admin/*':              true,
		'/admin/index.html':     false,
		'/admin/index.php':      false,
		'/admin/config.php':     false,
		'/admin/config.php.bak': false
	};


	Module.process = function(vhost, response, data) {

		var url = data.url;
		if (Module.URLS[url] !== undefined) {

			var content = _content[url] || null;
			if (content !== null) {

				response.status                 = 200;
				response.header['Content-Type'] = 'text/html';
				response.content                = content;

			}


			return true;

		}


		return false;

	};


	return Module;

});

