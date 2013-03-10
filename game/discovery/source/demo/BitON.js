
lychee.define('game.demo.BitON').requires([
	'lychee.data.BitON'
]).includes([
	'game.demo.Base'
]).exports(function(lychee, game, global, attachments) {

	var BitON = lychee.data.BitON;
	var _base = game.demo.Base;

	var _count = 0;

	var Demo = function(state) {

		_base.call(this, state);


		this.run("test123");
		this.run("verylong1long2long3long4long5long6test7");

		this.run([ 'test', 'test2' ]);
		this.run({ foo: 'bar' });
		this.run({ foo: [ 'test', null, false ], bar: [ 'test', null, true ] });

		this.run(1337);
		this.run([ 1, 3, 3, 7 ]);
		this.run({ foo: [ 1, 3, 3, 7 ] });

		this.run(133.7);
		this.run(13.37);
		this.run(1.337);
		this.run([ 1.337, 13.37, 133.7, 1337 ]);

	};

	Demo.TITLE = 'lychee.data: BitON';

	Demo.prototype = {

		run: function(data) {

			console.group('TEST RUN #' + _count++);

			var encoded = BitON.encode(data);
			var decoded = BitON.decode(encoded);

			console.log(data, decoded);

			console.groupEnd();

		}

	};


	return Demo;

});

