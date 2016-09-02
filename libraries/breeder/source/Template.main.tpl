
lychee.define('fork.Main').requires([
	'app.Main',
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	const _app  = lychee.import('app');
	const _fork = lychee.import('fork');
	const _Main = lychee.import('app.Main');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({
			/* CUSTOM SETTINGS */
		}, data);


		_Main.call(this, settings);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'fork.Main';


			return data;

		}

	};


	return Composite;

});
