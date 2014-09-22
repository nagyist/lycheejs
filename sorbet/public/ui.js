
var ui = (function(lychee, global) {

	var _document      = global.document;
	var _events        = [];
	var _dropzones     = [];
	var _notifications = _document.querySelector('ul#ui-notifications') || null;

	var _stub = function(event) {
		event.stopPropagation();
		event.preventDefault();
	};


	/*
	 * EVENTS
	 */

	var _on_drop = function(files, dropzone) {

		if (files.length > 0) {

			for (var f = 0, fl = files.length; f < fl; f++) {

				(function(file, callback, scope) {

					var reader = new FileReader();

					reader.onload = function(event) {

						callback.call(scope, {
							name: file.name,
							type: file.type,
							blob: event.target.result
						});

					};

					reader.readAsDataURL(file);

				})(files[f], dropzone.callback, dropzone.scope);

			}

		}

	};

	var _unbind_dropzone = function(dropzone) {

		var elements = dropzone.elements;

		for (var e = 0, el = elements.length; e < el; e++) {
			elements[e].removeEventListener('dragenter');
			elements[e].removeEventListener('dragover');
			elements[e].removeEventListener('drop');
		}

	};

	var _bind_dropzone = function(dropzone) {

		var elements = dropzone.elements;

		for (var e = 0, el = elements.length; e < el; e++) {

			elements[e].addEventListener('dragenter', _stub,    false);
			elements[e].addEventListener('dragover',  _stub,    false);
			elements[e].addEventListener('drop',      function(event) {
				_stub(event);
				_on_drop(event.dataTransfer.files || [], dropzone);
			}, false);

		}

	};

	var _refresh_dropzones = function() {

		for (var d = 0, dl = _dropzones.length; d < dl; d++) {

			var found = null;

			for (var e = 0, el = _dropzones[d].elements.length; e < el; e++) {

				var parent = _dropzones[d].elements[e].parentNode || null;
				if (parent === null) {
					found = _dropzones[d];
					break;
				}

			}

			if (found !== null) {

				if (found.dynamic === true) {

					_unbind_dropzone(found);

					var elements = ui.query(found.query);
					if (elements.length > 0) {
						found.elements = elements;
					} else {
						found.elements = [];
					}

					_bind_dropzone(found);

				} else {

					_dropzones.splice(d, 1);
					dl--;
					d--;

				}

			}

		}

	};

	var _refresh_events = function() {

		for (var ev = 0, evl = _events.length; ev < evl; ev++) {

			var found = null;

			for (var el = 0, ell = _events[ev].elements.length; el < ell; el++) {

				var parent = _events[ev].elements[el].parentNode || null;
				if (parent === null) {
					found = _events[ev];
					break;
				}

			}

			if (found !== null) {

				if (found.dynamic === true) {

					var elements = ui.query(found.query);
					if (elements.length > 0) {
						found.elements = elements;
					} else {
						found.elements = [];
					}

				} else {

					_events.splice(ev, 1);
					evl--;
					ev--;

				}

			}

		}

	};

	var _listeners = {

		touch: function(event) {

			var data  = null;
			var found = null;

			for (var ev = 0, evl = _events.length; ev < evl; ev++) {

				for (var el = 0, ell = _events[ev].elements.length; el < ell; el++) {

					var element = _events[ev].elements[el];
					if (element === event.target) {

						found = _events[ev];
						data  = event.target.getAttribute('data-identifier') || (event.target.innerHTML + '');

						break;

					}

				}

				if (found !== null) break;

			}


			if (found !== null) {
				found.callback.call(found.scope, data);
				event.stopPropagation();
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		var keyboard = false;
		var touch    = 'ontouchstart' in global;
		var mouse    = 'onmousedown' in global;


		if (typeof global.addEventListener === 'function') {


			if (touch) {

				global.addEventListener('touchstart', _listeners.touch, true);

			} else if (mouse) {

				global.addEventListener('click',      _listeners.touch, true);

			}

		}


		if (lychee.debug === true) {

			var methods = [];

			if (keyboard) methods.push('Keyboard');
			if (touch)    methods.push('Touch');
			if (mouse)    methods.push('Mouse');

			if (methods.length === 0) {
				console.error('ui: Supported methods are NONE');
			} else {
				console.info('ui: Supported methods are ' + methods.join(', '));
			}

		}

	})();



	/*
	 * HELPERS
	 */

	var _resolve_constructor = function(identifier) {

		var pointer = this;

		var ns = identifier.split('.');
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = null;
				break;
			}

		}


		return pointer;

	};



	/*
	 * GRAPH ENGINE
	 */

	var _render_graph = function(width, height, data) {

		var content    = '';
		var dimensions = Object.keys(data);


		content += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '">';

		content += '<g class="legend">';
		dimensions.forEach(function(value, index) {
			content += '<text x="0" y="' + (index * 14 + 12) + '" title="' + value + '">' + value + '</text>';
		});
		content += '</g>';

		content += '<g class="graph">';
		dimensions.forEach(function(dimension, index) {

			var dataset  = data[dimension];
			var points   = [];
			var maxvalue = 1;

			dataset.forEach(function(value) {
				maxvalue = Math.max(maxvalue, value);
			});

			var dx = (width  / dataset.length).toFixed(2);
			var dy = (height / maxvalue * 7/8).toFixed(2);


			dataset.forEach(function(value, index) {

				var x = dx * (index + 0.5);
				var y = dy * value;

				points.push(x + ' ' + (height - y));

			});


			content += '<polyline title="' + dimension + '" points="' + points.join(' ') + '"></polyline>';

		});
		content += '</g>';

		content += '<g class="label">';
		dimensions.forEach(function(dimension, index) {

			var dataset  = data[dimension];
			var labels   = [];
			var maxvalue = 1;

			dataset.forEach(function(value) {
				maxvalue = Math.max(maxvalue, value);
			});

			var dx = (width  / dataset.length).toFixed(2);
			var dy = (height / maxvalue * 7/8).toFixed(2);

			dataset.forEach(function(value, index) {

				var x = dx * (index + 0.5);
				var y = dy * value + 8;

				labels.push('<text x="' + x + '" y="' + (height - y) + '">' + value + '</text>');

			});

			content += '<g title="' + dimension + '">';
			content += labels.join('');
			content += '</g>';

		});
		content += '</g>';

		content += '</svg>';


		return content;

	};

	var _render_graph_element = function(element, data) {

		var labels = Object.keys(data);
		var width  = parseInt(element.getAttribute('data-width'),  10) || 0;
		var height = parseInt(element.getAttribute('data-height'), 10) || 0;

		if (labels.length > 0 && width > 0 && height > 0) {

			var content = _render_graph(width, height, data);
			if (content !== '') {
				element.innerHTML = content;
			}

		}

	};



	/*
	 * TEMPLATE ENGINE
	 */

	var _CONTENT_TAGS = {
		'nav':     'ul',
		'menu':    'li',
		'ul':      'li',
		'ol':      'li',
		'section': 'article'
	};

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

	var _format_value = function(value) {

		if (typeof value === 'number') {

			if (value > 0xffffffff) {

				var date = new Date(value);

				value  = date.getDate()  + '.' + date.getMonth()   + '.' + date.getFullYear() + ' ';
				value += date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

				return value;

			}

		}


		return '' + value;

	};

	var _render_template = function(template, data) {

		template = typeof template === 'string' ? template : '';
		data     = data instanceof Object       ? data     : {};


		var lines = template.split('\n');

		var v, vl;

		for (var l = 0, ll = lines.length; l < ll; l++) {

			var line = lines[l];

			for (var key in data) {

				var value = data[key];
				if (line.indexOf('{{for ' + key + '}}') !== -1) {

					var forstart = l + 1;
					var forstop  = _find_marker(lines, l, '{{/for ' + key + '}}');
					var forchunk = '';

					if (forstop > forstart) {

						if (value instanceof Array) {

							for (v = 0, vl = value.length; v < vl; v++) {

								for (var fas = forstart; fas < forstop; fas++) {

									if (lines[fas].indexOf('{{' + key + '[$]}}') !== -1) {

										forchunk += lines[fas].replace('{{' + key + '[$]}}', _format_value(value[v])).trim();

									} else if (lines[fas].indexOf('{{' + key + '[$]') !== -1) {

										if (value[v] instanceof Object) {

											var subkeys = Object.keys(value[v]);
											for (var sk = 0, skl = subkeys.length; sk < skl; sk++) {

												if (lines[fas].indexOf('{{' + key + '[$].' + subkeys[sk] + '}}') !== -1) {
													forchunk += lines[fas].replace('{{' + key + '[$].' + subkeys[sk] + '}}', _format_value(value[v][subkeys[sk]])).trim();
												}

											}

										}

									} else {

										forchunk += lines[fas].trim();

									}

								}

							}

						} else if (value instanceof Object) {

							for (v in value) {

								for (var fos = forstart; fos < forstop; fos++) {

									if (lines[fos].indexOf('{{$}}') !== -1) {
										forchunk += lines[fos].replace('{{$}}', _format_value(v)).trim();
									} else if (lines[fos].indexOf('{{' + key + '[$]}}') !== -1) {
										forchunk += lines[fos].replace('{{' + key + '[$]}}', _format_value(value[v])).trim();
									} else {
										forchunk += lines[fos].trim();
									}

								}

							}

						}


						lines[l] = forchunk;

						for (var fs = forstart; fs < forstop + 1; fs++) {
							lines.splice(forstart, 1);
							ll--;
							l--;
						}

					}

				} else if (value instanceof Array) {

					for (v = 0, vl = value.length; v < vl; v++) {

						if (line.indexOf('{{' + key + '[' + v + ']}}') !== -1) {
							lines[l] = line.replace('{{' + key + '[' + v + ']}}', _format_value(value[v]));
						}

					}

				} else {

					if (line.indexOf('{{not ' + key + '}}') !== -1) {

						var notstart = l + 1;
						var notstop  = _find_marker(lines, l, '{{/not ' + key + '}}');
						var notchunk = '';

						if (!value) {

							if (notstop > notstart) {

								for (var ns = notstart; ns < notstop; ns++) {
									notchunk += lines[ns].trim();
								}

							}

						}

						lines[l] = notchunk;

						for (var ns = notstart; ns < notstop + 1; ns++) {
							lines.splice(notstart, 1);
							ll--;
							l--;
						}

					} else if (line.indexOf('{{' + key + '}}') !== -1) {

						lines[l] = line.replace('{{' + key + '}}', _format_value(value));

					}

				}

			}

		}


		return lines.join('\n');

	};

	var _render_template_element = function(element, data, template, incremental) {

		var content = '';

		var d, dl, tag, chunk;

		if (template !== null) {

			for (d = 0, dl = data.length; d < dl; d++) {

				tag   = _CONTENT_TAGS[element.tagName.toLowerCase()] || 'div';
				chunk = data[d] instanceof Object ? data[d] : (data[d] + '');

				if (chunk !== '') {
					content += '<' + tag + '>' + _render_template(template, chunk) + '</' + tag + '>';
				}

			}

		} else {

			for (var d = 0, dl = data.length; d < dl; d++) {

				tag   = _CONTENT_TAGS[element.tagName.toLowerCase()] || 'div';
				chunk = '' + data[d];

				if (chunk !== '') {
					content += '<' + tag + '>' + chunk + '</' + tag + '>';
				}

			}

		}


		if (content !== '') {

			if (incremental === true) {
				element.innerHTML += content;
			} else {
				element.innerHTML  = content;
			}


			return true;

		}


		return false;

	};


	return {

		/*
		 * UI EVENTS
		 */

		bind: function(query, callback, scope, dynamic) {

			query    = typeof query === 'string'    ? query    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : global;
			dynamic  = dynamic === true;


			var elements = ui.query(query);
			if (elements.length > 0 && callback !== null) {

				_events.push({
					query:    query,
					elements: elements,
					callback: callback,
					scope:    scope,
					dynamic:  dynamic
				});

				_refresh_events();

				return true;

			}


			return false;

		},

		trigger: function(query, identifier, event) {

			query      = typeof query === 'string'      ? query      : null;
			identifier = typeof identifier === 'string' ? identifier : null;
			event      = typeof event === 'string'      ? event      : 'data';


			if (query !== null && identifier !== null) {

				var elements = ui.query(query);
				if (elements.length > 0) {

					var data = {};

					for (var e = 0, el = elements.length; e < el; e++) {

						var element = elements[e];
						var name    = element.name || null;

						var value, type;

						var tag = element.tagName.toLowerCase();
						if (tag === 'input') {

							value = element.value || null;
							type  = element.type  || 'text';

							if (name !== null && value !== null) {

								if (type === 'text') {

									var pattern = element.pattern || null;
									if (pattern !== null) {

										if (value.match(new RegExp(pattern))) {
											data[name] = '' + value;
										}

									} else {
										data[name] = '' + value;
									}

								} else if (type === 'number') {

									var val = parseInt(value, 10);
									if (!isNaN(val)) {
										data[name] = val;
									} else {
										delete data[name];
									}

								} else if (type === 'range') {

									var min = parseInt(element.min, 10); min = isNaN(min) ? -Infinity : min;
									var max = parseInt(element.max, 10); max = isNaN(max) ?  Infinity : max;
									var val = parseInt(value, 10);
									if (val >= min && val <= max) {
										data[name] = val;
									} else {
										delete data[name];
									}

								}

							}

						} else if (tag === 'select') {

							var options = [];
							for (var o = 0, ol = element.options.length; o < ol; o++) {

								var optval = element.options[o].value || null;
								if (optval !== null) {
									options.push(optval);
								}

							}

							value = element.options[element.selectedIndex || 0].value;

							if (options.indexOf(value) !== -1) {

								var val = parseInt(value, 10);
								if (!isNaN(val)) {
									data[name] = val;
								} else {
									data[name] = '' + value;
								}

							}

						}

					}


					var instance = _resolve_constructor.call(global, identifier);
					if (instance !== null) {

						if (lychee.debug === true) {

							try {
								instance.trigger(event, [ data ]);
							} catch(err) {
								lychee.Debugger.report(err, lychee.environment, null);
							}

						} else {
							instance.trigger(event, [ data ]);
						}

						return true;

					}

				}

			}


			return false;

		},

		refresh: function() {

			_refresh_dropzones();
			_refresh_events();

			return true;

		},



		/*
		 * UI INTERACTION
		 */

		query: function(query) {

			query = typeof query === 'string' ? query : null;


			if (query !== null) {
				return _document.querySelectorAll(query);
			}


			return [];

		},

		state: function(query, state) {

			query = typeof query === 'string' ? query : null;
			state = typeof state === 'string' ? state : 'default';


			var elements = ui.query(query);
			if (elements.length > 0) {

				for (var e = 0, el = elements.length; e < el; e++) {

					var element = elements[e];
					if (element.className !== state) {
						element.className = state;
					}

				}


				return true;

			}


			return false;

		},

		toggle: function(query, states) {

			query  = typeof query === 'string' ? query  : null;
			states = states instanceof Array   ? states : [ 'default', 'active' ];


			var elements = ui.query(query);
			if (elements.length > 0) {

				for (var e = 0, el = elements.length; e < el; e++) {

					var element = elements[e];
					if (element.className === states[0]) {
						element.className = states[1];
					} else if (element.className === states[1]) {
						element.className = states[0];
					}

				}


				return true;

			}


			return false;

		},



		/*
		 * UI RENDERING
		 */

		graph: function(query, content) {

			query   = typeof query === 'string' ? query   : null;
			content = content instanceof Object ? content : {};


			var elements = ui.query(query);
			if (elements.length > 0) {

				var refresh = false;

				for (var e = 0, el = elements.length; e < el; e++) {

					var identifier = elements[e].getAttribute('data-ui-graph') || null;
					if (identifier !== null) {

						if (content[identifier] instanceof Object) {

							var result = _render_graph_element(elements[e], content[identifier]);
							if (result === true) {
								refresh = true;
							}

						}

					}

				}


				if (refresh === true) {

					ui.refresh();

					return true;

				}

			}


			return false;

		},

		render: function(query, content, template, incremental) {

			query       = typeof query === 'string'    ? query    : null;
			content     = content instanceof Array     ? content  : [ content  ];
			template    = typeof template === 'string' ? template : null;
			incremental = incremental === true;


			var elements = ui.query(query);
			if (elements.length > 0) {

				var refresh = false;

				for (var e = 0, el = elements.length; e < el; e++) {

					var result = _render_template_element(elements[e], content, template, incremental);
					if (result === true) {
						refresh = true;
					}

				}


				if (refresh === true) {

					ui.refresh();

					return true;

				}

			}


			return false;

		},

		notify: function(message, type) {

			message = typeof message === 'string' ? message : null;
			type    = typeof type === 'string'    ? type    : 'default';


			if (message !== null && type.match(/default|notification|warning|error/)) {

				if (_notifications !== null) {

					var notification = _document.createElement('li');

					notification.innerHTML = message;
					notification.className = type;

					_notifications.appendChild(notification);


					setTimeout(function() {

						notification.className = 'destroy';

						setTimeout(function() {

							var parent = notification.parentNode || null;
							if (parent) {
								parent.removeChild(notification);
							}

						}, 1000);

					}, 1500);

				}


				return true;

			}


			return false;

		},



		/*
		 * UI EVENTS
		 */

		upload: function(query, callback, scope, dynamic) {

			query    = typeof query === 'string'    ? query    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : global;
			dynamic  = dynamic === true;


			var elements = ui.query(query);
			if (elements.length > 0 && callback !== null) {

				var length = _dropzones.push({
					query:    query,
					elements: elements,
					callback: callback,
					scope:    scope,
					dynamic:  dynamic
				});

				_bind_dropzone(_dropzones[length - 1]);

				return true;

			}


			return false;

		},

		download: function(filename, buffer) {

			filename = typeof filename === 'string' ? filename : null;
			buffer   = buffer instanceof Buffer     ? buffer   : null;


			if (filename !== null && buffer !== null) {

				var ext  = filename.split('.').pop();
				var type = 'plain/text';
				if (ext.match(/fnt|json/)) {
					type = 'application/json';
				} else if (ext.match(/png/)) {
					type = 'image/png';
				}

				var url     = 'data:' + type + ';base64,' + buffer.toString('base64');
				var event   = _document.createEvent('MouseEvents');
				var element = _document.createElement('a');


				element.download = filename;
				element.href     = url;

				event.initMouseEvent(
					'click',
					true,
					false,
					window,
					0,
					0,
					0,
					0,
					0,
					false,
					false,
					false,
					false,
					0,
					null
				);

				element.dispatchEvent(event);


				return true;

			}


			return false;

		}

	};

})(lychee, typeof global !== 'undefined' ? global : this);

