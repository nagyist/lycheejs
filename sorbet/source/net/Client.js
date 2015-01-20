
lychee.define('sorbet.net.Client').requires([
	'lychee.data.BitON',
	'sorbet.net.client.Debugger',
	'sorbet.net.client.Service'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, sorbet, global, attachments) {

	var _BitON    = lychee.data.BitON;
	var _debugger = sorbet.net.client.Debugger;
	var _service  = sorbet.net.client.Service;



	/*
	 * HELPERS
	 */

	var _initialize = function() {

		var that = this;

		var asset = lychee.Environment.createAsset('/api/Server?identifier=sorbet', 'json');
		if (asset !== null) {

			asset.onload = function(result) {

				if (result === true) {

					var port = this.buffer.port || 8081;
					var host = this.buffer.host || null;

					that.setHost(host);
					that.setPort(port);
					that.connect();

				}

			};

			asset.load();

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({
			codec: _BitON
		}, data);


		lychee.net.Client.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _debugger(this));
			this.addService(new _service(this));

			if (lychee.debug === true) {
				console.log('(Sorbet) sorbet.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code) {

			if (lychee.debug === true) {
				console.log('(Sorbet) sorbet.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);


		_initialize.call(this);

	};


	Class.prototype = {

	};


	return Class;

});

