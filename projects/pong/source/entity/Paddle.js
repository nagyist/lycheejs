
lychee.define('game.entity.Paddle').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Sprite   = lychee.import('lychee.app.Sprite');
	const _CONFIG   = attachments["json"].buffer;
	const _TEXTURES = {
		player: attachments["player.png"],
		enemy:  attachments["enemy.png"]
	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, _CONFIG, data);


		settings.texture = _TEXTURES[settings.state || 'player'];


		_Sprite.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Paddle';


			return data;

		}

	};


	return Composite;

});
