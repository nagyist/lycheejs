
lychee.define('app.ui.layer.Profile').includes([
	'lychee.ui.Layer'
]).requires([
	'lychee.ui.entity.Input'
]).exports(function(lychee, app, global, attachments) {

	/*
	 * HELPERS
	 */

	var _on_relayout = function() {

		var entity  = null;
		var content = [
			this.getEntity('@host'),
			this.getEntity('@project'),
			this.getEntity('@options-next')
		];


		var x1    = -1/2 * this.width;
		var dim_x = this.width / content.length;
		var off_x = 0;

		for (var c = 0, cl = content.length; c < cl; c++) {

			entity = content[c];
			entity.position.x = x1 + off_x + dim_x / 2;
			entity.position.y = 0;


			off_x += dim_x;

		}

	};


	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.relayout = false;


		lychee.ui.Layer.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('relayout');
		this.bind('relayout', _on_relayout, this);


		this.setEntity('@host', new lychee.ui.entity.Input({
			type:  lychee.ui.entity.Input.TYPE.text,
			value: 'boilerplate.org'
		}));

		this.setEntity('@project', new lychee.ui.entity.Input({
			type:  lychee.ui.entity.Input.TYPE.text,
			value: '/projects/boilerplate'
		}));

		this.setEntity('@options-next', new lychee.ui.entity.Button({
			label: 'Add',
			value: 'add'
		}));


		this.getEntity('@options-next').bind('change', function(value) {

			var host    = this.getEntity('@host').value;
			var project = this.getEntity('@project').value;

			this.trigger('change', [{
				host:    host,
				project: project,
				action:  'add'
			}]);

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Layer.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.layer.Control';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;
			var x        = position.x + offsetX;
			var y        = position.y + offsetY;
			var hwidth   = this.width  / 2;
			var hheight  = this.height / 2;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				'#2f3736',
				true
			);

			if (alpha !== 0) {
				lychee.ui.Layer.prototype.render.call(this, renderer, offsetX, offsetY);
			}

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		}

	};


	return Class;

});

