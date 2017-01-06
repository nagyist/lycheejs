
lychee.define('game.state.Game').requires([
	'lychee.ai.Layer',
	'lychee.effect.Color',
	'lychee.effect.Shake',
	'lychee.ui.entity.Label',
	'game.ai.Agent',
	'game.entity.Ball',
	'game.entity.Paddle',
	'game.ui.sprite.Background'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	const _Agent  = lychee.import('game.ai.Agent');
	const _Color  = lychee.import('lychee.effect.Color');
	const _Shake  = lychee.import('lychee.effect.Shake');
	const _State  = lychee.import('lychee.app.State');
	const _BLOB   = attachments["json"].buffer;
	const _SOUNDS = {
		ping: attachments["ping.snd"],
		pong: attachments["pong.snd"]
	};



	/*
	 * HELPERS
	 */

	const _reset_game = function(player) {

		player = typeof player === 'string' ? player : null;


		let ball = this.queryLayer('game', 'ball');
		if (ball !== null) {

			let position = {
				x: 0,
				y: 0
			};

			let velocity = {
				x: 300 + Math.random() * 200,
				y: 100 + Math.random() * 300
			};

			if (Math.random() > 0.5) {
				velocity.y *= -1;
			}

			if (player === 'good') {
				velocity.x *= -1;
			}

			ball.setPosition(position);
			ball.setVelocity(velocity);

		}


		let stats = this.__statistics || null;
		if (stats !== null) {

			if (player === 'good') {
				stats.generation++;
				stats.good++;
			} else if (player === 'evil') {
				stats.generation++;
				stats.evil++;
			}


			let info = this.queryLayer('ui', 'info');
			if (info !== null) {
				info.setValue('(#' + stats.generation + ') ' + stats.good + ' - ' + stats.evil);
			}

		}


		this.queryLayer('game', 'good').setPosition({ y: 0 });
		this.queryLayer('game', 'evil').setPosition({ y: 0 });

	};

	const _bounce_effect = function(player) {

		player = typeof player === 'string' ? player : null;


		let color = '#ffffff';
		if (player === 'good') {
			color = '#14a5e2';
		} else if (player === 'evil') {
			color = '#de1010';
		}


		this.getLayer('game').addEffect(new _Shake({
			type:     _Shake.TYPE.bounceeaseout,
			duration: 300,
			shake:    {
				x: (Math.random() * 16) | 0,
				y: (Math.random() * 16) | 0
			}
		}));

		this.getLayer('ui').addEffect(new _Shake({
			type:     _Shake.TYPE.bounceeaseout,
			duration: 300,
			shake:    {
				x: (Math.random() * 16) | 0,
				y: (Math.random() * 16) | 0
			}
		}));


		let background = this.queryLayer('bg', 'background');
		if (background !== null) {

			background.setColor(color);
			background.addEffect(new _Color({
				type:     _Color.TYPE.easeout,
				duration: 1000,
				color:    '#050a0d'
			}));

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		_State.call(this, main);


		this.__statistics = {
			good:       0,
			evil:       0,
			generation: 1
		};


		this.deserialize(_BLOB);



		/*
		 * INITIALIZATION
		 */

		let viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				let renderer = this.renderer;
				if (renderer !== null) {

					let entity = null;
					let width  = renderer.width;
					let height = renderer.height;


					entity = this.queryLayer('bg', 'background');
					entity.trigger('reshape', [ null, null, width, height ]);

					entity = this.queryLayer('ui', 'info');
					entity.setPosition({
						x: 0,
						y: -1 / 2 * height + 42
					});

					entity = this.queryLayer('game', 'good');
					entity.setPosition({ x: -1 / 2 * width + 42 });

					entity = this.queryLayer('game', 'evil');
					entity.setPosition({ x:  1 / 2 * width - 42 });

				}

			}, this);

		}

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let renderer = this.renderer;
			let layer    = this.getLayer('ai');

			if (renderer !== null && layer !== null) {

				layer.unbind('epoche');


				let width  = renderer.width;
				let height = renderer.height;


				let ball = this.queryLayer('game', 'ball');
				let evil = this.queryLayer('game', 'evil');
				let good = this.queryLayer('game', 'good');


				if (evil !== null && ball !== null) {

					layer.addAgent(new _Agent({
						limit:  {
							x: width,
							y: height,
							z: 1
						},
						ball:   ball,
						paddle: evil
					}));

				}

				if (good !== null && ball !== null) {

					layer.addAgent(new _Agent({
						limit:  {
							x: width,
							y: height,
							z: 1
						},
						ball:   ball,
						paddle: good
					}));

				}

			}

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		enter: function(oncomplete) {

			let stats = this.__statistics || null;
			if (stats !== null) {

				stats.good       = 0;
				stats.evil       = 0;
				stats.generation = 1;

			}


			_reset_game.call(this, null);


			_State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			_State.prototype.leave.call(this, oncomplete);

		},

		update: function(clock, delta) {

			_State.prototype.update.call(this, clock, delta);


			let jukebox  = this.jukebox;
			let renderer = this.renderer;

			let ball     = this.queryLayer('game', 'ball');
			let evil     = this.queryLayer('game', 'evil');
			let good     = this.queryLayer('game', 'good');
			let hwidth   = renderer.width / 2;
			let hheight  = renderer.height / 2;
			let position = ball.position;
			let velocity = ball.velocity;


			/*
			 * 1: WORLD BOUNDARIES
			 */

			if (position.y > hheight && velocity.y > 0) {
				position.y = hheight - 1;
				velocity.y = -1 * velocity.y;
			}

			if (position.y < -hheight && velocity.y < 0) {
				position.y = -hheight + 1;
				velocity.y = -1 * velocity.y;
			}

			if (good.position.y < -hheight + 52) {
				good.position.y = -hheight + 52;
				good.velocity.y = 0;
			} else if (good.position.y > hheight - 52) {
				good.position.y = hheight - 52;
				good.velocity.y = 0;
			}

			if (evil.position.y < -hheight + 52) {
				evil.position.y = -hheight + 52;
				evil.velocity.y = 0;
			} else if (evil.position.y > hheight - 52) {
				evil.position.y = hheight - 52;
				evil.velocity.y = 0;
			}



			/*
			 * 2: GAME RESET
			 */

			if (position.x > hwidth) {

				_reset_game.call(this, 'good');
				return;

			} else if (position.x < -hwidth) {

				_reset_game.call(this, 'evil');
				return;

			}



			/*
			 * 3: COLLISIONS
			 */

			if (ball.collidesWith(good) === true) {

				position.x = good.position.x + 24;
				velocity.x = Math.abs(velocity.x);
				jukebox.play(_SOUNDS.ping);

				_bounce_effect.call(this, 'good');

			} else if (ball.collidesWith(evil) === true) {

				position.x = evil.position.x - 24;
				velocity.x = -1 * Math.abs(velocity.x);
				jukebox.play(_SOUNDS.pong);

				_bounce_effect.call(this, 'evil');

			}



			/*
			 * 4: CONTROLS
			 */

			// good.moveTo(target);
			// evil.moveTo(target);

		}

	};


	return Composite;

});
