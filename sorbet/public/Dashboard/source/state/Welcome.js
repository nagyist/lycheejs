
lychee.define('dashboard.state.Welcome').includes([
	'lychee.game.State'
]).exports(function(lychee, dashboard, global, attachments) {

	var _template = attachments["tpl"].buffer;


	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.content = null;


		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);

		},

		render: function() {

			var content = JSON.parse(JSON.stringify(this.content));
			if (content !== null) {

				ui.render('main > section', content, _template);
				ui.state('main > section > article', 'welcome');

			}

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);


			this.content = {};

		},

		leave: function() {

			this.content = null;


			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
