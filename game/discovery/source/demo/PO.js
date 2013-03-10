
lychee.define('game.demo.PO').requires([
	'lychee.data.PO'
]).includes([
	'game.demo.Base'
]).exports(function(lychee, game, global, attachments) {

	var PO = lychee.data.PO;
	var _base = game.demo.Base;

	var _count = 0;

	var Demo = function(state) {

		_base.call(this, state);


		var preloader = new lychee.Preloader({
			timeout: 3000
		});


		var base = this.state.game.settings.base;
		var urls = [
			base + '/po/de_DE.po'
		];

		preloader.bind('ready', function(assets) {

			for (var u = 0, ul = urls.length; u < ul; u++) {
				this.run(assets[urls[u]]);
			}

		}, this);

		preloader.load(urls);

	};

	Demo.TITLE = 'lychee.data: PO';

	Demo.prototype = {

		run: function(data) {

			console.group('TEST RUN #' + _count++);

			var decoded = PO.decode(data);

			console.log(decoded);

			console.groupEnd();

		}

	};


	return Demo;

});

