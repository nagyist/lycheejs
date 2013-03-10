
lychee.define('game.demo.Base').exports(function(lychee, game, global, attachments) {

	var Demo = function(state) {

		this.state = state;
		this.layer = state.getLayer('demo');

		this.__entities = {};

	};


	Demo.prototype = {

	};


	return Demo;

});

