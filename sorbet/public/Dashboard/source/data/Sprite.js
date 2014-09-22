
lychee.define('dashboard.data.Sprite').exports(function(lychee, dashboard, global, attachments) {

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



	var _get_frames = function(settings) {

		var files  = settings.files;
		var frames = [];
		var alignx = settings.framealign.split('-')[1] || 'center';
		var aligny = settings.framealign.split('-')[0] || 'center';
		var framew = 0;
		var frameh = 0;
		var sizex  = 0;
		var sizey  = 0;


		var framesize = settings.framesize;
		if (framesize === 'image') {

			for (var fi = 0, fil = files.length; fi < fil; fi++) {
				framew = Math.max(framew, files[fi].texture.buffer.width);
				frameh = Math.max(frameh, files[fi].texture.buffer.height);
			}

			sizex = Math.floor(settings.texturesize / framew);
			sizey = Math.floor(settings.texturesize / frameh);

		} else {

			var size = Math.round(Math.sqrt(files.length));
			if (size % 2 !== 0) {
				size++;
			}


			framew = framesize;
			frameh = framesize;

			sizex  = size;
			sizey  = size;

		}


		var boundingbox = settings.boundingbox;

		for (var f = 0, fl = files.length; f < fl; f++) {

			var state   = files[f].name.toLowerCase().split('_')[0].split('.')[0];
			var bufferw = files[f].texture.buffer.width;
			var bufferh = files[f].texture.buffer.height;
			var posx    = 0;
			var posy    = 0;
			var offsetx = ( f % sizex)      * framew;
			var offsety = ((f / sizex) | 0) * frameh;


			if (framesize !== 'image' || true) {

				if (alignx === 'center') {
					posx = (framew / 2) - (bufferw / 2);
				} else if (alignx === 'right') {
					posx = (framew - bufferw);
				}

				if (aligny === 'center') {
					posy = (frameh / 2) - (bufferh / 2);
				} else if (aligny === 'bottom') {
					posy = (frameh - bufferh);
				}

			}


			var frame = {
				state:   state,
				texture: files[f].texture || null,
				map: {
					x: offsetx,
					y: offsety,
					w: framew,
					h: frameh
				},
				render: {
					x: offsetx + posx,
					y: offsety + posy,
					w: bufferw,
					h: bufferh
				}
			};


			if (boundingbox === 'frame') {
				frame.map.width  = framew;
				frame.map.height = frameh;
			}


			frames.push(frame);

		}


		return frames;

	};

	var _get_map = function(statemap, states, frames) {

		var map = {};

		var f, fl;

		if (statemap === 'image') {

			for (f = 0, fl = frames.length; f < fl; f++) {

				var state = frames[f].state;

				if (map[state] === undefined) {
					map[state] = [];
					map[state].push(frames[f].map);
				} else {
					map[state].push(frames[f].map);
				}

			}

		} else if (statemap === 'none') {

			map['default'] = [];

			for (f = 0, fl = frames.length; f < fl; f++) {
				map['default'].push(frames[f].map);
			}

		}

		return map;

	};

	var _get_states = function(statemap, stateani, files) {

		var states = {};

		var f, fl;

		if (statemap === 'image') {

			for (f = 0, fl = files.length; f < fl; f++) {

				var state = files[f].name.toLowerCase().split('_')[0].split('.')[0];

				if (states[state] === undefined) {

					states[state] = {
						animation: false
					};

				} else if (states[state].animation === false) {

					if (stateani === 'image') {

						states[state].animation = true;
						states[state].duration  = 1000;
						states[state].loop      = true;

					}

				}

			}

		} else if (statemap === 'none') {

			states['default'] = {
				animation: false
			};

			if (files.length > 0) {

				if (stateani === 'image') {

					states['default'].animation = true;
					states['default'].duration  = 1000;
					states['default'].loop      = true;

				}

			}

		}


		return states;

	};

	var _render_frames = function(frames, debug) {

		for (var f = 0, fl = frames.length; f < fl; f++) {

			var frame   = frames[f];
			var texture = frame.texture;
			if (texture !== null) {

				var map    = frame.map;
				var render = frame.render;

				this.drawImage(
					texture.buffer,
					0,
					0,
					render.w,
					render.h,
					render.x,
					render.y,
					render.w,
					render.h
				);


				if (debug === true) {

					this.lineWidth   = 1;
					this.strokeStyle = '#ff0000';
					this.strokeRect(render.x, render.y, render.w, render.h);

					this.strokeStyle = '#00ff00';
					this.strokeRect(map.x, map.y, map.w, map.h);

				}

			}

		}

	};

	var _parse = function(settings) {

		/*
		 * 1. Get Frames and States from files
		 */

		var frames = _get_frames(settings);
		var states = _get_states(settings.statemap, settings.stateanimation, settings.files);
		var map    = _get_map(settings.statemap, states, frames);


		/*
		 * 2. Render Frames
		 */

		var texture = new _buffer(settings.texturesize, settings.texturesize);
		var preview = new _buffer(settings.texturesize, settings.texturesize);

		if (frames.length > 0) {

			_render_frames.call(
				texture.ctx,
				frames,
				false
			);

			_render_frames.call(
				preview.ctx,
				frames,
				true
			);

		}


		/*
		 * Export Settings
		 */

		this.texture = texture.toString();
		this.preview = preview.toString();
		this.map     = map;
		this.states  = states;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({
			texturesize:    1024,
			framesize:      64,
			framealign:     'center-center',
			boundingbox:    'image',
			statemap:       'image',
			stateanimation: 'image'
		}, data);


		this.map    = {};
		this.states = {};


		_parse.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		toJSON: function() {

			return {
				texture: this.texture,
				preview: this.preview,
				map:     this.map,
				states:  this.states
			};

		}

	};


	return Class;

});

