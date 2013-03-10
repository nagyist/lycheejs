
lychee.define('game.entity.ui.Properties').includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data, state) {

		this.state = state;


		var settings = lychee.extend({}, data);


		lychee.ui.Layer.call(this, settings);

		settings = null;

	};


	Class.prototype = {
	};


	return Class;

});

