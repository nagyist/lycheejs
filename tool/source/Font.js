
lychee.define('tool.Font').requires([
	'tool.FontGenerator',
	'ui.Main',
	'ui.Button',
	'ui.Input',
	'ui.Lightbox',
	'ui.Option',
	'ui.Radios',
	'ui.Select',
	'ui.Textarea'
]).exports(function(lychee, tool, global) {


	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		this.__exportFlag = false;

		this.__generator = new tool.FontGenerator(null);
		this.__generator.bind('ready', this.__render, this);
		this.__generator.bind('ready', this.__export, this);


		this.__lightbox = new ui.Lightbox('font-lightbox', 'Exported lychee.Font');
		ui.Main.get('main').add(this.__lightbox);


		this.__initUI();
		this.__refresh();

	};


	Class.prototype = {

		defaults: {
			font: 'Arial',
			size: 64,
			color: '#fff',
			style: 'normal',
			spacing: 5,
			outline: 2,
			outlineColor: '#000',
			background: 'transparent',
			firstChar: 32,
			lastChar: 127,
			spritemap: tool.FontGenerator.SPRITEMAP.x,

			backend: null

		},



		/*
		 * PRIVATE API
		 */
		__initUI: function() {

			var select = null;
			var options = null;


			var navi = ui.Main.get('navi');


			navi.add('Font Family', new ui.Input('text', this.settings.font, function(value) {
				this.settings.font = value;
				this.__refresh();
			}, this));

			navi.add('Font Size', new ui.Input('number', this.settings.size, function(value) {
				this.settings.size = value;
				this.__refresh();
			}, this));


			select = new ui.Select(function(value) {
				this.settings.style = value;
				this.__refresh();
			}, this);

			new ui.Option('normal', 'normal').addTo(select);
			new ui.Option('bold', 'bold').addTo(select);
			new ui.Option('italic', 'italic').addTo(select);

			select.set(this.settings.style);

			navi.add('Font Style', select);


			navi.add('Color', new ui.Input('text', this.settings.color, function(value) {
				if (value.charAt(0) === '#') {
					this.settings.color = value;
					this.__refresh();
				} else {
					return false;
				}
			}, this));

			navi.add('Spacing', new ui.Input('number', this.settings.spacing, function(value) {
				this.settings.spacing = value;
				this.__refresh();
			}, this));

			navi.add('Outline', new ui.Input('number', this.settings.outline, function(value) {
				this.settings.outline = value;
				this.__refresh();
			}, this));

			navi.add('Outline Color', new ui.Input('text', this.settings.outlineColor, function(value) {
				if (value.charAt(0) === '#') {
					this.settings.outlineColor = value;
					this.__refresh();
				} else {
					return false;
				}
			}, this));


			select = new ui.Select(function(value) {
				var _value = tool.FontGenerator.SPRITEMAP[value] || this.settings.spritemap;
				this.settings.spritemap = _value;
				this.__refresh();
			}, this);

			new ui.Option('none (single images)', 'none').addTo(select);
			new ui.Option('horizontal (x)', 'x').addTo(select);
			new ui.Option('quadratic (xy)', 'xy').addTo(select);

			select.set(this.settings.spritemap);

			navi.add('Spritemap', select);


			navi.add('Debug Mode', new ui.Radios([ 'on', 'off' ], 'off', function(value) {

				if (value === 'on') {

					lychee.debug = true;
					ui.Main.get('log').show();

				} else {

					lychee.debug = false;
					ui.Main.get('log').clear();
					ui.Main.get('log').hide();

				}

			}, this));


			var actions = document.createElement('div');
			actions.className = 'ui-actions';

			var refresh = new ui.Button('refresh', function() {
				this.__refresh();
			}, this);
			refresh.__element.className = 'cancel';
			refresh.addTo(actions);

			new ui.Button('export', function() {
				this.__refresh(true);
			}, this).addTo(actions);

			navi.add(null, actions);

		},

		__refresh: function(flag) {

			this.__exportFlag = flag === true ? true : false;

			ui.Main.get('log').clear();

			this.__generator.export(this.settings);

		},

		__render: function(data) {

			var viewport = ui.Main.get('viewport');

			viewport.clear();


			if (data.images) {

				for (var i = 0, l = data.images.length; i < l; i++) {
					viewport.add(data.images[i]);
				}

			} else if (data.sprite) {
				viewport.add(data.sprite);
			}

		},

		__export: function(data) {

			if (this.__exportFlag === true) {

				this.__lightbox.set(null);


				var code, desc, wrapper;

				desc = document.createElement('h3');
				desc.innerHTML = '1. Right Click / Save Image:';
				this.__lightbox.add(desc);


				wrapper = document.createElement('div');
				wrapper.id = 'font-lightbox-wrapper';


				var code = '// Preload image(s) using the lychee.Preloader, then create lychee.Font instance via:\n';


				if (data.images) {

					for (var i = 0, l = data.images.length; i < l; i++) {
						wrapper.appendChild(data.images[i]);
					}

					code += '// @images {Array}\n\n';
					code += 'new lychee.Font(\n\timages,\n\t' + data.settings + '\n);';

				} else if (data.sprite) {

					wrapper.appendChild(data.sprite);

					code += '// @image {Image}\n\n';
					code += 'new lychee.Font(\n\timage,\n\t' + data.settings + '\n);';

				}

				this.__lightbox.add(wrapper);


				desc = document.createElement('h3');
				desc.innerHTML = '2. Use lychee.Font:';
				this.__lightbox.add(desc);


				var textarea = new ui.Textarea(code);
				this.__lightbox.add(textarea);


				this.__lightbox.show();


				if (
					this.settings.backend !== null
					&& this.settings.spritemap === tool.FontGenerator.SPRITEMAP.none
					&& global.confirm('Do you want to send the sliced images to the server?\nThis will store them in the same folder.') === true
				) {
					this.__sendToBackend(data.images);
				}

				this.__refresh();

			}


		},

		__sendToBackend: function(images) {

			if (this.settings.backend !== null) {

				var url = this.settings.backend;
				var id = this.settings.firstChar;

				for (var i = 0, l = images.length; i < l; i++) {

					var data = images[i].src;

					var xhr = new XMLHttpRequest();
					xhr.open('POST', url, false);
					xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
					xhr.send('id=' + id + '&data=' + data);

					id++;

				}

			}

		}

	}


	return Class;

});

