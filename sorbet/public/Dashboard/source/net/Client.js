
lychee.define('dashboard.net.Client').requires([
	'sorbet.api.client.Debugger',
	'sorbet.api.client.Log',
	'sorbet.api.client.Project',
	'sorbet.api.client.VirtualHost'
]).includes([
	'sorbet.api.Client'
]).exports(function(lychee, dashboard, global, attachments) {

	var _debugger    = sorbet.api.client.Debugger;
	var _log         = sorbet.api.client.Log;
	var _project     = sorbet.api.client.Project;
	var _virtualhost = sorbet.api.client.VirtualHost;


	var Class = function(settings, main) {

		sorbet.api.Client.call(this, {
			encoder:   JSON.stringify,
			decoder:   JSON.parse,
			reconnect: 10000
		});


		// This is necessary, because Storage depends on services
		this.addService(new _debugger(this));
		this.addService(new _log(this));
		this.addService(new _project(this));
		this.addService(new _virtualhost(this));


		this.bind('connect', function() {

			if (lychee.debug === true) {
				console.log('(Dashboard) dashboard.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code, reason) {

			if (lychee.debug === true) {
				console.log('(Dashboard) dashboard.net.Client: Remote disconnected (' + code + ' | ' + reason + ')');
			}

		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});

