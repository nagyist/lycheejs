
var path = "../../lychee";

require(path + '/core.js');
require(path + '/Builder.js');
require(path + '/Preloader.js');

// bootstrap.js requires the root path to this file.
require(path + '/platform/nodejs/bootstrap.js')(__dirname);

require('./source/Server.js');


lychee.debug = true;

lychee.rebase({
	lychee: "../../lychee",
	game: "./source"
});

lychee.tag({
	platform: [ 'nodejs' ]
});


lychee.build(function(lychee, global) {

	var drones = [{
		id: 'Lima',
		ip: '192.168.1.1'
	}, {
		id: 'Jordan',
		ip: '192.168.1.2'
	}, {
		id: 'Victoria',
		ip: '192.168.1.3'
	}];


	var arr = [];

	for (var d = 0, dl = drones.length; d < dl; d++) {

		var drone = new game.ar.Drone(drones[d].id, {
			ip: drones[d].ip
		});

		arr.push(drone);

	}


	new game.Server(arr);

}, typeof global !== 'undefined' ? global : this);


