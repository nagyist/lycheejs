
lychee.define('lychee.net.client.Controller').includes([
	'lychee.net.client.Session'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _generate_code = function(length) {

		length = typeof length === 'number' ? (length | 0) : 4;

		var charset = '0123456789';
		var code    = '';

		for (var i = 0; i < length; i++) {
			code += charset.charAt((Math.random() * charset.length) | 0);
		}

		return code;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id, client, data) {

		id = typeof id === 'string' ? id : 'controller';


		var settings = lychee.extend({}, data);


		settings.autolock  = true;
		settings.autostart = true;
		settings.min       = 2;
		settings.max       = 2;
		settings.sid       = _generate_code(4);

		lychee.net.client.Session.call(this, id, client, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		control: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				this.multicast(data, {
					id:    this.id,
					event: 'control'
				});

				return true;

			}


			return false;

		}

	};


	return Class;

});

