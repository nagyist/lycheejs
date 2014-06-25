<!doctype html>
<html>
<head>
	<title>Error {{status}}</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<style>
		@font-face {
			font-family: 'exolight';
			src: url('/webfont/exo-light.eot');
			src: url('/webfont/exo-light.eot?#iefix') format('embedded-opentype'),
				 url('/webfont/exo-light.woff') format('woff'),
				 url('/webfont/exo-light.ttf') format('truetype'),
				 url('/webfont/exo-light.svg#exolight') format('svg');
			font-weight: normal;
			font-style: normal;
		}

		@font-face {
			font-family: 'exobold';
			src: url('/webfont/exo-bold.eot');
			src: url('/webfont/exo-bold.eot?#iefix') format('embedded-opentype'),
				 url('/webfont/exo-bold.woff') format('woff'),
				 url('/webfont/exo-bold.ttf') format('truetype'),
				 url('/webfont/exo-bold.svg#exoextrabold') format('svg');
			font-weight: normal;
			font-style: normal;
		}

		h1#logo {
			display: block;
			position: relative;
			margin: 16px auto;
		}

		h1#logo a {
			display: block;
			width: 384px;
			height: 64px;
			margin: 0 auto;
			background: url('/logo.png') no-repeat;
			font-size: 1px;
			color: transparent;
		}

		body {
			margin: 0px;
			padding: 0px;
			color: #dddddd;
			background: #000000;
		}

		article {
			display: block;
			position: static;
			margin: 0px 0px 16px 0px;
			padding: 16px;
			background: #222222;
			border: 2px solid #ffffff;
			border-radius: 16px;
		}

		article h1 {
			margin: 0px 0px 1em 0px;
			font-family: 'exobold';
			font-size: 1.5em;
			border-bottom: 2px solid #444444;
		}

		article a {
			padding: 2px 4px;
			color: #8f292f;
			background: #222222;
			border: 2px solid #222222;
			transition: 250ms all ease-out;
		}

		article a:hover,
		article a:focus {
			color: #ffffff;
			background: #000000;
			border: 2px solid #ffffff;
			border-radius: 8px;
		}

		#sorbet-view {
			margin: 16px auto;
			width: 512px;
			max-width: 100%;
		}

		#sorbet-footer {
			display: block;
			position: absolute;
			top: auto;
			right: 16px;
			bottom: 32px;
			left: 16px;
			z-index: 101;
		}

		#sorbet-footer-version {
			position: absolute;
			right: 16px;
			font-family: 'exolight';
			font-size: 16px;
		}



		@media screen and (max-width: 512px) {

			#sorbet-view {
				width: 90%;
			}

		}
	</style>
</head>
<body>
	<h1 id="logo"><a href="http://lycheeJS.org">lycheeJS</a></h1>
	<div id="sorbet-scaffold">
		<div id="sorbet-view">
			<article>
				<h1>Error {{status}}</h1>
				<p>{{message}}</p>
				<p id="wrapper-hint">
					Alternatively, you can navigate back to the <a href="/">VirtualHost&nbsp;root</a>.
				</p>
			</article>
		</div>
		<div id="sorbet-footer">
			<small id="sorbet-footer-version">{{version}}</small>
		</div>
	</div>
</body>
</html>
