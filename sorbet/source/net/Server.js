
lychee.define('sorbet.net.Server').requires([
	'lychee.data.BitON',
	'sorbet.net.remote.Debugger',
	'sorbet.net.remote.Session'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, sorbet, global, attachments) {

	var _BitON    = lychee.data.BitON;
	var _debugger = sorbet.net.remote.Debugger;
	var _session  = sorbet.net.remote.Session;


	var Class = function() {

		lychee.net.Server.call(this, {
			encoder: _BitON.encode,
			decoder: _BitON.decode
		});


		this.bind('connect', function(remote) {

			console.log('(Sorbet) sorbet.net.Server: New Remote (' + remote.id + ')');

			remote.register('debugger', _debugger);
			remote.register('session',  _session);
			remote.accept();

		}, this);

	};


	Class.prototype = {

		listen: function(port, host) {

			console.log('(Sorbet) sorbet.net.Server: Listening on ' + host + ':' + port);

			lychee.net.Server.prototype.listen.call(this, port, host);

		}

	};


	return Class;

});

