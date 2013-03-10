
lychee.define('game.Builder').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _env = lychee.getEnvironment();


	var Class = function(game) {

		this.game = game;

		this.preloader = new lychee.Preloader({
			timeout: Infinity
		});


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		build: function(projectroot) {

			var tmp;


			if (projectroot !== null) {

				lychee.debug = true;


				var sandboxenv = {};
				var sandboxglobal = {
					document: global.document,
					Audio: global.Audio,
					webkitAudioContext: global.webkitAudioContext,
					addEventListener: function(type, listener, useCapture) {
						return global.addEventListener(type, listener, useCapture);
					},
					setTimeout: function(callback, timeout) {
						setTimeout(callback, timeout);
					},
					setInterval: function(callback, interval) {
						setInterval(callback, interval);
					},
					lychee: {}
				};


				if ('onkeydown' in global) {
					sandboxglobal.onkeydown = global.onkeydown;
				}

				if ('onmousedown' in global) {
					sandboxglobal.onmousedown = global.onmousedown;
				}

				if ('ontouchstart' in global) {
					sandboxglobal.ontouchstart = global.ontouchstart;
				}


				lychee.setEnvironment(sandboxenv);


				// Avoid duplicated loading
				for (var id in _env.tree) {

					if (id.substr(0, 6) === 'lychee') {
						sandboxenv.tree[id] = _env.tree[id];
					}

				}


				// Link the core, Builder, Preloader and bootstrap.js
				// (because they are not initialized via lychee.define())
				for (var id in lychee) {

					if (
						id.match(/debug|define|extend|generate|rebase|tag|build|getEnvironment|setEnvironment/)
						|| id === 'DefinitionBlock'
						|| id === 'VERSION'
						|| id === 'Builder'
						|| id === 'Preloader'
					) {

						sandboxglobal.lychee[id] = lychee[id];

					}

				}


				lychee.rebase({
					lychee: _env.bases.lychee,
					game:   projectroot + '/source'
				});

				lychee.tag({
					platform: [ 'webgl', 'html' ]
				});


				this.preloader.load([
					projectroot + '/source/Main.js'
				]);


				this.preloader.bind('ready', function(assets) {

					var that = this;

					lychee.build(function(lychee, global) {

						that.trigger('build', [ sandboxenv, sandboxglobal ]);

						lychee.setEnvironment(null);

					}, sandboxglobal);


				}, this);

			}

		}

	};


	return Class;

});

