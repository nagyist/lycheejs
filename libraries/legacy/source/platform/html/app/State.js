
lychee.define('legacy.app.State').requires([
	'lychee.ai.Layer',
	'lychee.app.Layer',
	'lychee.ui.Layer'
]).includes([
	'lychee.app.State'
]).supports(function(lychee, global) {

	if (
		typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
	) {

		try {

			global.document.createElement('legacy-app-Main');

			return true;

		} catch (err) {
		}

	}


	return false;

}).exports(function(lychee, global, attachments) {


	// renderComponent(x1, y1, entity, map, values, {
	//   template:   _TEMPLATE,
	//   stylesheet: _STYLESHEET,
	//   wrapper:    document.querySelector('main > section')
	// })

	let Composite = function(data) {
		// TODO: Implement state._element
		// TODO: Inherit from lychee.app.State
	};


	Composite.prototype = {

	};


	return Composite;

});

