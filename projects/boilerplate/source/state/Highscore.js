
lychee.define('game.state.Highscore').requires([
	'lychee.ui.Button',
	'lychee.ui.Label',
	'game.entity.Button'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob = attachments["json"].buffer;


	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			var entity = null;


			var service = this.client.getService('highscore');
			if (service !== null) {

				entity = this.queryLayer('ui', 'title');

				service.bind('unplug', function() {
					this.setLabel('Local Highscore');
				}, entity);

				service.bind('update', function() {
					this.setLabel('Global Highscore');
				}, entity);


				entity = this.queryLayer('ui', 'table');

				service.bind('update', function(data) {
// TODO: Render the highscore data
//console.log('received DATA from server', data);
				}, this);

			}

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.width;
				var height = renderer.height;


				entity = this.queryLayer('ui', 'button');
				entity.position.y = 1/2 * height - 42;

			}

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
