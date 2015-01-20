
lychee.define('inspector.State').includes([
	'lychee.event.Emitter',
	'lychee.game.State'
]).exports(function(lychee, inspector, global, attachments) {

	var Class = function(id, main) {

		this.articles = {};
		this.menu     = [];

		this.__element = null;
		this.__menu    = null;
		this.__article = null;


		if (typeof id === 'string') {

			this.__element = document.querySelector('#inspector-state-' + id);
			this.__menu    = document.querySelector('#inspector-state-' + id + ' > menu');
			this.__article = document.querySelector('#inspector-state-' + id + ' > article');

		}


		lychee.game.State.call(this, main);
		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		enter: function() {

			var element = this.__element;
			if (element !== null) {
				element.className = 'inspector-State active';
			}

		},

		leave: function() {

			var element = this.__element;
			if (element !== null) {
				element.className = 'inspector-State';
			}

		},



		/*
		 * CUSTOM API
		 */

		setArticles: function(map) {

			map = map instanceof Object ? map : null;


			if (map !== null) {

				for (var id in map) {
					this.articles[id] = map[id];
				}


				return true;

			}


			return false;

		},

		setMenu: function(menu, labels) {

			menu   = menu instanceof Array   ? menu   : null;
			labels = labels instanceof Array ? labels : menu;


			var element = this.__menu;
			if (element !== null) {

				if (menu !== null && menu.length > 0) {

					var content = '';

					menu.forEach(function(item, index) {
						content += '<li data-id="' + item + '" onclick="MAIN.state.view(\'' + item + '\')">' + labels[index] + '</li>';
					});


					element.innerHTML = content;
					this.menu         = menu;


					return true;

				}

			}


			return false;

		},

		view: function(id) {

			id = typeof id === 'string' ? id : null;


			var element = this.__article;
			if (element !== null) {

				if (id !== null) {

					var article = this.articles[id] || null;
					if (article !== null) {
						element.innerHTML = article;
					}

				}

			}


			var menu = this.__menu;
			if (menu !== null) {

				var items = [].slice.call(menu.querySelectorAll('li'));
				if (items.length > 0) {

					items.forEach(function(item) {

						if (item.getAttribute('data-id') === id) {
							item.className = 'active';
						} else {
							item.className = '';
						}

					});

				}

			}

		}

	};


	return Class;

});

