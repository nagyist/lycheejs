
lychee.define('studio.ui.element.modify.Project').requires([
	'studio.data.Project',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.List',
	'lychee.ui.entity.Switch',
	'lychee.ui.entity.Texture'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _List    = lychee.import('lychee.ui.entity.List');
	const _Project = lychee.import('studio.data.Project');
	const _Switch  = lychee.import('lychee.ui.entity.Switch');
	const _Texture = lychee.import('lychee.ui.entity.Texture');
	const _TEXTURE = new Texture('/libraries/breeder/icon.png');



	/*
	 * FEATURE DETECTION
	 */

	(function(texture) {

		texture.load();

	})(_TEXTURE);



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.project = null;


		this.setProject(settings.project);

		delete settings.project;


		settings.label   = 'Modify';
		settings.options = [];

		_Element.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.setEntity('identifier', new _Input({
			type:  _Input.TYPE.text,
			value: '/projects/boilerplate'
		}));

		this.setEntity('icon', new _Texture({
			width:  128,
			height: 128 + 32 + 16,
			label: 'UPLOAD ICON',
			value: _TEXTURE
		}));

		this.setEntity('harvester', new _Switch({
			value: 'on'
		}));

		this.setEntity('platforms', new _List({
			options: [
				'html',
				'html-nwjs',
				'html-webview',
				'node',
				'node-sdl'
			],
			value:   {
				'html':         true,
				'html-nwjs':    true,
				'html-webview': true,
				'node':         true,
				'node-sdl':     true
			}
		}));


		this.getEntity('identifier').bind('change', function(value) {

			let project = this.project;
			if (project !== null) {
				project.setIdentifier(value);
			}

			this.setOptions([ 'Save' ]);

		}, this);

		this.getEntity('icon').bind('change', function(value) {

			let project = this.project;
			if (project !== null) {
				project.setIcon(value);
			}

			this.setOptions([ 'Save' ]);

		}, this);

		this.getEntity('harvester').bind('change', function(value) {

			let project = this.project;
			if (project !== null) {
				project.setHarvester(value === 'on');
			}

			this.setOptions([ 'Save' ]);

		}, this);

		this.getEntity('platforms').bind('change', function(value) {

			let project = this.project;
			if (project !== null) {

				project.setPlatforms(value);

				if (value.node === false) {
					this.getEntity('harvester').setValue('off');
				}

				this.setOptions([ 'Save' ]);

			}

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.element.Project';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setProject: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				this.project = project;

				this.getEntity('identifier').setValue(project.identifier);
				this.getEntity('harvester').setValue(project.harvester === true ? 'on' : 'off');
				this.getEntity('platforms').setValue(project.platforms);


				if (project.icon.buffer !== null) {
					this.getEntity('icon').setValue(project.icon);
				} else {
					this.getEntity('icon').setValue(_TEXTURE);
				}


				this.setOptions([]);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

