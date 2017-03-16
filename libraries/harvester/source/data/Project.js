
lychee.define('harvester.data.Project').requires([
	'harvester.data.Filesystem',
	'harvester.data.Package',
	'harvester.data.Server'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _Emitter    = lychee.import('lychee.event.Emitter');
	const _Filesystem = lychee.import('harvester.data.Filesystem');
	const _Package    = lychee.import('harvester.data.Package');
	const _Server     = lychee.import('harvester.data.Server');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(identifier) {

		identifier = typeof identifier === 'string' ? identifier : null;


		this.identifier = identifier;
		this.filesystem = new _Filesystem(identifier);
		this.package    = new _Package(this.filesystem.read('/lychee.pkg'));
		this.server     = null;
		this.harvester  = this.filesystem.info('/harvester.js') !== null;


		if (Object.keys(this.package.source).length === 0) {
			console.error('harvester.data.Project: Invalid package at "' + identifier + '/lychee.pkg".');
		}


		_Emitter.call(this);

	};




	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'harvester.data.Project';


			let blob = data['blob'] || {};


			if (this.filesystem !== null) blob.filesystem = lychee.serialize(this.filesystem);
			if (this.package !== null)    blob.package    = lychee.serialize(this.package);
			if (this.server !== null)     blob.server     = lychee.serialize(this.server);


			data['arguments'] = [ this.identifier ];
			data['blob']      = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setPackage: function(pkg) {

			pkg = pkg instanceof _Package ? pkg : null;


			if (pkg !== null) {

				this.package = pkg;

				return true;

			}


			return false;

		},

		setServer: function(server) {

			server = server instanceof _Server ? server : null;


			if (server !== null) {

				this.server = server;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

