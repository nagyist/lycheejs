
lychee.define('tool.Main').requires([
	'lychee.data.JSON',
	'tool.state.Bootup',
//	'tool.state.Console',
	'tool.state.Profiles',
	'tool.state.Remotes',
	'tool.state.Status'
]).includes([
	'lychee.game.Main'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	var _JSON = lychee.data.JSON;

	/*
	 * HACKS
	 */

	(function(global) {

		if (typeof global.addEventListener !== 'undefined') {

			global.addEventListener('click', function(event) {

				var target = event.target;
				if (target.tagName === 'A' && target.href.match(/lycheejs:\/\//g)) {

					setTimeout(function() {

						var main = global.MAIN || null;
						if (main !== null) {
							main.loop.trigger('update', []);
						}

					}, 200);

				}

			}, true);

		}

	})(global);



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

	var Class = function(data) {

		var settings = lychee.extend({

			client:   null,
			input:    null,
			jukebox:  null,
			renderer: null,
			server:   null,

			loop: {
				update: 1/10,
				render: 0
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		lychee.game.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {
			oncomplete(true);
		}, this, true);

		this.bind('init', function() {

			this.setState('bootup',   new tool.state.Bootup(this));
			this.setState('profiles', new tool.state.Profiles(this));
			this.setState('remotes',  new tool.state.Remotes(this));
			this.setState('status',   new tool.state.Status(this));


			_load_api(function(result) {

				if (result === true) {
					ui.changeState('status');
				} else {
					ui.changeState('bootup');
				}

			}, this);

		}, this, true);

	};


	Class.prototype = {

	};


	return Class;

});
