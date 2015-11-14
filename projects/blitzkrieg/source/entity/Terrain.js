
lychee.define('game.entity.Terrain').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;

	var _TYPES   = {
		 1: 'dirt-bound',
		 2: 'dirt-free',
		 3: 'grass-bound',
		 4: 'grass-free',
		 5: 'lava-bound',
		 6: 'lava-free',
		 7: 'rock-bound',
		 8: 'rock-free',
		 9: 'sand-bound',
		10: 'sand-free',
		11: 'snow-bound',
		12: 'snow-free',
		13: 'stone-bound',
		14: 'stone-free',
		15: 'water-bound',
		16: 'water-free'
	};


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;
		settings.map     = _config.map;
		settings.states  = _config.states;
		settings.state   = _TYPES[settings.type] || 'default';


		delete settings.type;


		lychee.app.Sprite.call(this, settings);

	};


	Class.prototype = {

		isFree: function() {

			var state = this.state;
			if (state.match(/free/) && !state.match(/water|lava/)) {
				return true;
			}


			return false;

		}

	};


	return Class;

});

