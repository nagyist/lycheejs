
ui = (function(global) {

	/*
	 * STRUCTS
	 */

	var _MIME = {
		'fnt':   { type: 'application/json',       constructor: 'Font'    },
		'js':    { type: 'application/javascript', constructor: 'Buffer'  },
		'json':  { type: 'application/json',       constructor: 'Config'  },
		'png':   { type: 'image/png',              constructor: 'Texture' },
		'pkg':   { type: 'application/json',       constructor: 'lychee.Package' },
		'store': { type: 'application/json',       constructor: 'lychee.Storage' }
	};



	/*
	 * HELPERS
	 */

	var _convert_value = function(value) {

		if (typeof value === 'string') {

			var num = parseInt(value, 10);
			if (!isNaN(num)) {
				return num;
			} else {
				return value;
			}

		}


		return null;

	};

	var _encode_file = function(name, buffer, mime) {

		var construct = mime['constructor'];
		var instance  = null;


		switch(construct) {

			case 'Config':

				instance = lychee.deserialize({
					'constructor': construct,
					'arguments':   [ buffer ],
					'blob':        {
						buffer: buffer
					}
				});

			break;

			case 'Font':

				var index = buffer.indexOf('base64,');

				if (index !== -1) {

					buffer = 'data:application/json;base64,' + buffer.substr(index + 7);

					instance = lychee.deserialize({
						'constructor': construct,
						'arguments':   [ buffer ],
						'blob':        {
							buffer: buffer
						}
					});

				}

			break;

			case 'Texture':

				instance = lychee.deserialize({
					'constructor': construct,
					'arguments':   [ buffer ],
					'blob':        {
						buffer: buffer
					}
				});

			break;

		}


		if (instance !== null) {

			return {
				name: name,
				data: instance
			};

		}


		return null;

	};

	var _encode_form = function(type, elements) {

		var data = null;


		if (type === 'application/json') {

			data = {};


			elements.forEach(function(element) {

				if (element.tagName === 'INPUT') {

					var type = element.type;
					if (type === 'text' || type === 'hidden' || type === 'color') {

						data[element.name] = '' + element.value;

					} else if (type === 'number' || type === 'range') {

						var tmp1 = parseInt(element.value, 10);
						if (!isNaN(tmp1) && (tmp1).toString() === element.value) {
							data[element.name] = tmp1;
						}

					} else if (type === 'radio' && element.checked === true) {

						var tmp2 = parseInt(element.value, 10);
						if (!isNaN(tmp2) && (tmp).toString() === element.value) {
							data[element.name] = tmp2;
						} else {
							data[element.name] = element.value;
						}

					} else if (type === 'checkbox') {

						if (element.checked === true) {
							data[element.name] = 'on';
						} else {
							data[element.name] = 'off';
						}

					} else if (type === 'file' && element.files.length > 0) {

						var tmp3 = element.__files || [];
						if (tmp3.length > 0) {
							data[element.name] = [].slice.call(tmp3);
						}

					}

				}

			});

		}


		return data;

	};

	var _resolve_target = function(identifier) {

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
	 * POLYFILLS
	 */

	var _refresh = function() {

		var forms = [].slice.call(document.querySelectorAll('form[method="javascript"]'));
		if (forms.length > 0) {

			forms.forEach(function(form) {

				form.onsubmit = typeof form.onsubmit === 'function' ? form.onsubmit : function() {

					try {

						var data   = _encode_form(form.getAttribute('enctype'), [].slice.call(form.querySelectorAll('input')));
						var target = _resolve_target.call(global, form.getAttribute('action'));

						if (target !== null) {

							if (target instanceof Function) {

								target(data);

							} else if (target instanceof Object && typeof target.trigger === 'function') {

								var id = form.getAttribute('id') || null;
								if (id !== null) {
									target.trigger('submit', [   id, data ]);
								} else {
									target.trigger('submit', [ null, data ]);
								}

							}

						}

					} catch(e) {
						console.log(e);
					}


					return false;

				};

			});


			forms.forEach(function(form) {

				if (typeof form.onsubmit === 'function') {

					var elements = [].slice.call(form.querySelectorAll('input'));
					if (elements.length > 0) {

						elements.forEach(function(element) {

							if (element.type === 'radio') {

								element.onclick = typeof element.onclick === 'function' ? element.onclick : function() {
									form.onsubmit();
								};

							} else if (element.type === 'file') {

								element.onchange = typeof element.onchange === 'function' ? element.onchange : function() {

									this.__files = [];



									[].slice.call(this.files).forEach(function(file) {

										var name = file.name.split('/').pop();
										var ext  = [].slice.call(name.split('.'), 1).join('.');
										var mime = _MIME[ext] || null;

										if (mime !== null) {

											if (mime.type === file.type) {

												var reader = new FileReader();

												reader.onload = function(event) {

													this.__files.push(_encode_file(
														file.name,
														event.target.result,
														mime
													));

												}.bind(this);

												reader.readAsDataURL(file);

											}

										}

									}.bind(this));


									setTimeout(function() {
										form.onsubmit();
									}, 200);

								};

							} else {

								element.onchange = typeof element.onchange === 'function' ? element.onchange : function() {

									if (this.checkValidity() === true) {
										form.onsubmit();
									}

								};

							}

						});

					}

				}

			});

		}

	};



	var _download = function(filename, buffer) {

		filename = typeof filename === 'string' ? filename : null;
		buffer   = buffer instanceof Buffer     ? buffer   : null;


		if (filename !== null && buffer !== null) {

			var ext  = filename.split('.').pop();
			var type = 'plain/text';
			if (ext.match(/fnt|json/)) {
				type = 'application/json';
			} else if (ext.match(/png/)) {
				type = 'image/png';
			} else if (ext.match(/js/)) {
				type = 'text/javascript';
			}

			var url     = 'data:' + type + ';base64,' + buffer.toString('base64');
			var event   = document.createEvent('MouseEvents');
			var element = document.createElement('a');


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

	};



	document.addEventListener('DOMContentLoaded', function() {
		_refresh();
	}, true);



	/*
	 * IMPLEMENTATION
	 */

	return {

		download: _download,

		render: function(code, query) {

			query = typeof query === 'string' ? query : 'section.active';


			var node = document.querySelector(query);
			if (node !== null) {

				if (node.value !== undefined) {
					node.value = code;
				} else if (node.src !== undefined) {
					node.src = code;
				} else {
					node.innerHTML = code;
				}

				_refresh();

			}

		}

	};

})(this);

