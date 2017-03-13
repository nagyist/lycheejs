
lychee.define('app.ui.element.Breeder').requires([
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Text'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Text    = lychee.import('lychee.ui.entity.Text');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.options = [];

		_Element.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.addEntity(new _Text({
			value: [
				'The selected project can be cloned',
				'or forked into a new project:'
			].join('\n')
		}));

		this.addEntity(new _Input({
			type:  _Input.TYPE.text,
			value: '/projects/my-project'
		}));

		this.addEntity(new _Text({
			value: [
				'\n\n\n\n',
				'The lycheejs-breeder allows to do',
				'this (alternatively) in the Terminal:'
			].join('\n')
		}));

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.element.Breeder';


			return data;

		}

	};


	return Composite;

});

