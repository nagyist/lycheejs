
lychee.define('tool.Main').requires([
	'tool.data.SPRITE'
]).includes([
	'lychee.app.Main'
]).tags({
	platform: 'html'
}).exports(function(lychee, global, attachments) {

	const _ui         = lychee.import('ui');
	const _Main       = lychee.import('lychee.app.Main');
	const _DEFINITION = attachments["Entity.tpl"];
	const _SPRITE     = lychee.import('tool.data.SPRITE');



	/*
	 * HELPERS
	 */

	const _update_preview = function(blob) {

		let data = JSON.parse(blob);
		if (data instanceof Object) {

			if (data.texture !== null) {

				let img = document.querySelector('img#preview-texture');
				if (img !== null) {
					img.src = data.texture;
				}

			}


			let button = document.querySelector('button#preview-download');
			if (button !== null) {

				let buffer1 = new Buffer(_DEFINITION.buffer, 'utf8');
				let buffer2 = new Buffer(data.config.substr(29), 'base64');
				let buffer3 = new Buffer(data.texture.substr(22), 'base64');

				button.onclick = function() {
					_ui.download('Entity.js',   buffer1);
					_ui.download('Entity.json', buffer2);
					_ui.download('Entity.png',  buffer3);
				};

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let _SIZES = {
		1: 64,
		2: 128,
		3: 256,
		4: 512,
		5: 1024,
		6: 2048,
		7: 4096,
		8: 8192
	};

	let Composite = function(data) {

		let settings = Object.assign({

			client:   null,
			input:    null,
			jukebox:  null,
			renderer: null,
			server:   null,

			viewport: {
				fullscreen: false
			}

		}, data);


		this.locked = false;


		_Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('submit', function(id, settings) {

			if (id === 'settings') {

				if (this.locked === false) {

					this.locked = true;

					this.loop.setTimeout(500, function() {

						settings.texture = _SIZES[settings.size];

						let sprite = _SPRITE.encode(settings);
						if (sprite !== null) {
							_update_preview(sprite);
						}

						this.locked = false;

					}, this);

				}

			}

		}, this);

	};


	Composite.prototype = {

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'tool.Main';


			return data;

		}

	};


	return Composite;

});
