
lychee.define('studio.ui.element.preview.Font').includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	const _Element = lychee.import('lychee.ui.Element');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.font = null;


		_Element.call(this, settings);


		this.setFont(settings.font);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.element.preview.Font';


			return data;

		}

	};


	return Composite;

});

