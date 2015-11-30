
lychee.define('fertilizer.Template').requires([
	'lychee.data.JSON',
	'fertilizer.data.Filesystem',
	'fertilizer.data.Shell'
]).includes([
	'lychee.event.Flow'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _JSON      = lychee.data.JSON;
	var _lychee_fs = new fertilizer.data.Filesystem('/libraries/lychee/build');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.environment = null;
		this.filesystem  = null;
		this.settings    = {};
		this.profile     = null;
		this.shell       = null;


		this.setEnvironment(settings.environment);
		this.setFilesystem(settings.filesystem);
		this.setProfile(settings.profile);
		this.setSettings(settings.settings);
		this.setShell(settings.shell);


		lychee.event.Flow.call(this);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var environment = lychee.deserialize(blob.environment);
			var filesystem  = lychee.deserialize(blob.filesystem);
			var shell       = lychee.deserialize(blob.shell);

			if (environment !== null) {
				this.setEnvironment(environment);
			}

			if (filesystem !== null) {
				this.setFilesystem(filesystem);
			}

			if (shell !== null) {
				this.setShell(shell);
			}

		},

		serialize: function() {

			var data = lychee.event.Flow.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.Template';


			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.profile !== null)                 settings.profile  = this.profile;
			if (Object.keys(this.settings).length > 0) settings.settings = this.settings;


			if (this.environment !== null) blob.environment = lychee.serialize(this.environment);
			if (this.filesystem !== null)  blob.filesystem  = lychee.serialize(this.filesystem);
			if (this.shell !== null)       blob.shell       = lychee.serialize(this.shell);


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		replace: function(template, object) {

			template = typeof template === 'string' ? template : '';
			object   = object instanceof Object     ? object   : null;


			if (object !== null) {

				var buffer = '' + template;
				var keys   = Object.keys(object);
				var values = Object.values(object);


				keys.forEach(function(key, k) {

					var value    = values[k];
					var pointers = [];
					var pointer  = buffer.indexOf('${' + key + '}');

					while (pointer !== -1) {
						pointers.push(pointer);
						pointer = buffer.indexOf('${' + key + '}', pointer + 1);
					}


					var offset = 0;

					pointers.forEach(function(index) {
						buffer  = buffer.substr(0, index + offset) + value + buffer.substr(index + offset + key.length + 3);
						offset += (value.length - (key.length + 3));
					});

				});


				return buffer;

			}


			return template;

		},

		getCore: function(variant) {

			variant = typeof variant === 'string' ? variant : null;


			if (variant !== null ){

				var core = _lychee_fs.read('/' + variant + '/core.js');
				if (core !== null) {
					return core.toString();
				}

			}


			return null;

		},

		getInfo: function(full) {

			full = full === true;


			var year  = new Date().getFullYear();
			var lines = [];


			lines.push('/*');
			lines.push(' * lycheeJS v' + lychee.VERSION);
			lines.push(' * http://lycheejs.org');
			lines.push(' * ');
			lines.push(' * (c) 2012-' + year + ' Artificial-Engineering');
			lines.push(' * MIT / Expat License');
			lines.push(' * ');

			var env = this.environment;
			if (env !== null && full === true) {

				lines.push(' * ');
				lines.push(' * Build:');
				lines.push(' * \t' + env.build);
				lines.push(' * ');
				lines.push(' * Tags:');
				lines.push(' * \t' + _JSON.encode(env.tags));
				lines.push(' * ');
				lines.push(' * Definitions:');

				var definitions = Object.keys(env.definitions);
				if (definitions.length > 0) {

					definitions.sort(function(a, b) {
						if (a < b) return -1;
						if (a > b) return  1;
						return 0;
					});

					definitions.forEach(function(id) {
						lines.push(' * \t' + id);
					});

				}

				lines.push(' * ');

			}


			lines.push(' */');

			return lines.join('\n');

		},

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {

				this.environment = environment;

				return true;

			}


			return false;

		},

		setFilesystem: function(filesystem) {

			filesystem = filesystem instanceof fertilizer.data.Filesystem ? filesystem : null;


			if (filesystem !== null) {

				this.filesystem = filesystem;

				return true;

			}


			return false;

		},

		setProfile: function(profile) {

			profile = profile instanceof Object ? profile : null;


			if (profile !== null) {

				this.profile = profile;

				return true;

			}


			return false;

		},

		setSettings: function(settings) {

			settings = settings instanceof Object ? settings : null;


			if (settings !== null) {

				this.settings = settings;

				return true;

			}


			return false;

		},

		setShell: function(shell) {

			shell = shell instanceof fertilizer.data.Shell ? shell : null;


			if (shell !== null) {

				this.shell = shell;

				return true;

			}


			return false;

		}

	};


	return Class;

});

