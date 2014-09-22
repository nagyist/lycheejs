
lychee.define('dashboard.state.Sprite').requires([
	'dashboard.data.Sprite'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, dashboard, global, attachments) {

	var _Sprite    = dashboard.data.Sprite;
	var _templates = {
		settings: attachments['settings.tpl'].buffer,
		preview:  attachments['preview.tpl'].buffer
	};



	/*
	 * HELPERS
	 */

	var _default_model = {
		width:          null,
		height:         null,
		radius:         null,
		texturesize:    1024,
		framesize:      64,
		framealign:     'center-center',
		boundingbox:    'image',
		statemap:       'image',
		stateanimation: 'image'
	};


	var _on_submit = function(data) {

		this.content = lychee.extend({
			files: this.__files
		}, _default_model, data);


		var content = new _Sprite(this.content).toJSON();
		if (content.texture !== null) {

			var width  = typeof this.content.width === 'number'  ? this.content.width  : 'not set';
			var height = typeof this.content.height === 'number' ? this.content.height : 'not set';
			var radius = typeof this.content.radius === 'number' ? this.content.radius : 'not set';


			var dimensions = [];

			if (width !== 'not set' && height !== 'not set') {
				dimensions.push({ type: 'Width',  value: width  });
				dimensions.push({ type: 'Height', value: height });
			} else if (radius !== 'not set') {
				dimensions.push({ type: 'Radius', value: radius });
			}


			ui.render('main > section > article.preview', {
				preview:    content.preview,
				dimensions: dimensions,
				map:        JSON.stringify(content.map,    null, '  '),
				states:     JSON.stringify(content.states, null, '  ')
			}, _templates.preview);


			this.loop.setTimeout(0, function() {

				var result = ui.bind('main > section > article.preview button.download', function(identifier) {

					if (identifier !== null) {

						var buffer = this.getDownload(identifier);
						if (buffer !== null) {
							ui.download(identifier, buffer);
						}

					}

				}, this.main);


				if (result === true) {

					var index  = 'data:image/png;base64,'.length;
					var config = {
						map:    content.map,
						shape:  0,
						states: content.states
					};


					if (width !== 'not set' && height !== 'not set') {

						config.width  = width;
						config.height = height;
						config.shape  = 1;

					} else if (radius !== 'not set') {

						config.radius = radius;
						config.shape  = 0;

					}


					this.main.setDownload('Sprite.png',  new Buffer(content.texture.substr(index), 'base64'));
					this.main.setDownload('Sprite.json', new Buffer(JSON.stringify(config, null, '\t'), 'utf8'));

				}

			}, this);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.content = null;
		this.storage = main.storage || null;

		this.__files = [];


		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);

		},

		render: function() {

			var content = JSON.parse(JSON.stringify(this.content));
			if (content !== null) {

				ui.render('main > section', content, _templates.settings, false);
				ui.render('main > section', '<p><center><b>Click on Generate to create a preview</b></center></p>', null, true);

				ui.state('main > section > article:nth-child(1)', 'settings');
				ui.state('main > section > article:nth-child(2)', 'preview');

			}

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);


			this.content = lychee.extendunlink({}, _default_model);
			this.main.bind('submit', _on_submit, this);


			this.loop.setTimeout(0, function() {

				ui.upload('main > section > article:nth-child(1) .ui-upload', function(raw) {

					if (raw.type === 'image/png') {

						var file = {
							name:    raw.name,
							type:    raw.type,
							texture: new Texture(raw.blob)
						};

						file.texture.load();
						this.__files.push(file);

						this.__files.sort(function(a, b) {
							if (a.name < b.name) return -1;
							if (a.name > b.name) return  1;
							return 0;
						});

					}


					var labels = [];
					for (var f = 0, fl = this.__files.length; f < fl; f++) {
						labels.push(this.__files[f].name);
					}


					ui.render('main > section > article:nth-child(1) .ui-upload-list', labels);

				}, this);

			}, this);

		},

		leave: function() {

			this.main.unbind('submit', _on_submit, this);
			this.content = lychee.extendunlink({}, _default_model);


			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
