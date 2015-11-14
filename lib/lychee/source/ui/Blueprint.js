
lychee.define('lychee.ui.Blueprint').requires([
	'lychee.ui.Entity'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _on_relayout = function() {

		var grid       = this.grid;
		var projection = this.projection;

// layer is already projected
// entities are already resized to their according grid-size
// layer is already resized in boundaries


// TODO: Reposition entities based on their priority
// TODO: Resize layer here again based on new dimensions
// XXX: DON'T fire the relayout event again!!! (endless loop)

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		lychee.ui.Layer.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('relayout', _on_relayout, this);

	};


	Class.prototype = {



	};


	return Class;

});

