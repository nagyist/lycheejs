
={constructor}

# new lychee.Definition(identifier);

- *identifier* is unique *String*.

This constructor returns an instance of *lychee.Definition*.

```javascript
new lychee.Definition('foo.Foo').exports(function(lychee, foo, global, attachments) {

	var Class = function() {};
	Class.prototype = {};
	return Class;

});

new lychee.Definition('foo.Bar').requires([
	'foo.Foo'
]).exports(function(lychee, foo, global, attachments) {

	console.log(foo.Foo); // Yes, we have a constructor

	var Class = function() {};
	Class.prototype = {};
	return Class;

});
```

## Implementation Notes:

The unique identifier is used for determination of all dependencies
in the current [lychee.environment](lychee.html#properties-environment).



={methods-serialize}

### (Serialization Object) lychee.Definition.prototype.serialize(void);

- This method has no arguments.

This method returns the *Serialization Object* of the instance.



={methods-attaches}

### (Boolean) lychee.Definition.prototype.attaches(map);

- *(Object) map* is an Object consisting of a *(String) key* and a *(Asset) value*.

This method returns *true* on success and *false* on failure.

```javascript
var Foo = new lychee.Definition('foo.Foo');

Foo.attaches({
	'fnt': new Font('./url/to/Font.fnt'),
	'png': new Texture('./url/to/Texture.png'),
	'msc': new Music('./url/to/Music.msc')
});
```



={methods-exports}

### (Boolean) lychee.Definition.prototype.exports(callback);

- *(Function) callback* is a Function that returns the Definition.
Allowed return types are Callback, Class and Module

This method returns *true* on success and *false* on failure.

```javascript
var Foo = new lychee.Definition('foo.Foo');
var Bar = new lychee.Definition('foo.Bar');
var Qux = new lychee.Definition('foo.Qux');

Foo.exports(function(lychee, foo) {
	var Class = function() {};
	Class.prototype = {};
	return Class;
});

Bar.exports(function(lychee, foo) {
	var Module = { foo: function() {} };
	return Module;
});

Qux.exports(function(lychee, foo) {
	var Callback = function() {};
	return Callback;
});
```



={methods-includes}

### (Boolean) lychee.Definition.prototype.includes(definitions);

- *(Array) definitions* is an Array consisting of *(String) values*.

This method returns *true* on success and *false* on failure.

```javascript
var Foo = new lychee.Definition('foo.Foo');

Foo.includes([
	'foo.Bar',
	'foo.Qux'
]);
```



={methods-requires}

### (Boolean) lychee.Definition.prototype.requires(definitions);

- *(Array) definitions* is an Array consisting of *(String) values*.

This method returns *true* on success and *false* on failure.

```javascript
var Foo = new lychee.Definition('foo.Foo');

Foo.requires([
	'foo.Bar',
	'foo.Qux'
]);
```



={methods-supports}

### (Boolean) lychee.Definition.prototype.supports(callback);

- *(Function) callback* is a Function that returns either *true* or *false*.

This method returns *true* on success and *false* on failure.

The callback is called at compilation runtime, which means it should work
multiple times, even if the Definition defined in [exports()](#methods-exports)
is replaced by another one.

If no callback is defined, it is assumed that this Definition will work on
every theoretical JavaScript environment.

```javascript
var Foo = new lychee.Definition('foo.Foo');

Foo.supports(function(lychee, global) {

	var document = global.document || null;
	if (document !== null && typeof document.createElement === 'function') {

		var canvas = document.createElement('canvas');
		if (typeof canvas.getContext === 'function') {
			return true;
		}

	}

	return false;

});
```



={methods-tags}

### (Boolean) lychee.Definition.prototype.tags(map);

- *(Object) map* is an Object consisting of a *(String) key* and a *(String) value*.

This method returns *true* on success and *false* on failure.

Each tag has to be unique. Only one unique Definition with the same
identifier can be used to determine its functionality.

```javascript
var CanvasRenderer = new lychee.Definition('foo.Renderer');
var WebGLRenderer  = new lychee.Definition('foo.Renderer');

CanvasRenderer.tags({
	platform:  'html',
	rendering: '2d'
});

WebGLRenderer.tags({
	platform:  'html-webgl',
	rendering: '2d'
});
```

