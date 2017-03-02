
lychee.define('legacy.app.Main').requires([
	'legacy.Input',
	'legacy.Renderer'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	const _legacy = lychee.import('legacy');
	const _Main   = lychee.import('lychee.app.Main');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		_Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			this.settings.legacyinput    = this.settings.input;
			this.settings.input          = null;

			this.settings.legacyrenderer = this.settings.renderer;
			this.settings.renderer       = null;

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			let legacyinput = this.settings.legacyinput;
			if (legacyinput !== null) {
				this.input = new _legacy.Input(legacyinput);
			}

			let legacyrenderer = this.settings.legacyrenderer;
			if (legacyrenderer !== null) {
				this.renderer = new _legacy.Renderer(legacyrenderer);
			}

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'legacy.app.Main';


			return data;

		}

	};


	return Composite;

});

