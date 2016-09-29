
lychee.define('lychee.ui.element.Search').requires([
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Select  = lychee.import('lychee.ui.entity.Select');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.data     = [];
		this.value    = '';

		this.__search = null;
		this.__select = null;


		this.setData(settings.data);

		delete settings.data;


		settings.label   = 'Search';
		settings.options = [];


		_Element.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.__search = new _Input({
			type:  _Input.TYPE.text,
			value: ''
		});

		this.__search.bind('change', function(value) {

			let filtered = this.data.filter(function(other) {
				return other.indexOf(value) !== -1;
			});

			if (filtered.length === 0) {

				this.__select.setOptions([ '- No matches -' ]);
				this.trigger('relayout');

				this.trigger('change', [ value ]);

			} else {

				this.__select.setOptions(filtered);
				this.trigger('relayout');

			}

		}, this);

		this.__select = new _Select({
			options: this.data,
			value:   this.data[0]
		});

		this.__select.bind('change', function(value) {

			if (value !== '- No matches -') {
				this.value = value;
				this.trigger('change', [ value ]);
			}

		}, this);

		this.addEntity(this.__search);
		this.addEntity(this.__select);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Search';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setData: function(data) {

			data = data instanceof Array ? data : null;


			if (data !== null) {

				this.data = data.map(function(value) {
					return '' + value;
				}).sort();


				let select = this.__select;
				if (select !== null) {
					select.setOptions(this.data);
					this.trigger('relayout');
				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

