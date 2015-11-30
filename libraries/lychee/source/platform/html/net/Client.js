
lychee.define('lychee.net.Client').tags({
	platform: 'html'
}).requires([
	'lychee.net.protocol.HTTP',
	'lychee.net.protocol.WS',
	'lychee.net.client.Debugger',
	'lychee.net.client.Stash',
	'lychee.net.client.Storage'
]).includes([
	'lychee.net.Tunnel'
]).supports(function(lychee, global) {

	if (typeof WebSocket !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__socket      = null;
		this.__isConnected = false;


		lychee.net.Tunnel.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		if (lychee.debug === true) {

			this.bind('connect', function() {
				this.addService(new lychee.net.client.Debugger(this));
			}, this);

		}


		this.bind('connect', function() {

			this.__isConnected = true;

			this.addService(new lychee.net.client.Stash(this));
			this.addService(new lychee.net.client.Storage(this));

		}, this);

		this.bind('disconnect', function() {
			this.__isConnected = false;
		}, this);

		this.bind('send', function(blob) {

			if (this.__socket !== null) {
				this.__socket.send(blob);
			}

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.net.Tunnel.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Client';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function() {

			if (this.__isConnected === false) {

				var that = this;

				var url  = 'ws://' + this.host + ':' + this.port;
				if (this.host.match(/:/)) {
					url = 'ws://[' + this.host + ']:' + this.port;
				}


				this.__socket = new WebSocket(url, [ 'lycheejs' ]);

				this.__socket.onopen = function() {
					that.trigger('connect');
				};

				this.__socket.onmessage = function(event) {
					that.receive(event.data);
				};

				this.__socket.onclose = function() {
					that.__socket = null;
					that.trigger('disconnect');
				};

				this.__socket.ontimeout = function() {
					that.setReconnect(0);
					this.close();
				};

				this.__socket.onerror = function() {
					that.setReconnect(0);
					this.close();
				};


				if (lychee.debug === true) {
					console.log('lychee.net.Client: Connected to ' + this.host + ':' + this.port);
				}


				return true;

			}


			return false;

		},

		disconnect: function() {

			if (this.__isConnected === true) {

				if (lychee.debug === true) {
					console.log('lychee.net.Client: Disconnected from ' + this.host + ':' + this.port);
				}

				if (this.__socket !== null) {

					this.__socket.close();
					this.__isConnected = false;

				} else {

					this.trigger('disconnect');
					this.__isConnected = false;

				}


				return true;

			}


			return false;

		}

	};


	return Class;

});

