
lychee.define('tool.Main').requires([
	'lychee.data.JSON',
	'tool.data.FNT'
]).includes([
	'lychee.game.Main'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	var _FNT  = tool.data.FNT;
	var _JSON = lychee.data.JSON;



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

	var _update_preview = function(blob, settings) {

		var data = _JSON.decode(blob);
		if (data instanceof Object) {

			if (data.texture !== null) {

				var img = document.querySelector('img#preview-texture');
				if (img !== null) {
					img.src = data.texture;
				}

			}

			var button = document.querySelector('button#preview-download');
			if (button !== null) {

				var filename = settings.family + '_' + settings.size + 'x' + settings.outline + '.fnt';
				var buffer   = new Buffer(blob, 'utf8');

				button.innerHTML = 'Download ' + filename;
				button.onclick = function() {
					_download(filename, buffer);
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

			viewport: {
				fullscreen: false
			}

		}, data);


		lychee.game.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

		}, this, true);

		this.bind('init', function() {

			var onsubmit = document.querySelector('form').onsubmit;
			if (onsubmit instanceof Function) {
				onsubmit();
			}

		}, this, true);


		this.bind('submit', function(id, settings) {

			if (id === 'settings') {

				var font = _FNT.encode(settings);
				if (font !== null) {
					_update_preview(font, settings);
				}

			}

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});
