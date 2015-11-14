
lychee.define('tool.Main').requires([
	'lychee.data.JSON',
	'tool.state.Project',
	'tool.state.Scene'
]).includes([
	'lychee.app.Main'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	var _JSON   = lychee.data.JSON;
	var PROJECT = null;



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

	(function(global) {

		try {

			var gui = require('nw.gui');
			PROJECT = gui.App.argv[0];

		} catch(e) {

		}


		var location = global.location || null;
		if (location instanceof Object) {

			var url = (location.search || '?').substr(1);
			if (url.length > 0) {
				PROJECT = url;
			}

		}

	})(global);



	/*
	 * HELPERS
	 */



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({

			client:     null,
			input:      null,
			jukebox:    null,
			renderer:   null,
			server:     null,

			loop:       {
				update: 1/10,
				render: 0
			},

			viewport:   {
				fullscreen: false
			}

		}, data);


		this.project = null;


		lychee.app.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {
			oncomplete(true);
		}, this, true);

		this.bind('init', function() {

			this.setState('project', new tool.state.Project(this));
			this.setState('scene',   new tool.state.Scene(this));


			if (PROJECT !== null) {
				this.open(PROJECT);
			} else {
				this.changeState('project');
			}

		}, this, true);

	};


	Class.prototype = {

		open: function(url) {

			return this.changeState('scene', {
				url: url
			});

		}

	};


	return Class;

});
