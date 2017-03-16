
lychee.define('studio.net.Server').requires([
	'lychee.net.remote.Stash'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

	const _Server = lychee.import('lychee.net.Server');
	const _Stash  = lychee.import('lychee.net.remote.Stash');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({
		}, data);


		_Server.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('studio.net.Server: Remote connected (' + remote.host + ':' + remote.port + ')');

			remote.addService(new _Stash(remote));

		}, this);

		this.bind('disconnect', function(remote) {

			console.log('studio.net.Server: Remote disconnected (' + remote.host + ':' + remote.port + ')');

		}, this);


		this.connect();

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'studio.net.Server';


			return data;

		}

	};


	return Composite;

});

