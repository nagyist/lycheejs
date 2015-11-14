
lychee.define('sorbet.data.Project').requires([
	'sorbet.data.Filesystem',
	'sorbet.data.Package',
	'sorbet.data.Server'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, sorbet, global, attachments) {



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(identifier, root) {

		identifier = typeof identifier === 'string' ? identifier : null;
		root       = typeof root === 'string'       ? root       : ('/projects/' + identifier);


		this.identifier = identifier;
		this.filesystem = new sorbet.data.Filesystem(root);
		this.package    = new sorbet.data.Package(this.filesystem.read('/lychee.pkg'));
		this.server     = null;
		this.sorbet     = this.filesystem.info('/sorbet.js') !== null;


		lychee.event.Emitter.call(this);

	};




	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'sorbet.data.Project';


			data['arguments'] = [ this.identifier, this.filesystem.root ];


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setPackage: function(package) {

			package = package instanceof sorbet.data.Package ? package : null;


			if (package !== null) {

				this.package = package;

				return true;

			}


			return false;

		},

		setServer: function(server) {

			server = server instanceof sorbet.data.Server ? server : null;


			if (server !== null) {

				this.server = server;

				return true;

			}


			return false;

		}

	};


	return Class;

});

