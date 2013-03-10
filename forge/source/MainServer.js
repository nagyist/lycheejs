
lychee.define('game.MainServer').requires([
	'game.WebServer',
	'lychee.net.Server',
	'lychee.net.remote.RoomService'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__config    = null;
		this.__configurl = './profile/' + settings.profile + '.json';
		this.__root      = typeof settings.root === 'string' ? settings.root : '/var/www';

		this.server      = null;
		this.webserver   = null;


		this.preloader = new lychee.Preloader({
			timeout: Infinity
		});

		this.preloader.bind('ready', this.__processReady, this);


		this.preloader.load(this.__configurl);

	};


	Class.prototype = {

		__processReady: function(assets, maps) {

			this.__config = assets[this.__configurl] || null;


			var config = this.__config;
			if (config !== null) {

				var root = this.__root;


				for (var h = 0, hl = config.hosts.length; h < hl; h++) {

					var host = config.hosts[h][1];

					host.root = host.root.replace("%root%", root);

					if (host.aliases instanceof Object) {

						for (var a in host.aliases) {
							host.aliases[a] = host.aliases[a].replace("%root%", root);
						}

					}

					if (host.redirects instanceof Object) {

						for (var r in host.redirects) {
							host.redirects[r] = host.redirects[r].replace("%root%", root);
						}

					}

				}


				this.server = new lychee.net.Server(
					JSON.stringify, JSON.parse
				);

				this.server.bind('connect', function(remote) {
					remote.accept();
				}, this);

				this.server.listen(1337);


				this.webserver = new game.WebServer({
					root:  root,
					hosts: config.hosts
				});

				this.webserver.listen(config.port || 8080);

			}

		}

	};


	return Class;

});

