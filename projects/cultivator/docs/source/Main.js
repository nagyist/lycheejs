
lychee.define('tool.Main').requires([
	'lychee.data.JSON'
]).includes([
	'lychee.game.Main'
]).tags({
	platform: 'html'
}).supports(function(lychee, global) {

	if (global.location instanceof Object && typeof global.location.hash === 'string') {

		if (typeof global.onhashchange !== 'undefined') {
			return true;
		}

	}


	return false;

}).exports(function(lychee, tool, global, attachments) {

	var _API_CACHE       = {};
	var _SRC_CACHE       = {};
	var _DATA            = { source: false };
	var _GITHUB_URL      = 'https://github.com/LazerUnicorns/lycheeJS/edit/development-0.9';
	var _JSON            = lychee.data.JSON;
	var _marked          = marked;
	var _marked_renderer = new marked.Renderer();



	/*
	 * HACKS BECAUSE FUCKING JAVASCRIPT IDIOTS
	 */

	(function(global) {

		_marked.setOptions({

			highlight: function(code) {
				return hljs.highlightAuto(code).value;
			}

		});

		var _old_link = _marked_renderer.link;

		_marked_renderer.link = function(href, title, text) {

			if (href.substr(0, 1) !== '#') {
				href = '#!' + href;
			} else {
				href = '#!' + document.location.hash.split('!')[1].split('#')[0] + href;
			}

			return _old_link.call(this, href, title, text);

		};


		global.onhashchange = function() {

			var elements  = [].slice.call(document.querySelectorAll('#navi li > a'));
			var reference = global.location.hash.split('!')[1].split('#');

			elements.forEach(function(element) {
				element.classList.remove('active');
			});

			_render_view(reference[0], reference[1]);

		};

	})(global);



	/*
	 * HELPERS
	 */

	var _load_documents = function() {

		_DATA.api.forEach(function(path) {

			var identifier = 'lychee.' + path.split('/').join('.');
			if (path.substr(0, 4) === 'core') {
				identifier = path === 'core/lychee' ? 'lychee' : 'lychee.' + path.split('/').pop();
			}

			var stuff = new Stuff('/lychee/api/' + path + '.md');

			stuff.onload = function(result) {
				_API_CACHE[identifier] = this.buffer;
			};

			stuff.load();

		});


		_DATA.src.filter(function(path) {

			if (path.substr(0, 8) === 'platform') {
				return path.substr(0, 13) === 'platform/html';
			}

			return true;

		}).forEach(function(path) {

			var identifier = 'lychee.' + path.split('/').join('.');
			if (path.substr(0, 8) === 'platform') {
				identifier = 'lychee.' + path.split('/').slice(2).join('.');
			} else if (path.substr(0, 4) === 'core') {
				identifier = path === 'core/lychee' ? 'lychee' : 'lychee.' + path.split('/').pop();
			}


			var stuff = new Stuff('/lychee/source/' + path + '.js?' + Date.now(), true);

			stuff.onload = function(result) {
				_SRC_CACHE[identifier] = this.buffer;
			};

			stuff.load();

		});

	};

	var _walk_directory = function(files, node, path) {

		if (node instanceof Array) {

			if (node.indexOf('js') !== -1 || node.indexOf('md') !== -1) {
				files.push(path);
			}

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child);
			});

		}

	};

	var _package_definitions = function(json) {

		var files = [];

		if (json !== null) {
			_walk_directory(files, json, '');
		}

		return files.map(function(value) {
			return value.substr(1);
		}).sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		});

	};

	var _render_navi = function(data) {

		var code        = '';
		var documented  = data.api.map(function(path) {

			if (path.substr(0, 4) === 'core') {
				return path === 'core/lychee' ? 'lychee' : 'lychee.' + path.split('/').pop();
			} else {
				return 'lychee.' + path.split('/').join('.');
			}

		});
		var definitions = data.src.map(function(path) {

			if (path.substr(0, 8) === 'platform') {
				return 'lychee.' + path.split('/').slice(2).join('.');
			} else if (path.substr(0, 4) === 'core') {
				return path === 'core/lychee' ? 'lychee' : 'lychee.' + path.split('/').pop();
			} else {
				return 'lychee.' + path.split('/').join('.');
			}

		}).unique().sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		});


		code += '<ul>';
		definitions.forEach(function(id) {
			code += '<li><a href="#!' + id + '" class="' + (documented.indexOf(id) !== -1 ? '' : 'no-docs') + '">' + id + '</a></li>';
		});
		code += '</ul>';


		ui.render(code, '#navi');

		ui.render('' + documented.length,  '#score-amount');
		ui.render('' + definitions.length, '#score-total');


		setTimeout(function() {

			var elements = [].slice.call(document.querySelectorAll('#navi li > a'));
			var index    = elements.map(function(element) {
				return element.innerHTML;
			}).indexOf(document.location.hash.split('!')[1].split('#')[0]);


			if (index !== -1) {
				elements[index].classList.add('active');
			}

		}, 200);

	};

	var _render_view = function(identifier, reference) {

		var index = _DATA.api.map(function(path) {

			if (path.substr(0, 4) === 'core') {
				return path === 'core/lychee' ? 'lychee' : 'lychee.' + path.split('/').pop();
			} else {
				return 'lychee.' + path.split('/').join('.');
			}

		}).indexOf(identifier);


		var code     = '';
		var path     = _DATA.api[index] || null;

		var document = _API_CACHE[identifier] || '';
		if (_DATA.source === true) {
			document = _SRC_CACHE[identifier];
		}


		if (_DATA.source === true) {

			if (_API_CACHE[identifier] !== undefined) {
				code += ' <button class="ico-api" onclick="MAIN.trigger(\'view\')">API View</button>';
				code += ' <a class="button ico-edit"  href="' + _GITHUB_URL + '/lychee/source/' + path + '.js">Edit on GitHub</a>';
			} else {
				code += ' <a class="button ico-edit"  href="' + _GITHUB_URL + '/lychee/api/' + identifier.split('.').slice(1).join('/') + '.md">Create on GitHub</a>';
			}


			ui.render(code + _marked('```javascript\n' + document + '\n```', {
				renderer: _marked_renderer
			}), '#view');

		} else {

 			if (_SRC_CACHE[identifier] !== undefined) {
				code += ' <button class="ico-glasses" onclick="MAIN.trigger(\'view\')">Source View</button>';
			}

			code += ' <a class="button ico-edit"  href="' + _GITHUB_URL + '/lychee/api/' + path + '.md">Edit on GitHub</a>';


			var open = {
				article: false
			};

			var seen = {
				constructor: false,
				events:      false,
				methods:     false,
				properties:  false
			};


			document = document.split('\n').map(function(line) {

				if (line.substr(0, 14) === '```javascript-') {

					var type  = line.split('-');
					var chunk = '';

					return '```javascript';

				} else if (line.substr(0, 1) === '=') {

					var str   = line.substr(1).replace('{', '').replace('}', '');
					var type  = str.split('-')[0];
					var name  = '.' + (type === 'methods' ? str.split('-')[1] + '()' : str.split('-')[1]);
					var chunk = '<article id="' + str + '">'

					if (open.article === true) {
						chunk = '</article>' + chunk;
					}

					open.article = true;

					return chunk;

				}

				return line;

			}).join('\n');



			ui.render(code + _marked(document, {
				renderer: _marked_renderer
			}), '#view');


			setTimeout(function() {

				var element = global.document.querySelector('#' + reference);
				if (element !== null) {

					element.scrollIntoView({
						block:     'start',
						behaviour: 'smooth'
					});

				}

			}, 200);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({

			client:   null,
			input:    null,
			jukebox:  null,
			renderer: null,
			server:   null,

			viewport: {
				fullscreen: false
			}

		}, data);


		lychee.game.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			var config = new Config('/lychee/lychee.pkg');
			var that   = this;

			config.onload = function(result) {

				if (result === true) {

					_DATA = {
						api:       _package_definitions(this.buffer.api.files    || null),
						src:       _package_definitions(this.buffer.source.files || null),
						reference: (location.hash.split('!')[1] || 'lychee').split('#'),
						source:    false
					};


					oncomplete(true);

				} else {

					oncomplete(false);

				}

			};

			config.load();

		}, this);

		this.bind('init', function() {

			_render_navi(_DATA);
			_load_documents();

			setTimeout(function() {
				_render_view(_DATA.reference[0], _DATA.reference[1] || null);
			}, 1000);

		}, this, true);

		this.bind('view', function() {
			_DATA.source = !_DATA.source;
			_render_view(_DATA.reference[0], _DATA.reference[1] || null);
		}, this);

	};


	Class.prototype = {

	};


	return Class;

});
