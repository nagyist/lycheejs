
lychee.define('app.state.Welcome').includes([
	'lychee.ui.State'
]).requires([
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.entity.Text'
]).exports(function(lychee, app, global, attachments) {

	var _blob = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.ui.State.call(this, main);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Welcome';


			return data;

		},

		deserialize: function(blob) {

			lychee.ui.State.prototype.deserialize.call(this, blob);
			lychee.app.State.prototype.deserialize.call(this, _blob);


			this.queryLayer('ui', 'welcome > dialog').bind('change', function(value) {

				if (this.main.getState(value) !== null) {

					this.main.changeState(value);

				} else if (this.queryLayer('ui', value) !== null) {

					var val = value.charAt(0).toUpperCase() + value.substr(1);

					this.queryLayer('ui', 'menu').setValue(val);
					this.queryLayer('ui', 'menu').trigger('change', [ value ]);

				}

			}, this);

		}

	};


	return Class;

});
