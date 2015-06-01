
lychee.define('lychee.net.client.Debugger').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	var Class = function(client) {


		this.mode = 'debugger';


		lychee.net.Service.call(this, 'debugger', client, lychee.net.Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */

		this.bind('execute', function(data) {

			// TODO: data.reference, data.arguments
			// if reference is Function, call with arguments
			// if reference is Object
			//     if key of properties is available as setKey(), use method
			//     else if Object has property key, set key directly

console.info('EXECUTING DEBUGGER COMMAND NAO ');
console.log(data);

		}, this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		connect: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.tunnel !== null) {

				this.tunnel.send({
					id:    id,
					mode:  this.mode
				}, {
					id:    'debugger',
					event: 'connect'
				});


				return true;

			}


			return false;

		},

		execute: function(data) {

			data = data instanceof Object ? data : null;

			// TODO: execute command only on single remote

			if (data !== null && this.tunnel !== null) {

				this.tunnel.send({
					reference: data.reference || null,
					arguments: data.arguments || null
				}, {
					id:    'debugger',
					event: 'execute'
				});


				return true;

			}


			return false;

		},

		disconnect: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.tunnel !== null) {

				this.tunnel.send({
					id:    id,
					mode:  this.mode
				}, {
					id:    'debugger',
					event: 'disconnect'
				});


				return true;

			}


			return false;

		},

		setMode: function(mode) {

			mode = typeof mode === 'string' ? mode : null;


			if (mode !== null) {

				this.mode = mode;

				return true;

			}


			return false;

		}

	};


	return Class;

});

