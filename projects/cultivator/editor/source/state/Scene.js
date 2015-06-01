
lychee.define('tool.state.Scene').includes([
	'lychee.game.State',
	'lychee.event.Emitter'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	/*
	 * HELPERS
	 */

	var _cache  = {};

	var _render = function(query, parent) {

		var blob = this.serialize();
		var code = '';
		var name = this.label ? this.label : (parent.__map[query.split('/').pop()] || blob.constructor);


		code += '<li class="active" title="' + blob.constructor + '">';

		code += '<label class="ico-eye active" onclick="MAIN.state.trigger(\'visibility\', [\'' + query + '\']);this.classList.toggle(\'active\');this.parentNode.classList.toggle(\'active\');"></label>';

		if (this.entities instanceof Array && this.entities.length > 0) {
			code += '<label class="ico-arrow down active" onclick="this.parentNode.classList.toggle(\'active\');this.classList.toggle(\'down\');this.classList.toggle(\'right\'); void 1337;"></label>';
		}


		code += '<span>' + name + '</span>';


		if (this.entities instanceof Array && this.entities.length > 0) {

			code += '<ul>';

			var parent = this;

			this.entities.forEach(function(entity, index) {
				code += _render.call(entity, query + '/' + index, parent);
			});

			code += '</ul>';

		}


		code += '</li>';

		return code;

	};

	var _ui_update = function(id) {

		if (this.environment === null) return false;


		var code   = typeof _cache[id] === 'string' ? _cache[id] : '';
		var layers = this.environment.global.MAIN.state.__layers;


		if (code === '') {

			code += '<ul>';

			Object.values(layers).reverse().forEach(function(layer, index) {

				var dummy = { __map: {} };
				dummy.__map[index] = Object.keys(layers).reverse()[index];

				code += _render.call(layer, '/' + index, dummy);

			});

			code += '</ul>';

		}


		if (_cache[id] === undefined) {
			_cache[id] = code;
		}


		ui.render(code, '#scene-layers-wrapper');

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {


		this.environment = null;


		lychee.game.State.call(this, main);
		lychee.event.Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.main.bind('changestate', _ui_update, this);


		this.bind('entity', function(entity) {

			if (entity !== null) {

				var blob = entity.serialize();

				ui.render(blob.constructor, '#scene-settings > h3');
				ui.active('#scene-settings-wrapper');


				[].slice.call(document.querySelectorAll('#scene-settings-wrapper input')).forEach(function(element) {

					switch (element.name) {

						case 'entity-position-x': element.value = entity.position.x; break;
						case 'entity-position-y': element.value = entity.position.y; break;
						case 'entity-width':      element.value = entity.width;      break;
						case 'entity-height':     element.value = entity.height;     break;

					}

				});

			} else {

				ui.render('No Entity selected', '#scene-settings > h3');
				ui.inactive('#scene-settings-wrapper');

			}

		}, this);

		this.bind('submit', function(id, settings) {

			if (id === 'settings') {

console.log(settings);

			}

		}, this);

		this.bind('visibility', function(query) {

			var path    = query.split('/').slice(1);
			var layers  = this.environment.global.MAIN.state.__layers;
			var pointer = Object.values(layers).reverse()[path.shift()];

			while (path.length > 0) {

				if (pointer.entities instanceof Array) {
					pointer = pointer.entities[path.shift()];
				}

			}


			var entity = pointer || null;
			if (entity !== null) {

				if (lychee.interfaceof(lychee.ui.Layer, entity) || lychee.interfaceof(lychee.game.Layer, entity)) {
					entity.setVisible(!entity.visible);
				} else if (lychee.interfaceof(lychee.ui.Entity, entity)) {
					entity.setVisible(!entity.visible);
				} else if (lychee.interfaceof(lychee.game.Entity, entity)) {
					entity.setAlpha(entity.alpha === 1 ? 0 : 1);
				}

			}

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize:   function() {},
		deserialize: function() {},



		/*
		 * CUSTOM API
		 */

		update: function(clock, delta) {

		},

		enter: function(environment) {

			this.environment = environment;

			var id = Object.keys(MAIN.__states)[Object.values(MAIN.__states).indexOf(MAIN.state)] || null;
			_ui_update.call(this, id);

			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			this.environment = null;

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});

