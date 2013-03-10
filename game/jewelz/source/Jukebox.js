
lychee.define('game.Jukebox').includes([
	'lychee.game.Jukebox'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		lychee.game.Jukebox.call(this, 20, game.loop);


		var bases = [
			'./asset/sound/success',
			'./asset/sound/fail',
			'./asset/music/temple'
		];

		var ids = [
			'success',
			'fail',
			'music'
		];


		for (var i = 0, il = ids.length; i < il; i++) {

			var track = new lychee.Track(ids[i], {
				base:    bases[i],
				formats: [ 'ogg', 'mp3' ]
			});

			this.add(track);

		}

	};


	return Class;

});

