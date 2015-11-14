
lychee.define('breeder.Template').requires([
	'lychee.data.JSON',
	'breeder.data.Filesystem',
	'breeder.data.Shell'
]).includes([
	'lychee.event.Flow'
]).exports(function(lychee, fertilizer, global, attachments) {

	var _JSON      = lychee.data.JSON;
	var _lychee_fs = new fertilizer.data.Filesystem('/lib/lychee/build');



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

		},

		getInit: function(namespaces) {

			var lines = [];


			for (var n = 0, nl = namespaces.length; n < nl; n++) {
				lines.push('var ' + namespaces[n] + ' = sandbox.' + namespaces[n] + ';');
			}


			return lines.join('\n');

		}

	};


	return Class;

});

