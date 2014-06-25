
lychee.define('sorbet.data.Template').exports(function(lychee, dashboard, global, attachments) {

	/*
	 * HELPERS
	 */

	var _find_marker = function(lines, start, marker) {

		var position = -1;

		for (var l = start; l < lines.length; l++) {

			var line = lines[l];
			if (line.indexOf(marker) !== -1) {
				position = l;
				break;
			}

		}


		return position;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(attachment) {

		this.__source = '';


		if (attachment instanceof Object) {

			if (typeof attachment.buffer === 'string') {
				this.__source = attachment.buffer;
			}

		}

	};


	Class.prototype = {

		render: function(data) {

			data = data instanceof Object ? data : {};


			var lines = this.__source.split('\n');


			var s, v, vl, vid;

			for (var l = 0, ll = lines.length; l < ll; l++) {

				var line = lines[l];

				for (var key in data) {

					var value = data[key];
					if (line.indexOf('{{for ' + key + '}}') !== -1) {

						var start    = l + 1;
						var stop     = _find_marker(lines, l, '{{/for ' + key + '}}');
						var forchunk = '';

						if (stop > start) {

							if (value instanceof Array) {

								for (v = 0, vl = value.length; v < vl; v++) {

									for (s = start; s < stop; s++) {

										if (lines[s].indexOf('{{' + key + '[$]}}') !== -1) {
											forchunk += lines[s].replace('{{' + key + '[$]}}', value[v]).trim();
										} else {
											forchunk += lines[s].trim();
										}

									}

								}

							} else if (value instanceof Object) {

								for (vid in value) {

									for (s = start; s < stop; s++) {

										if (lines[s].indexOf('{{$}}') !== -1) {
											forchunk += lines[s].replace('{{$}}', vid).trim();
										} else if (lines[s].indexOf('{{' + key + '[$]}}') !== -1) {
											forchunk += lines[s].replace('{{' + key + '[$]}}', value[vid]).trim();
										} else {
											forchunk += lines[s].trim();
										}

									}

								}

							}


							lines[l] = forchunk;

							for (s = start; s < stop + 1; s++) {
								lines.splice(start, 1);
								ll--;
								l--;
							}

						}

					} else if (value instanceof Array) {

						for (v = 0, vl = value.length; v < vl; v++) {

							if (line.indexOf('{{' + key + '[' + v + ']}}') !== -1) {
								lines[l] = line.replace('{{' + key + '[' + v + ']}}', value[v]);
							}

						}

					} else {

						if (line.indexOf('{{' + key + '}}') !== -1) {
							lines[l] = line.replace('{{' + key + '}}', value);
						}

					}

				}

			}


			return lines.join('\n');

		}

	};


	return Class;

});

