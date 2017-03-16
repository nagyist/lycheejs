
lychee.define('studio.state.Asset').includes([
	'lychee.ui.State'
]).requires([
	'studio.ui.element.modify.Font',
//	'studio.ui.element.modify.Music',
//	'studio.ui.element.modify.Sound',
//	'studio.ui.element.modify.Sprite',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.element.Search'
]).exports(function(lychee, global, attachments) {

	const _State  = lychee.import('lychee.ui.State');
	const _Font   = lychee.import('studio.ui.element.modify.Font');
	const _Music  = lychee.import('studio.ui.element.modify.Music');
	const _Sound  = lychee.import('studio.ui.element.modify.Sound');
	const _Sprite = lychee.import('studio.ui.element.modify.Sprite');
	const _BLOB   = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	const _on_change = function(value) {

		let layer   = this.queryLayer('ui', 'asset');
		let modify  = this.queryLayer('ui', 'asset > modify');
		let project = this.main.project;
		let ext     = value.split('.').pop();


		if (modify !== null) {
			layer.removeEntity(modify);
		}


		if (ext === 'fnt') {

			let asset = new Font(project.identifier + '/source/' + value);

			asset.onload = function() {

				let element = new _Font({
					width:  320,
					height: 620,
					font:   asset
				});

				element.bind('change', function(val) {
					console.log('changed value', val);
				}, this);

				layer.setEntity('modify', element);
				layer.trigger('relayout');

			}.bind(this);

			asset.load();

		} else if (ext === 'png') {

			// TODO: Sprite support

		} else if (ext === 'msc') {

			// TODO: Music support

		} else if (ext === 'snd') {

			// TODO: Sound support

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		_State.call(this, main);


		this.api = main.api || null;


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'studio.state.Asset';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			this.queryLayer('ui', 'asset > select').bind('change', _on_change, this);

		},

		enter: function(oncomplete, data) {

			let project = this.main.project;
			let select  = this.queryLayer('ui', 'asset > select');

			if (project !== null && select !== null) {

				let filtered = [];
				let assets   = project.getAssets();

				assets.forEach(function(asset) {

					let ext  = asset.split('.').pop();
					let path = asset.split('.').slice(0, -1).join('.');
					let map  = assets.indexOf(path + '.json');

					if (ext === 'png' && map !== -1) {
						filtered.push(path + '.png');
					} else if (ext === 'fnt') {
						filtered.push(path + '.fnt');
					} else if (ext === 'msc') {
						filtered.push(path + '.msc');
					} else if (ext === 'snd') {
						filtered.push(path + '.snd');
					}

				});

				select.setData(filtered);

			}


			_State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Composite;

});

