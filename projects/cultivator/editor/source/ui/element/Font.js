
lychee.define('app.ui.element.Font').requires([
	'app.codec.FONT',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select',
	'lychee.ui.entity.Slider'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Select  = lychee.import('lychee.ui.entity.Select');
	const _Slider  = lychee.import('lychee.ui.entity.Slider');
	const _FONT    = lychee.import('app.codec.FONT');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.font = null;


		settings.options = [];

		this.setFont(settings.font);

		delete settings.font;


		_Element.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.setEntity('family', new _Input({
			type:  _Input.TYPE.text,
			value: 'Ubuntu Mono'
		}));

		this.setEntity('color', new _Input({
			type:  _Input.TYPE.text,
			value: '#ffffff'
		}));

		this.setEntity('size', new _Slider({
			max:   128,
			min:   8,
			step:  4,
			type:  _Slider.TYPE.horizontal,
			value: 16
		}));

		this.setEntity('style', new _Select({
			options: [ 'normal', 'bold', 'italic' ],
			value:   'normal'
		}));

		this.setEntity('outline', new _Slider({
			max:   4,
			min:   1,
			step:  1,
			type:  _Slider.TYPE.horizontal,
			value: 1
		}));


		this.getEntity('family').bind('change', function(value) {

			let font = this.font;
			if (font !== null) {
				font.__buffer.font.family = value;
				font.__font.family        = value;
			}

		}, this);

		this.getEntity('color').bind('change', function(value) {

			let font = this.font;
			if (font !== null) {
				font.__buffer.font.color = value;
				font.__font.color        = value;
			}

		}, this);

		this.getEntity('size').bind('change', function(value) {

			let font = this.font;
			if (font !== null) {
				font.__buffer.font.size = value;
				font.__font.size        = value;
			}

		}, this);

		this.getEntity('style').bind('change', function(value) {

			let font = this.font;
			if (font !== null) {
				font.__buffer.font.style = value;
				font.__font.size         = value;
			}

		}, this);

		this.getEntity('outline').bind('change', function(value) {

			let font = this.font;
			if (font !== null) {
				font.__buffer.font.outline = value;
				font.__font.outline        = value;
			}

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.element.Font';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;


				let tmp = font.__font;

				this.getEntity('color').setValue(tmp.color);
				this.getEntity('family').setValue(tmp.family);
				this.getEntity('outline').setValue(tmp.outline);
				this.getEntity('size').setValue(tmp.size);
				this.getEntity('style').setValue(tmp.style);


				this.setOptions([]);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

