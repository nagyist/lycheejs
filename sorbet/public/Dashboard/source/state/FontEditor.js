
lychee.define('dashboard.state.FontEditor').requires([
	'dashboard.data.Font'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, dashboard, global, attachments) {

	var _Font      = dashboard.data.Font;
	var _templates = {
		settings: attachments['settings.tpl'].buffer,
		preview:  attachments['preview.tpl'].buffer
	};



	/*
	 * HELPERS
	 */

	var _get_filename = function(data) {


	};

	var _on_submit = function(data) {

		lychee.extend(this.content, data);

		var content = new _Font(this.content).toJSON();
		if (content.texture !== null) {

			var filename = data.family.split(' ').join('_') + '_' + data.size + '.fnt';


			ui.render('main > section > article.preview', {
				filename:   filename,
				texture:    content.texture,
				charset:    content.charset,
				map:        '[' + content.map.join(',') + ']',
				baseline:   content.baseline,
				lineheight: content.lineheight,
				kerning:    content.kerning,
				spacing:    content.spacing
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

					this.main.setDownload(
						filename,
						new Buffer(JSON.stringify(content), 'utf8')
					);

				}

			}, this);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var _default_model = {
		family:       'Ubuntu Mono',
		style:        'normal',
		size:         32,
		spacing:      8,
		color:        '#ffffff',
		outline:      2,
		outlinecolor: '#000000'
	};

	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.content = null;
		this.storage = main.storage || null;


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

		},

		leave: function() {

			this.main.unbind('submit', _on_submit, this);
			this.content = lychee.extendunlink({}, _default_model);


			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
