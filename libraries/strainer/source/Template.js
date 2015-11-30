
lychee.define('strainer.Template').requires([
	'lychee.data.JSON'
]).includes([
	'fertilizer.Template'
]).exports(function(lychee, strainer, global, attachments) {

	var _JSON = lychee.data.JSON;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		fertilizer.Template.call(this, data);



		/*
		 * INITIALIZATION
		 */

		this.bind('init', function(oncomplete) {

			console.log('lychee:', lychee.ROOT.lychee);
			console.log('project:', lychee.ROOT.project);


			oncomplete(true);

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = fertilizer.Template.prototype.serialize.call(this);
			data['constructor'] = 'strainer.Template';


			return data;

		}

	};


	return Class;

});

