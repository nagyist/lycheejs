
lychee.define('tool.Main').requires([
	'lychee.data.JSON',
	'tool.data.SPRITE',
	'tool.ui.Dropzone'
]).includes([
	'lychee.game.Main'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	var _SPRITE = tool.data.SPRITE;
	var _JSON   = lychee.data.JSON;



	/*
	 * HELPERS
	 */

	var _download = function(filename, buffer) {

		filename = typeof filename === 'string' ? filename : null;
		buffer   = buffer instanceof Buffer     ? buffer   : null;


		if (filename !== null && buffer !== null) {

			var ext  = filename.split('.').pop();
			var type = 'plain/text';
			if (ext.match(/fnt|json/)) {
				type = 'application/json';
			} else if (ext.match(/png/)) {
				type = 'image/png';
			}

			var url     = 'data:' + type + ';base64,' + buffer.toString('base64');
			var event   = document.createEvent('MouseEvents');
			var element = document.createElement('a');


			element.download = filename;
			element.href     = url;

			event.initMouseEvent(
				'click',
				true,
				false,
				window,
				0,
				0,
				0,
				0,
				0,
				false,
				false,
				false,
				false,
				0,
				null
			);

			element.dispatchEvent(event);


			return true;

		}


		return false;

	};

	var _update_preview = function(blob) {

		var data = _JSON.decode(blob);
		if (data instanceof Object) {

			if (data.texture !== null) {

				var img = document.querySelector('img#preview-texture');
				if (img !== null) {
					img.src = data.texture;
				}

			}


			var button1 = document.querySelector('button#preview-download-config');
			if (button1 !== null) {

				var buffer1 = new Buffer(data.config.substr(29), 'base64');

				button1.onclick = function() {
					_download('Entity.json', buffer1);
				};

			}

			var button2 = document.querySelector('button#preview-download-texture');
			if (button2 !== null) {

				var buffer2 = new Buffer(data.texture.substr(22), 'base64');

				button2.onclick = function() {
					_download('Entity.png', buffer2);
				};

			}

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

			dropzone: {
				element:    null,
				extensions: {
					'png': true
				}
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		this.locked = false;


		lychee.game.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('init', function() {

			var settings = this.settings;
			if (settings.dropzone !== null) {

				this.dropzone = new tool.ui.Dropzone(settings.dropzone);
				this.dropzone.bind('change', function() {

					var onsubmit = document.querySelector('form').onsubmit;
					if (onsubmit instanceof Function) {
						onsubmit();
					}

				}, this);

			}

		}, this, true);


		this.bind('submit', function(id, settings) {

			if (id === 'settings') {

				settings.files = this.dropzone.files;


				if (this.locked === false) {

					this.locked = true;

					this.loop.setTimeout(100, function() {

						var sprite = _SPRITE.encode(settings);
						if (sprite !== null) {
							_update_preview(sprite);
						}

						this.locked = false;

					}, this);

				}

			}

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});
