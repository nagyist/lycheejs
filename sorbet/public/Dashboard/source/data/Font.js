
lychee.define('dashboard.data.Font').tags({
	platform: 'html'
}).exports(function(lychee, game, global, attachments) {

	/*
	 * FEATURE DETECTION
	 */

	var _ctx      = null;
	var _document = global.document;

	(function(canvas) {

		_ctx = canvas.getContext('2d');

	})(_document.createElement('canvas'));



	/*
	 * HELPERS
	 */

	var _buffer = function(width, height) {

		this.width  = typeof width === 'number'  ? width  : 1;
		this.height = typeof height === 'number' ? height : 1;

		this.__buffer = _document.createElement('canvas');
		this.ctx      = this.__buffer.getContext('2d');

		this.__buffer.width  = this.width;
		this.__buffer.height = this.height;

	};

	_buffer.prototype = {

		toString: function() {
			return this.__buffer.toDataURL('image/png');
		}

	};



	var _measure_font = function(settings, charset) {

		var width    = settings.spacing;
		var height   = settings.size * 3;
		var widthmap = [];


		this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.family + '"';
		this.textBaseline = 'top';


		for (var c = 0; c < charset.length; c++) {

			var m = this.measureText(charset[c]);
			var w = Math.max(1, Math.ceil(m.width)) + settings.outline * 2;

			widthmap.push(w);
			width += w + settings.spacing * 2;

		}


		return {
			width:    width,
			height:   height,
			widthmap: widthmap
		};

	};

	var _measure_baseline = function(settings, charset, widthmap, x1, y1, x2, y2) {

		x1 = typeof x1 === 'number' ? x1 : 0;
		y1 = typeof y1 === 'number' ? y1 : 0;
		x2 = typeof x2 === 'number' ? x2 : 0;
		y2 = typeof y2 === 'number' ? y2 : 0;


		var data      = this.getImageData(x1, y1, x2 - x1, y2 - y1);
		var baselines = [];
		var margin    = settings.spacing;

		for (var c = 0; c < charset.length; c++) {

			var baseline = data.height;

			for (var x = margin; x < margin + widthmap[c]; x++) {

				for (var y = y1; y < data.height / 2; y++) {

					if (baseline > y) {

						if (data.data[y * data.height * 4 + x * 4 + 3]) {
							baseline = y;
							break;
						}

					}

				}

			}


			baselines.push(baseline);

			margin += widthmap[c] + settings.spacing * 2;

		}


		baselines.sort(function(a, b) {
			if (a < b) return -1;
			if (a > b) return  1;
			return 0;
		});


		// returns the minimum baseline
		return baselines[0];

	};

	var _measure_margin = function(x1, y1, x2, y2) {

		x1 = typeof x1 === 'number' ? x1 : 0;
		y1 = typeof y1 === 'number' ? y1 : 0;
		x2 = typeof x2 === 'number' ? x2 : 0;
		y2 = typeof y2 === 'number' ? y2 : 0;


		var data  = this.getImageData(x1, y1, x2 - x1, y2 - y1);
		var found = false;

		var mtop    = 96;
		var mbottom = 0;

		var d, dl, y;

		for (d = 0, dl = data.data.length; d < dl; d += 4) {

			// var x = (d / 4) % data.width;
			y = Math.floor((d / 4) / data.width);

			if (y < mtop && data.data[d + 3] > 0) {
				mtop = y;
			}

		}

		for (d = data.data.length - 1; d >= 0; d -= 4) {

			// var x = (d / 4) % data.width;
			y = Math.floor((d / 4) / data.width);

			if (y > mbottom && data.data[d + 3] > 0) {
				mbottom = y;
				break;
			}

		}


		return {
			top:    y1 + mtop,
			bottom: y2 - mbottom
		};

	};

	var _render_outline = function(settings, charset, widthmap, offset) {

		offset = typeof offset === 'number' ? offset : 0;


		this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.family + '"';
		this.textBaseline = 'top';
		this.fillStyle    = settings.outlinecolor;


		var outline = settings.outline;
		var margin  = settings.spacing;

		for (var c = 0; c < charset.length; c++) {

			for (var x = -1 * outline; x <= outline; x++) {

				for (var y = -1 * outline; y <= outline; y++) {

					this.fillText(
						charset[c],
						margin + x,
						offset + y
					);

				}

			}

			margin += widthmap[c] + settings.spacing * 2;

		}

	};

	var _render_font = function(settings, charset, widthmap, offset, debug) {

		offset = typeof offset === 'number' ? offset : 0;


		this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.family + '"';
		this.textBaseline = 'top';


		var margin = settings.spacing;

		for (var c = 0; c < charset.length; c++) {

			this.fillStyle = settings.color;
			this.fillText(
				charset[c],
				margin,
				offset
			);


			if (debug === true) {

				this.strokeStyle = '#00ff00';
				this.strokeRect(
					margin,
					offset,
					widthmap[c],
					settings.size
				);

			}


			margin += widthmap[c] + settings.spacing * 2;

		}

	};

	var _parse = function(settings) {

		var charset = [];
		for (var c = settings.charset[0]; c < settings.charset[1]; c++) {
			charset.push(String.fromCharCode(c));
		}


		/*
		 * 1. Measure approximate canvas dimensions
		 */

		var measurements = _measure_font.call(_ctx, settings, charset);
		var width        = measurements.width;
		var height       = measurements.height;
		var widthmap     = measurements.widthmap;


		/*
		 * 2. Render Font + Outline
		 */

		var texture = new _buffer(width, height);
		var preview = new _buffer(width, height);

		if (settings.outline > 0) {

			_render_outline.call(
				texture.ctx,
				settings,
				charset,
				widthmap,
				settings.size
			);

			_render_outline.call(
				preview.ctx,
				settings,
				charset,
				widthmap,
				settings.size
			);

		}

		_render_font.call(
			texture.ctx,
			settings,
			charset,
			widthmap,
			settings.size,
			false
		);

		_render_font.call(
			preview.ctx,
			settings,
			charset,
			widthmap,
			settings.size,
			true
		);


		/*
		 * 3. Measure font dimensions
		 * 4. Render Font + Outline again
		 */

		var margin = _measure_margin.call(texture.ctx, 0, 0, width, height);
		if (margin.top > 0 || margin.bottom > 0) {

			var h   = height - margin.top - margin.bottom;
			height  = h;
			texture = new _buffer(width, height);
			preview = new _buffer(width, height);


			if (settings.outline > 0) {

				_render_outline.call(
					texture.ctx,
					settings,
					charset,
					widthmap,
					settings.size - margin.top
				);

				_render_outline.call(
					preview.ctx,
					settings,
					charset,
					widthmap,
					settings.size - margin.top
				);

			}

			_render_font.call(
				texture.ctx,
				settings,
				charset,
				widthmap,
				settings.size - margin.top
			);

			_render_font.call(
				preview.ctx,
				settings,
				charset,
				widthmap,
				settings.size - margin.top,
				true
			);

		}


		/*
		 * 5. Measure Baseline
		 */

		var baseline = _measure_baseline.call(
			texture.ctx,
			settings,
			charset,
			widthmap,
			0,
			0,
			width,
			height
		);



		/*
		 * Export Settings
		 */

		this.texture    = texture.toString();
		this.preview    = preview.toString();
		this.charset    = charset.join('');
		this.map        = widthmap;
		this.baseline   = baseline;
		this.lineheight = texture.height;
		this.kerning    = 0;
		this.spacing    = settings.spacing;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({
			family:       'Ubuntu Mono',
			style:        'normal',
			size:         32,
			spacing:      8,
			outline:      0,
			color:        '#ffffff',
			outlinecolor: '#000000',
			charset:      [ 32, 127 ]
		}, data);


		this.texture    = null;
		this.preview    = null;
		this.charset    = '';
		this.map        = [];
		this.baseline   = 0;
		this.lineheight = 0;
		this.kerning    = 0;
		this.spacing    = 0;


		_parse.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		toJSON: function() {

			return {
				texture:    this.texture,
				preview:    this.preview,
				charset:    this.charset,
				map:        this.map,
				baseline:   this.baseline,
				lineheight: this.lineheight,
				kerning:    this.kerning,
				spacing:    this.spacing
			};

		}

	};


	return Class;

});

