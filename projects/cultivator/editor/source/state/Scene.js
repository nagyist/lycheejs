
lychee.define('tool.state.Scene').includes([
	'lychee.app.State',
	'lychee.event.Emitter'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	/*
	 * HELPERS
	 */

	var _cache  = {};

	var _ui_render = function(query, parent) {

/*
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
				code += _ui_render.call(entity, query + '/' + index, parent);
			});

			code += '</ul>';

		}


		code += '</li>';

		return code;
*/

	};

	var _ui_update = function(id) {

/*
		if (this.environment === null) return false;


		var code   = typeof _cache[id] === 'string' ? _cache[id] : '';
		var layers = this.environment.global.MAIN.state.__layers;


		if (code === '') {

			code += '<ul>';

			Object.values(layers).reverse().forEach(function(layer, index) {

				var dummy = { __map: {} };
				dummy.__map[index] = Object.keys(layers).reverse()[index];

				code += _ui_render.call(layer, '/' + index, dummy);

			});

			code += '</ul>';

		}


		if (_cache[id] === undefined) {
			_cache[id] = code;
		}


		ui.render(code, '#scene-layers-wrapper');
*/

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {


		this.sandbox = null;


		lychee.app.State.call(this, main);
		lychee.event.Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.main.bind('changestate', _ui_update, this);

		this.bind('changetool', function(tool) {

console.log(tool);

		}, this);


		// MUHAHA I HAZ CRAPPY DOM
		global.addEventListener('click', function(event) {

			var target = event.target;
			if (target !== null && target.className === 'lychee-Renderer') {

				var parent = target.parentNode;

console.log(event);

console.log(parent.scrollTop);

console.log('YES!');

			} else {

console.log('NO :\'(');

			}

		});


/*

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

				if (lychee.interfaceof(lychee.ui.Layer, entity) || lychee.interfaceof(lychee.app.Layer, entity)) {
					entity.setVisible(!entity.visible);
				} else if (lychee.interfaceof(lychee.ui.Entity, entity)) {
					entity.setVisible(!entity.visible);
				} else if (lychee.interfaceof(lychee.app.Entity, entity)) {
					entity.setAlpha(entity.alpha === 1 ? 0 : 1);
				}

			}

		}, this);
*/

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

		enter: function() {

			// TODO: Figure out if timestamps are necessary or if caching issues can be prevented in Project State
			var that        = this;
			var path        = this.main.project.package.url.split('?')[0];
			var environment = new lychee.Environment({
				id:      'sandbox',
				debug:   true,
				sandbox: true,
				build:   'app.Main',
				packages: [
					new lychee.Package('lychee', '/lib/lychee/lychee.pkg'),
					new lychee.Package('app',    path)
				],
				tags: {
					platform: [ 'html' ]
				}
			});

			lychee.setEnvironment(environment);

			lychee.init(function(sandbox) {

				var lychee = sandbox.lychee;
				var app    = sandbox.app;

				if (typeof app.Main !== 'undefined') {

					sandbox.MAIN = new app.Main();

					sandbox.MAIN.bind('init', function() {

						var canvas  = document.querySelector('body > .lychee-Renderer');
						var wrapper = document.querySelector('#scene-preview-wrapper');

						if (canvas !== null && wrapper !== null) {
							canvas.parentNode.removeChild(canvas);
							wrapper.appendChild(canvas);
							wrapper.style.height = (global.innerHeight - 208) + 'px';
						}

					}, this);

					sandbox.MAIN.init();

				}

				that.sandbox = sandbox;

			});


console.log(environment);


console.log('ENTERED');


/*

			this.environment = environment;

			var id = Object.keys(MAIN.__states)[Object.values(MAIN.__states).indexOf(MAIN.state)] || null;
			_ui_update.call(this, id);
*/

			lychee.app.State.prototype.enter.call(this);

		},

		leave: function() {

console.log('LEFT');

			lychee.app.State.prototype.leave.call(this);

		}

	};


	return Class;

});

