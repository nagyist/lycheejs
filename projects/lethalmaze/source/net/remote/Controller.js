
lychee.define('game.net.remote.Controller').includes([
	'lychee.net.remote.Session'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */


	var _id       = 0;
	var _sessions = {};

	var _on_plug = function() {

		var found = null;

		Object.values(_sessions).forEach(function(session) {

			if (session.active === false && session.tunnels.length < 6) {
				found = session;
			}

		});


		if (found !== null) {

			found.tunnels.push(this.tunnel);

		} else {

			var id = 'lethalmaze-' + _id++;


			found = _sessions[id] = {
				id:      id,
				active:  false,
				timeout: 30000,
				tunnels: [ this.tunnel ]
			};


			var handle = setInterval(function() {

				var timeout = this.timeout;
				if (timeout > 1000) {

					this.timeout -= 1000;

				} else {

					clearInterval(handle);

					this.active  = true;
					this.timeout = 0;

				}

			}.bind(found), 1000);

		}


		var tunnel = this.tunnel;
		if (tunnel !== null) {

			tunnel.send({
				sid:     found.id,
				tid:     found.tunnels.indexOf(this.tunnel),
				timeout: found.timeout
			}, {
				id:    this.id,
				event: 'init'
			});

		}


	};

	var _on_unplug = function() {

		var that = this;


		_sessions = Object.filter(_sessions, function(value, key) {

			var index = value.tunnels.indexOf(that.tunnel);
			if (index !== -1) {
				value.tunnels.splice(index, 1);
			}


			if (value.tunnels.length !== 0) {

				if (index !== -1) {

					value.tunnels.forEach(function(remote) {

						remote.send({
							id: index
						}, {
							id:    that.id,
							event: 'destroy'
						});

					});

				}

				return true;

			} else {

				return false;

			}

		});

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		var settings = {};


		lychee.net.remote.Session.call(this, 'controller', remote, settings);


		this.bind('plug',   _on_plug,   this);
		this.bind('unplug', _on_unplug, this);

	};


	Class.prototype = {

	};


	return Class;

});

