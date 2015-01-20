
(function(global) {

	if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {

		document.addEventListener('DOMContentLoaded', function() {

			var _get_parent = function(node) {

				var selfname = node.tagName.toLowerCase();
				if (selfname === 'article' || selfname === 'menu') {
					return node;
				}


				var parentnode = node.parentNode;
				var parentname = parent.tagName.toLowerCase();
				if (parentname === 'article' || tagname === 'menu') {
					return parentnode;
				} else if (tagname === 'body') {
					return null;
				} else {
					return _get_parent(parentnode);
				}

			};


			var elements = [].slice.call(document.querySelectorAll('main menu, main article'));
			if (elements.length > 0) {

				document.body.style.overflow = 'hidden';


				elements.forEach(function(element) {

					element.style.webkitOverflowScrolling = 'touch';
					element.style.overflow                = 'scroll';


					element.addEventListener('touchstart', function() {

						var top     = this.scrollTop;
						var total   = this.scrollHeight;
						var current = this.scrollTop + this.offsetHeight;

						if (top === 0) {
							this.scrollTop = 1;
						} else if (current === total) {
							this.scrollTop = top - 1;
						}

					});

					element.addEventListener('touchmove', function(event) {

						if (this.offsetHeight < this.scrollHeight) {
							this._isScroller = true;
						}

					});

				});

				document.body.addEventListener('touchmove', function(event) {

					var parent = _get_parent(event.target);
					if (parent === null || !parent._isScroller) {
						event.preventDefault();
					}

				}, true);

			}

		});

	}



	/*
	 * FORM POLYFILL
	 */

	var _set_value = function(key, value) {

		// TODO: Add support for key = 'test.sub[index]' notation
		this[key] = value;

	};

	var _encode_form = function(type, elements) {

		var data = null;


		if (type === 'application/json') {

			data = {};


			elements.forEach(function(element) {

				var tag = element.tagName.toLowerCase();
				if (tag === 'input') {

					var type = element.type;
					if (type === 'text' || type === 'hidden') {

						_set_value.call(data, element.name, '' + element.value);

					} else if (type === 'number' || type === 'range') {

						var tmp = parseInt(element.value, 10);

						if (!isNaN(tmp)) {
							_set_value.call(data, element.name, tmp);
						}

					}

				} else if (tag === 'select') {

					var index = element.selectedIndex;
					if (index !== -1) {

						var tmp1 = element.options[index].value || element.options[index].innerText;
						var tmp2 = parseInt(tmp1, 10);

						if (!isNaN(tmp2)) {
							_set_value.call(data, element.name, tmp2);
						} else {
							_set_value.call(data, element.name, tmp1);
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


	document.addEventListener('DOMContentLoaded', function() {

		var forms = [].slice.call(document.querySelectorAll('form[method="javascript"]'));
		if (forms.length > 0) {

			forms.forEach(function(form) {

				form.onsubmit = function() {

					try {

						var data   = _encode_form(form.getAttribute('enctype'), [].slice.call(form.querySelectorAll('input, select')));
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

					var elements = [].slice.call(form.querySelectorAll('input, select'));
					if (elements.length > 0) {

						elements.forEach(function(element) {

							element.onchange = function(a) {

								if (this.checkValidity() === true) {
									form.onsubmit();
								}

							};

						});

					}

				}

			});

		}

	}, true);

})(this);

