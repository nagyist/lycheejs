
lychee.define('app.Main').requires([
	'app.state.Welcome',
	'app.state.Profile',
//	'app.state.Console',
//	'app.state.Remote'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, app, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({

			client: null,
			server: null

		}, data);


		this.config  = null;
		this.profile = null;


		lychee.app.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			this.reload(function(config, profile) {
				oncomplete(true);
			}, this);

		}, this, true);

		this.bind('init', function() {

			this.setState('welcome', new app.state.Welcome(this));
			this.setState('profile', new app.state.Profile(this));
			// this.setState('console',  new app.state.Remote(this));
			// this.setState('remote',  new app.state.Remote(this));


			var state = this.getState('welcome');
			if (state !== null) {

				state.queryLayer('ui', 'menu').bind('#change', function(menu, value) {

					var layer = this.queryLayer('ui', value.toLowerCase());
					var state = this.main.getState(value.toLowerCase());

					if (layer !== null && this.main.state !== this) {
						this.main.changeState('welcome', value.toLowerCase());
					} else if (state !== null) {
						this.main.changeState(value.toLowerCase());
					}

				}, state);

			}


			this.changeState('welcome', 'welcome');

		}, this, true);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.app.Main.prototype.serialize.call(this);
			data['constructor'] = 'app.Main';

			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		reload: function(callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var that    = this;
			var config  = new Config('http://localhost:4848/api/Project?timestamp=' + Date.now());
			var profile = new Config('http://localhost:4848/api/Profile?timestamp=' + Date.now());


			config.onload = function(result) {

				if (this.buffer !== null) {
					that.config = this;
				}

				profile.load();

			};

			profile.onload = function(result) {

				if (this.buffer !== null) {
					that.profile = this;
				}

				callback.call(scope, that.config, that.profile);

			}

			config.load();

		}

	};


	return Class;

});
