
lychee.define('fertilizer.data.Shell').exports(function(lychee, fertilizer, global, attachments) {

	var _child_process = require('child_process');
	var _path          = require('path');
	var _root          = _path.resolve(__dirname + '/../../../');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(root) {

		this.root = _root + _path.normalize(root);

	};


	Class.prototype = {

		exec: function(command, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (callback !== null) {

				_child_process.exec(this.root + command, {
					cwd: this.root
				}, function(err, stdout, stderr) {

					if (err) {
						callback.call(scope, false);
					} else {
						callback.call(scope, true);
					}

				});

			} else {

				try {

					var stdout = _child_process.execSync(this.root + command, {
						cwd: this.root
					}).toString();

					if (stdout.match(/SUCCESS/)) {
						return true;
					} else {
						return false;
					}

				} catch(err) {
					return false;
				}

			}

		}

	};


	return Class;

});

