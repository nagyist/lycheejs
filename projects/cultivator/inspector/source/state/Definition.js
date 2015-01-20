
lychee.define('inspector.state.Definition').includes([
	'inspector.State'
]).exports(function(lychee, inspector, global, attachments) {

	/*
	 * HELPERS
	 */

	if (typeof String.prototype.replacetemplate !== 'function') {

		String.prototype.replacetemplate = function(key, value) {

			key   = typeof key === 'string'   ? key   : null;
			value = typeof value === 'string' ? value : '';


			if (key !== null) {

				var indexes = [];
				var index   = this.indexOf(key);

				while (index !== -1) {
					indexes.push(index);
					index = this.indexOf(key, index + 1);
				}


				var keyo   = 0;
				var keyl   = key.length;
				var vall   = value.length;
				var buffer = '' + this;

				indexes.forEach(function(keyi) {

					buffer  = buffer.substr(0, keyi + keyo) + value + buffer.substr(keyi + keyo + keyl);
					keyo   += (vall - keyl);

				});


				return buffer;

			}


			return this;

		};

	}


	var _render_article = function(definition, menu) {

		var content = '';

		if (definition.id !== definition.origin) {
			content += '<h2>' + definition.id + '<br><small>(injected from ' + definition.origin + ')</small></h2>';
		} else {
			content += '<h2>' + definition.id + '</h2>';
		}


		content += '<pre class="javascript">';
		content += 'lychee.define(\'' + definition.id + '\')';


		if (definition.tags !== null) {

			content += '.tags({\n';
			Object.keys(definition.tags).forEach(function(key) {
				content += '    ' + key + ': "' + definition.tags[key] + '"\n';
			});
			content += '})';

		}


		if (definition.attaches !== null && definition.attaches.length > 0) {

			content += '.attaches({\n';
			definition.attaches.forEach(function(url) {
				if (typeof url !== 'string') return;
				content += '    ' + url.split('.').pop() + ': <a onclick="MAIN.changeState(\'asset\');MAIN.state.view(\'' + url + '\')">' + url.split('/').pop() + '</a>\n';
			});
			content += '})';

		}


		if (definition.includes !== null && definition.includes.length > 0) {

			content += '.includes([\n';
			definition.includes.forEach(function(item, index) {
				content += '    "<a onclick="MAIN.state.view(\'' + item + '\')">' + item + '</a>"';
				if (index !== definition.includes.length - 1) content += ',';
				content += '\n';
			});
			content += '])';

		}


		if (definition.requires !== null && definition.requires.length > 0) {

			content += '.requires([\n';
			definition.requires.forEach(function(item, index) {
				content += '    "<a onclick="MAIN.state.view(\'' + item + '\')">' + item + '</a>"';
				if (index !== definition.requires.length - 1) content += ',';
				content += '\n';
			});
			content += '])';

		}


		if (definition.supports !== null) {

			content += '.supports(';
			content += definition.supports.replace(/\t/g, '    ');
			content += ')';

		}


		if (definition.exports !== null) {

			content += '.exports(';

			var code = definition.exports.replace(/\t/g, '    ');

			[].slice.call(menu).sort(function(a, b) {
				if (a.length < b.length) return  1;
				if (a.length > b.length) return -1;
				return 0;
			}).forEach(function(item) {

				code = code.replacetemplate(item + '.prototype', '<a onclick="MAIN.state.view(\'' + item + '\')">' + item + '</a>.prototype');
				code = code.replacetemplate('new ' + item,       'new <a onclick="MAIN.state.view(\'' + item + '\')">' + item + '</a>');
				code = code.replacetemplate(item + '.call(',     '<a onclick="MAIN.state.view(\'' + item + '\')">' + item + '</a>.call(');

			});

			content += code;
			content += ')';

		}

		content += ';</pre>';


		return content;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		inspector.State.call(this, 'Definition', main);

	};


	Class.prototype = {

		deserialize: function(data) {

			var definitions = data.definitions;
			if (definitions.length > 0) {

				var menu = definitions.map(function(definition) {
					return definition.id;
				});

				menu.sort(function(a, b) {
					if (a < b) return -1;
					if (a > b) return  1;
					return 0;
				});


				var articles = {};

				definitions.forEach(function(definition) {
					articles[definition.id] = _render_article(definition, menu);
				});


				this.setMenu(menu);
				this.setArticles(articles);
				this.view(menu[0]);

			}

		}

	};


	return Class;

});

