
lychee.define('game.Camera').exports(function(lychee, global) {

	var Class = function() {

		this.depth    = 0.2;
		this.offset   = 0;
		this.position = { x: 0, y: 0, z: 0 };

//		var fov = 100;
//		this.__depth    = 1 / Math.tan((fov/2) * Math.PI/180);
		this.__ratio    = 1.2;


	};


	Class.prototype = {

		reset: function(width, height) {

			this.offset = (width/height) * this.__ratio * height;

		}

	};


	return Class;

});

