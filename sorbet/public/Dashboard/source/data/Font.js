
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


		var data      = this.getImageData(x1, y1, x2, y2);
		var baselines = [];
		var margin    = settings.spacing;

		for (var c = 0; c < charset.length; c++) {

			var baseline = y2;

			for (var x = margin; x < margin + widthmap[c]; x++) {

				for (var y = y1; y < (y2 - y1) / 2; y++) {

					if (baseline > y) {

						if (data.data[y * (y2 - y1) * 4 + x * 4 + 3]) {
							baseline = y;
							break;
						}

					}

				}

			}


			baselines.push(baseline);

			margin += widthmap[c] + settings.spacing * 2;

		}


		var rating = {};
		for (var b = 0; b < baselines.length; b++) {

			if (rating[baselines[b]] === undefined) {
				rating[baselines[b]] = 0;
			} else {
				rating[baselines[b]]++;
			}

		}


		var amount  = 0;
		var current = 0;

		for (var r in rating) {

			var baseline = parseInt(r, 10);

			if (rating[r] > amount) {
				amount  = rating[r];
				current = baseline;
			} else if (
				rating[r] === current
				&& baseline < current
			) {
				current = baseline;
			}

		}


		return current;

	};

	var _measure_margin = function(x1, y1, x2, y2) {

		x1 = typeof x1 === 'number' ? x1 : 0;
		y1 = typeof y1 === 'number' ? y1 : 0;
		x2 = typeof x2 === 'number' ? x2 : 0;
		y2 = typeof y2 === 'number' ? y2 : 0;


		var margin = {
			top:    0,
			bottom: 0
		};


		var data  = this.getImageData(x1, y1, x2, y2);
		var x     = 0;
		var y     = 0;
		var found = false;


		for (y = y1; y < y2; y++) {

			found = false;

			for (x = x1; x < x2; x++) {

				if (data.data[y * (y2 - y1) * 4 + x * 4 + 3]) {
					found = true;
					break;
				}

			}

			if (found === true) {
				margin.top = y;
				break;
			}

		}


		for (y = y2 - 1; y >= 0; y--) {

			found = false;

			for (x = x1; x < x2; x++) {

				if (data.data[y * (y2 - y1) * 4 + x * 4 + 3]) {
					found = true;
					break;
				}

			}

			if (found === true) {
				margin.bottom = y + 1;
				break;
			}

		}


		return margin;

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

	var _render_font = function(settings, charset, widthmap, offset) {

		offset = typeof offset === 'number' ? offset : 0;


		this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.family + '"';
		this.textBaseline = 'top';
		this.fillStyle    = settings.color;


		var margin = settings.spacing;

		for (var c = 0; c < charset.length; c++) {

			this.fillText(
				charset[c],
				margin,
				offset
			);

			margin += widthmap[c] + settings.spacing * 2;

		}

	};

	var _render = function(settings) {

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

		var buffer = new _buffer(width, height);

		if (settings.outline > 0) {

			_render_outline.call(
				buffer.ctx,
				settings,
				charset,
				widthmap,
				settings.size
			);

		}

		_render_font.call(
			buffer.ctx,
			settings,
			charset,
			widthmap,
			settings.size
		);


		/*
		 * 3. Measure font dimensions
		 * 4. Render Font + Outline again
		 */

		var margin = _measure_margin.call(buffer.ctx, 0, 0, width, height);
		if (margin.top > 0 || margin.bottom > 0) {

			var h  = height - margin.top - (height - margin.bottom);
			height = h;
			buffer = new _buffer(width, height);

			if (settings.outline > 0) {

				_render_outline.call(
					buffer.ctx,
					settings,
					charset,
					widthmap,
					settings.size - margin.top
				);

			}

			_render_font.call(
				buffer.ctx,
				settings,
				charset,
				widthmap,
				settings.size - margin.top
			);

		}


		/*
		 * 5. Measure Baseline
		 */

		var baseline = _measure_baseline.call(
			buffer.ctx,
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

		this.texture    = buffer.toString();
		this.charset    = charset.join('');
		this.map        = widthmap;
		this.baseline   = baseline;
		this.lineheight = buffer.height;
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
		this.charset    = '';
		this.map        = [];
		this.baseline   = 0;
		this.lineheight = 0;
		this.kerning    = 0;
		this.spacing    = 0;


		_render.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		toJSON: function() {

			return {
				texture:    this.texture,
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

