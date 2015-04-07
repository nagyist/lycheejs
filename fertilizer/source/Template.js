
lychee.define('fertilizer.Template').requires([
	'lychee.data.JSON',
	'fertilizer.data.Filesystem',
	'fertilizer.data.Shell'
]).includes([
	'lychee.event.Flow'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _JSON      = lychee.data.JSON;
	var _lychee_fs = new fertilizer.data.Filesystem('/lychee/build');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(environment, filesystem, shell) {

		this.environment = lychee.interfaceof(lychee.Environment,         environment) ? environment : null;
		this.filesystem  = lychee.interfaceof(fertilizer.data.Filesystem, filesystem)  ? filesystem  : null;
		this.shell       = lychee.interfaceof(fertilizer.data.Shell,      shell)       ? shell       : null;


		lychee.event.Flow.call(this);

	};


	Class.prototype = {

		replace: function(str, key, value) {

			str   = typeof str === 'string'   ? str   : '';
			key   = typeof key === 'string'   ? key   : null;
			value = typeof value === 'string' ? value : '';


			if (str !== '' && key !== null) {

				var indexes = [];
				var index   = str.indexOf(key);

				while (index !== -1) {
					indexes.push(index);
					index = str.indexOf(key, index + 1);
				}


				var keyo   = 0;
				var keyl   = key.length;
				var vall   = value.length;
				var buffer = '' + str;

				indexes.forEach(function(keyi) {

					buffer  = buffer.substr(0, keyi + keyo) + value + buffer.substr(keyi + keyo + keyl);
					keyo   += (vall - keyl);

				});


				return buffer;

			}


			return str;

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
			lines.push(' * (c) 2012-' + year + ' LazerUnicorns');
			lines.push(' * MIT License');
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

		}

	};


	return Class;

});

