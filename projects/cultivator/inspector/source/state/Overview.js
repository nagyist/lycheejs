
lychee.define('inspector.state.Overview').includes([
	'inspector.State'
]).exports(function(lychee, inspector, global, attachments) {

	/*
	 * HELPERS
	 */

	var _EXAMPLES = [
		'index.html?url=/projects/boilerplate/build/html/main.lychee.env',
		'index.html?url=/projects/mode7/build/html/main.lychee.env'
	];


	var _render_article = function(data) {

		var content    = '';
		var identifier = 'unknown';

		if (data instanceof Object && data.settings instanceof Object) {
			identifier = data.settings.id;
		}


		if (data === null) {

			content += '<h2>Corrupt Environment</h2>';
			content += '<h3>Overview</h3>';
			content += '<div class="center"><p class="error"><b>Error</b>: The current Environment is corrupt or not available.</p></div>';
			content += '<p class="center">Please select an Environment from the Menu.</p>';

		} else {

			content += '<h2>Environment "' + identifier + '"</h2>';
			content += '<h3>Overview</h3>';

			content += '<table>';
			content += '<tr><th>Assets</th><td>' + data.assets.length + '</td></tr>';
			content += '<tr><th>Definitions</th><td>' + data.definitions.length + '</td></tr>';
			content += '<tr><th>Packages</th><td>' + data.packages.length + '</td></tr>';
			content += '</table>';

			content += '<h3>Settings</h3>';
			content += '<table>';
			content += '<tr><th>Debug</th><td>' + data.settings.debug + '</td></tr>';
			content += '<tr><th>Sandbox</th><td>' + data.settings.sandbox + '</td></tr>';

			if (Object.keys(data.settings.tags).length > 0) {

				content += '<tr><th>Tags</th>';
				content += '<td>';

				Object.keys(data.settings.tags).forEach(function(key) {
					content += key + ' = [ "' + data.settings.tags[key].join('", "') + '" ]<br>';
				});

				content += '</td>';
				content += '</tr>';

			} else {

				content += '<tr><th>Tags</th><td>-</td></tr>';

			}

			content += '</table>';


			content += '<h3>Packages</h3>';

			if (data.packages.length > 0) {

				content += '<table>';
				data.packages.forEach(function(pkg) {
					content += '<tr><th>' + pkg.id + '</th><td>' + pkg.url + '</td></tr>';
				});
				content += '</table>';

			}

		}


		return content;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		inspector.State.call(this, 'Overview', main);

	};


	Class.prototype = {

		deserialize: function(data) {

			var articles = {};

			if (data instanceof Object && typeof data.url === 'string') {

				articles[data.url] = _render_article(data);

				this.setMenu(null);
				this.setArticles(articles);
				this.view(data.url);

			}

		},

		view: function(url) {

			var active  = document.location.search;
			var current = '?url=' + url;

			if (active !== current) {
				document.location.search = current;
			} else {

				var result = inspector.State.prototype.view.call(this, url);
				if (result === true) {
					return true;
				}

			}


			return false;

		}

	};


	return Class;

});

