
lychee.define('strainer.api.Callback').requires([
	'lychee.crypto.MURMUR'
]).exports(function(lychee, global, attachments) {

	const _MURMUR = lychee.import('lychee.crypto.MURMUR');



	/*
	 * HELPERS
	 */

	const _get_function_hash = function(str) {

		let hash = new _MURMUR();

		hash.update(str);

		return hash.digest().toString('hex');

	};

	const _parse_value = function(str) {

		let val = undefined;
		try {
			val = eval('(' + str + ')');
		} catch (err) {
		}

		return val;

	};

	const _detect_type = function(str) {

		let type = 'undefined';


		if (str === 'undefined') {
			type = 'undefined';
		} else if (str === 'null') {
			type = 'null';
		} else if (str === 'true' || str === 'false') {
			type = 'Boolean';
		} else if (str.includes('===') && !str.includes('?')) {
			type = 'Boolean';
		} else if (str === '[]' || str.startsWith('[')) {
			type = 'Array';
		} else if (str === '{}' || str.startsWith('{')) {
			type = 'Object';
		} else if (str.startsWith('Composite.')) {
			type = 'Enum';
		} else if (str.startsWith('new Composite')) {
			type = 'Composite';
		} else if (str.startsWith('\'') && str.endsWith('\'')) {
			type = 'String';
		} else if (str.startsWith('"') && str.endsWith('"')) {
			type = 'String';
		} else if (str.startsWith('\'\' +') || str.startsWith('"" +')) {
			type = 'String';
		} else if (str.includes('toString')) {
			type = 'String';
		} else if (str.startsWith('0b') || str.startsWith('0x') || str.startsWith('0o') || /^[0-9\.]+$/g.test(str)) {
			type = 'Number';
		} else if (str === 'Infinity') {
			type = 'Number';
		} else if (str.startsWith('(') && str.endsWith(')')) {

			if (str.includes(' + ') && (str.includes('\'') || str.includes('"'))) {
				type = 'String';
			} else if (str.includes(' * ') || str.includes(' / ') || str.includes(' + ') || str.includes(' - ')) {
				type = 'Number';
			}

		} else {

			if (str.includes('instanceof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(/(.*)instanceof\s([A-Za-z_\.]+)([\s]+)(.*)\?/g);
				if (tmp.length > 2) {
					return tmp[2];
				}

			} else if (str.startsWith('typeof') && str.includes('===') && str.includes('?') && str.includes(':')) {

				// let tmp = str.split(/\(?typeof\s([a-z]+)\s?===\s?("|')(.*)("|')\s\)?\?(.*)/g);
				// switch (tmp[3]) ...
				let tmp = (str.split('?')[0].split('===')[1] || '').trim();
				if (tmp.startsWith('\'') || tmp.startsWith('\"')) {
					tmp = tmp.substr(1, tmp.length - 2);
				}


				switch (tmp) {
					case 'undefined': type = 'undefined'; break;
					case 'null':      type = 'null';      break;
					case 'boolean':   type = 'Boolean';   break;
					case 'number':    type = 'Number';    break;
					case 'string':    type = 'String';    break;
					case 'function':  type = 'Function';  break;
					case 'object':    type = 'Object';    break;
					default:          type = 'undefined'; break;
				}


				if (type === 'undefined') {

					let tmp1 = str.split(':').pop();
					if (tmp1.endsWith(';')) {
						tmp1 = tmp1.substr(0, tmp1.length - 1);
					}

					return _detect_type(tmp1.trim());

				}

			} else if (str.includes('!== undefined') && str.includes('?') && str.includes(':')) {

				return 'Object';

			} else if (str.startsWith('lychee.interfaceof')) {

				let tmp = str.split(/lychee.interfaceof\(([A-Za-z_\.]+),(.*)\)/g);
				if (tmp.length > 1) {
					return tmp[1];
				}

			} else if (str.startsWith('lychee.enumof')) {

				return 'Enum';

			} else if (str.startsWith('lychee.assignunlink')) {

				return 'Object';

			} else if (str.startsWith('lychee.diff')) {

				return 'Object';

			}

		}


		return type;

	};

	const _detect_value = function(str) {

		let value = undefined;


		if (str === 'undefined') {
			value = undefined;
		} else if (str === 'null') {
			value = null;
		} else if (str === 'true' || str === 'false') {
			value = str === 'true';
		} else if (str.includes('===') && !str.includes('?')) {
			value = true;
		} else if (str === '[]' || str.startsWith('[')) {
			value = _parse_value(str);
		} else if (str === '{}' || str.startsWith('{')) {
			value = _parse_value(str);
		} else if (str.startsWith('Composite.')) {
			value = str;
		} else if (str.startsWith('new Composite')) {
			value = str;
		} else if (str.startsWith('\'') && str.endsWith('\'')) {
			value = str.substr(1, str.length - 2);
		} else if (str.startsWith('"') && str.endsWith('"')) {
			value = str.substr(1, str.length - 2);
		} else if (str.includes('toString')) {
			value = "<string value>";
		} else if (str.startsWith('0b') || str.startsWith('0x') || str.startsWith('0o') || /^[0-9\.]+$/g.test(str)) {
			value = _parse_value(str);
		} else if (str === 'Infinity') {
			value = Infinity;
		} else if (str.startsWith('(') && str.endsWith(')')) {

			if (str.includes(' + ') && (str.includes('\'') || str.includes('"'))) {
				value = "<string value>";
			} else if (str.includes(' * ') || str.includes(' / ') || str.includes(' + ') || str.includes(' - ')) {
				value = 1337;
			}

		} else {

			if (str.includes('instanceof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				return _detect_value(tmp.trim());

			} else if (str.startsWith('typeof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				return _detect_value(tmp.trim());

			} else if (str.includes('!== undefined') && str.includes('?') && str.includes(':')) {

				return {};

			} else if (str.startsWith('lychee.interfaceof')) {

				if (str.indexOf(':') !== -1) {

					let tmp = str.split(':').pop();
					if (tmp.endsWith(';')) {
						tmp = tmp.substr(0, tmp.length - 1);
					}

					return _detect_value(tmp.trim());

				} else {

					let tmp = str.substr(19, str.indexOf(',') - 19).trim();
					if (tmp.length > 0) {
						value = tmp;
					}

				}

			} else if (str.startsWith('lychee.enumof')) {

				let tmp = str.split(/lychee\.enumof\(Composite\.([A-Z]+),(.*)\)/g);
				if (tmp.length > 2) {
					return 'Composite.' + tmp[1];
				}

			} else if (str.startsWith('lychee.assignunlink')) {

				return {};

			} else if (str.startsWith('lychee.diff')) {

				return {};

			}

		}


		return value;

	};

	const _parse_constructor = function(constructor, stream) {

		let i1 = stream.indexOf('\n\tconst Callback =');
		let i2 = stream.indexOf('\n\t};', i1);

		if (i1 !== -1 && i2 !== -1) {

			let body = stream.substr(i1 + 19, i2 - i1 - 15).trim();
			if (body.length > 0) {

				constructor.body       = body;
				constructor.hash       = _get_function_hash(body);
				constructor.parameters = [];

				let tmpa = body.substr(0, body.indexOf('\n')).trim();
				let tmpb = tmpa.split(/function\((.*)\)/g);
				if (tmpb.length > 1) {

					let tmpc = tmpb[1].trim();
					if (tmpc.length > 0) {

						constructor.parameters = tmpc.split(',').map(function(val) {

							return {
								name:  val.trim(),
								type:  'undefined',
								value: undefined
							};

						});

					}

				}


				body.split('\n').filter(function(line, l) {

					let tmp = line.trim();
					if (tmp === '' || tmp.startsWith('//')) {
						return false;
					} else if (tmp.startsWith('/*') || tmp.startsWith('*/') || tmp.startsWith('*')) {
						return false;
					}

					return true;

				}).slice(1, -1).forEach(function(line, l) {

					let tmp1 = line.trim();

					Object.values(constructor.parameters).forEach(function(parameter) {

						if (tmp1.startsWith(parameter.name) && tmp1.includes('=')) {

							let tmp2  = tmp1.substr(tmp1.indexOf('=') + 1).trim();
							let type  = _detect_type(tmp2);
							let value = _detect_value(tmp2);

							if (type !== 'undefined') {

								if (parameter.type === type) {

									if (parameter.value === undefined) {
										parameter.value = value;
									}

								} else if (parameter.type === 'undefined') {

									parameter.type  = type;
									parameter.value = value;

								}

							}

						}

					});

				});

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'strainer.api.Callback',
				'arguments': []
			};

		},

		check: function(asset) {

			let stream = asset.buffer.toString('utf8');
			let errors = [];
			let result = {
				constructor: {}
			};


			_parse_constructor(result.constructor, stream, errors);


			return {
				errors: errors,
				result: result
			};

		}

	};


	return Module;

});

