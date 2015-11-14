
lychee.define('app.state.Menu').includes([
	'lychee.app.state.Menu'
]).exports(function(lychee, app, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.app.state.Menu.call(this, main);

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		serialize: function() {

			var data = lychee.app.state.Menu.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Menu';


			return data;

		},

		deserialize: function(blob) {

			lychee.app.state.Menu.prototype.deserialize.call(this, blob);

		}

	};


	return Class;

});
