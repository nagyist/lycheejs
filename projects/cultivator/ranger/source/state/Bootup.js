
lychee.define('tool.state.Bootup').includes([
	'lychee.app.State',
	'lychee.event.Emitter'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	/*
	 * HELPERS
	 */

	var _load_api = function(callback, scope) {

		var config = new Config('http://localhost:4848/api/Project?timestamp=' + Date.now());

		config.onload = function(result) {
			callback.call(scope, result);
		};

		config.load();

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.app.State.call(this, main);
		lychee.event.Emitter.call(this);


		/*
		 * INITIALIZATION
		 */

		this.bind('boot', function(profile) {

			location.href = 'lycheejs://boot=' + profile;


			setTimeout(function() {

				_load_api(function(result) {

					if (result === true) {
						ui.changeState('status');
					} else {
						ui.changeState('status');
					}

				}, this);

			}.bind(this), 200);

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize:   function() {},
		deserialize: function() {},



		/*
		 * CUSTOM API
		 */

		update: function(clock, delta) {},
		enter:  function() {},
		leave:  function() {}

	};


	return Class;

});

