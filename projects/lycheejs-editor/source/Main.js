
lychee.define('app.Main').requires([
	'app.codec.FONT',
	'app.data.Project',
	'app.net.Client',
	'app.net.Server',
	'app.state.Asset',
	'app.state.Project',
	'harvester.net.Client'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	const _app     = lychee.import('app');
	const _lychee  = lychee.import('lychee');
	const _Client  = lychee.import('harvester.net.Client');
	const _Main    = lychee.import('lychee.app.Main');
	const _Project = lychee.import('app.data.Project');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({

			input: {
				delay:       0,
				key:         true,
				keymodifier: false,
				touch:       true,
				swipe:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:     'app',
				width:  null,
				height: null
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		this.project = null;


		_Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			this.settings.appclient = this.settings.client;
			this.settings.client    = null;

			this.settings.appserver = this.settings.server;
			this.settings.server    = null;

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			let appclient = this.settings.appclient || null;
			if (appclient !== null) {
				this.client = new _app.net.Client(appclient, this);
				this.api    = new _Client({}, this);
			}

			let appserver = this.settings.appserver || null;
			if (appserver !== null) {
				this.server = new _app.net.Server(appserver, this);
			}


			this.setState('project', new _app.state.Project(this));
			this.setState('asset',   new _app.state.Asset(this));


			this.changeState('project');

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'app.Main';


			let settings = data['arguments'][0] || {};
			let blob     = data['blob'] || {};


			if (this.settings.appclient !== null) settings.client = this.defaults.client;
			if (this.settings.appserver !== null) settings.server = this.defaults.server;


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setProject: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				this.project = project;

				return true;

			}


			return false;

		}

	};


	return Composite;

});
