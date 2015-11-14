
= constructor

```javascript
new lychee.Environment(settings);
```

- `settings` is an `Object`.

This constructor returns an instance of `lychee.Environment`.
The `settings` object consists of the following properties:

- `(String) id` will be passed to [setId](#methods-setId).
- `(String) build` will be passed to [setBuild](#methods-setBuild).
- `(Boolean) debug` will be passed to [setDebug](#methods-setDebug).
- `(Object) definitions` will be passed to [setDefinitions](#methods-setDefinitions).
- `(Array) packages` will be passed to [setPackages](#methods-setPackages).
- `(Boolean) sandbox` will be passed to [setSandbox](#methods-setSandbox).
- `(Object) tags` will be passed to [setTags](#methods-setTags).
- `(Number) timeout` will be passed to [setTimeout](#methods-setTimeout).
- `(String) type` will be passed to [setType](#methods-setType).

```javascript
var environment = new lychee.Environment({
	id:      'example',
	build:   'app.Main',
	debug:   true,
	sandbox: false,
	tags:    {
		platform: [ 'html' ]
	},
	timeout: 5000,
	type:    'source'
});
```



= properties-id

```javascript
(String) new lychee.Environment().id;
```

The `(String) id` property is the unique identifier of the environment.

It influences the behaviour of the [lychee.Debugger](lychee.Debugger).
It is important that this identifier is unique across the peer cloud.

It is set via `settings.id` in the [constructor](#constructor)
or via [setId](#methods-setId).

```javascript
var environment = new lychee.Environment({
	id: 'test'
});

environment.id;               // 'test'
environment.setId('example'); // true
environment.id;               // 'example'
environment.setId(null);      // false
environment.id;               // 'example'
```



= properties-build

```javascript
(String) new lychee.Environment().build;
```

The `(String) build` property is the build target of the environment instance.

It influences the [init](#methods-init) callback behaviour.

It is set via `settings.build` in the [constructor](#constructor)
or via [setBuild](#methods-setBuild).

```javascript
var environment = new lychee.Environment({
	build: 'example.Foo',
	packages: [
		new lychee.Package('example', './lychee.pkg')
	]
});

environment.build;                   // 'example.Foo'
environment.setBuild('example.Bar'); // true

environment.init(function(sandbox) {

	var lychee  = sandbox.lychee;
	var example = sandbox.example;

	// This configuration assumes that a "./source/Bar.js" exists as example.Bar

});
```



= properties-debug

```javascript
(Boolean) new lychee.Environment().debug;
```

The `(Boolean) debug` property is the state whether the environment
and its loaded definitions should print debug output to the console
or not.

It influences the logging of additional debug data to the console.
It is reflected by the [lychee.debug](lychee#properties-debug)
property inside the sandbox.

It is set via `settings.debug` in the [constructor](#constructor)
or via [setDebug](#methods-setDebug).

```javascript
var environment = new lychee.Environment({
	debug: false
});

environment.debug;          // false
environment.setDebug(true); // true
environment.debug;          // true

environment.init(function(sandbox) {

	var lychee = sandbox.lychee;
	if (lychee.debug === true) {
		console.log('Additional debug data is dumped to console');
	}

});

```



= properties-definitions

```javascript
(Object) new lychee.Environment().definitions;
```

The `(Object) definitions` property is the object consisting of
the map of available [lychee.Definition](lychee.Definition)
instances inside the environment, each mapped as the available
identifier.

It is set via `settings.definitions` in the [constructor](#constructor)
or via [setDefinitions](#methods-setDefinitions).

```javascript
var Foo = new lychee.Definition('example.Foo');
var Bar = new lychee.Definition('example.Bar');

var environment = new lychee.Definition({
	debug: true,
	build: 'example.Foo',
	type:  'build' // avoid loading from source path
});

environment.setDefinitions({
	'example.Foo': Foo,
	'example.Bar': Bar,
	'example.Qux': Foo,
	'another.Bar': Bar
});

environment.init(function(sandbox) {

	var lychee  = sandbox.lychee;
	var another = sandbox.another;
	var example = sandbox.example;

	// Note the mapped namespaces by the setDefinitions() call

});
```



= properties-global

```javascript
(Object) new lychee.Environment().global;
```

The `(Object) global` property is the scope that is the result
of the build process. If the [sandbox](#properties-sandbox)
property is set to `false`, this is identical to the global
scope of the runtime.



= properties-packages

```javascript
(Array) new lychee.Environment().packages;
```

The `(Array) packages` property is an array of all registered
[lychee.Package](lychee.Package) instances.

It influences the behaviour of loading additional definitions
into the environment. As each package's id is associated with
the equivalent namespace, they are responsible for loading 
definitions inside their namespace.

It is set via `settings.packages` in the [constructor](#constructor)
or via [setPackages](#methods-setPackages).

```javascript
var foo = new lychee.Package('foo', './foo/lychee.pkg');
var bar = new lychee.Package('bar', './bar/lychee.pkg');

var environment = new lychee.Environment({
	debug:    false,
	packages: [ foo ]
});

// Note that the lychee package is auto-filled
environment.packages.length;           // 2

environment.setPackages([ foo, bar ]); // true
environment.packages.length;           // 3
```



= properties-sandbox

```javascript
(Boolean) new lychee.Environment().sandbox;
```

The `(Boolean) sandbox` property is the state whether the sandboxing
mode is activated or not.

It influences how the [global](#properties-global) property of the
environment is built up. If set to `true`, it will create an isolated
scope for the build. If set to `false`, it will use the global scope
of the runtime and dispatch all namespaces there.

It is set via `settings.sandbox` in the [constructor](#constructor)
or via [setSandbox](#methods-setSandbox).

```javascript
var global      = this;
var environment = new lychee.Environment({
	sandbox: true
});

environment.sandbox;           // true
environment.global === global; // false

environment.init(function(sandbox) {
	sandbox === environment.global; // true
});
```



= properties-tags

```javascript
(Object) new lychee.Environment().tags;
```

The `(Object) tags` property is the settings object
that contains all specific tags for the build.

It influences how the environment is built up. If
the tags are set, the environment tries to match
each loaded definition to the tags, dependent on
the [type](#properties-type) property.

It will use the preferred tags of the build in
descending order and fallback to later entries
if the most significant tag isn't matchable in
the current environment. The first tag is the
most significant one.

It is set via `settings.tags` in the [constructor](#constructor)
or set via [setTags](#methods-setTags).

```javascript
var environment = new lychee.Environment({
	build: 'example.Main',
	tags:  {
		platform: [ 'html-webgl', 'html' ]
	}
});

environment.init(function(sandbox) {

	var lychee     = sandbox.lychee;
	var definition = lychee.environment.definitions['example.Main'] || null;
	if (definition !== null) {
		definition.tags; // { platform: 'html-webgl' } or { platform: 'html' }
	}

});
```



= properties-timeout

```javascript
(Number) new lychee.Environment().timeout;
```

The `(Number) timeout` property is the timeout in milliseconds
until the active build stops.

It influences when the environment build stops.
If set to `0`, there is no timeout active until the active build stops.

It is set via `settings.timeout` in the [constructor](#constructor)
or set via [setTimeout](#methods-setTimeout).

```javascript
var start = Date.now();
var foo   = new lychee.Environment({
	build:   'app.Doesnotexit',
	timeout: 5000
});
var bar   = new lychee.Environment({
	build:   'app.Main',
	timeout: 5000
});

foo.timeout;           // 5000
foo.setTimeout(10000); // true
bar.timeout;           // 5000
bar.setTimeout(10000); // true

foo.init(function() {
	// This will never fire, because requirements are not met
});
bar.init(function() {
	console.log('Environment built in ' + (Date.now() - start) + 'ms');
});
```



= properties-type

```javascript
(String) new lychee.Environment().type;
```

The `(String) type` property is the type of the active build.

It influences how the environment build is created.
The default value is `source`.

If set to `source`, the environment loads all definitions
from `project/source` and matches them against the given
[tags](#properties-tags) property.

If set to `export`, the environment loads all definitions
from `project/source` and does not match them against the
given `tags`.

If set to `build`, the environment assumes all definitions
and requirements are included already. This type is used
to deserialize a serialized environment snapshot.


```javascript
var environment = new lychee.Environment({
	build: 'example.Foo',
	packages: [
		new lychee.Package('example', './lychee.pkg')
	]
});

environment.type;              // 'source'
environment.setType('export'); // true

environment.init(function(sandbox) {
	// This configuration assumes that a "./source/Foo.js" exists as example.Foo
});
```



= methods-deserialize

```javascript
(void) lychee.Environment.prototype.deserialize(blob);
```

- `(Object) blob` is an Object that is part of the Serialization Object.

This method is not intended for direct usage.
You can deserialize an object using the [lychee.deserialize](lychee#methods-deserialize) method.

```
var foo1 = new lychee.Environment({ id: 'example' });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Environment', arguments: [ { id: 'example' }]}
foo2; // lychee.Environment instance
```



= methods-serialize

```javascript
(Serialization Object) lychee.Environment.prototype.serialize(void);
```

- This method has no arguments

This method is not intended for direct usage.
You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.

```
var foo1 = new lychee.Environment({ id: 'example' });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Environment', arguments: [ { id: 'example' }]}
foo2; // lychee.Environment instance
```



= methods-load

```javascript
(Boolean) lychee.Environment.prototype.load(identifier);
```

- `(String) identifier` is the identifier of the definition including its namespace.

This method returns `true` on success and `false` on failure.
It will try to load the definition if both the package and
the definition is ready. After the definition is ready, it
is available in the [definitions](#properties-definitions)
property.

```javascript
var environment = new lychee.Environment({
	build:    'foo.Main',
	packages: [
		new lychee.Package('foo', './foo/lychee.pkg'),
		new lychee.Package('bar', './bar/lychee.pkg')
	]
});

environment.load('foo.Example'); // false, Package not ready
environment.load('bar.Example'); // false, Package not ready

setTimeout(function() {

	// Assuming Packages are both ready

	environment.load('foo.Example'); // true
	environment.load('bar.Example'); // true

}, 5000);
```



= methods-define

```javascript
(void) lychee.Environment.prototype.define(definition);
```

- `(lychee.Definition) definition` is the definition which needs to be dispatched to the environment.

This method is not intended for direct usage.
It is called by [lychee.define](lychee#methods-define) in
order to map all definitions to the active environment.

```javascript
var Example     = new lychee.Definition('foo.Example').exports(function() {
	return { foo: 'bar' };
});
var environment = new lychee.Environment({
	build: 'foo.Example'
});

environment.define(Example);

environment.init(function(sandbox) {

	var foo = sandbox.foo;
	if (foo.Example) {
		console.log(foo.Example);
	}

});
```



= methods-init

```javascript
(void) lychee.Environment.prototype.init(callback);
```

- `(Function) callback` is the callback that is fired once the environment [build](#properties-build) is completed.

This method returns nothing.
It initializes the build of the environment based on the given
settings.

The callback is called with the `sandbox` parameter which reflects
the [global](#properties-global) property of the environment.

```javascript
var environment = new lychee.Environment({
	id:    'example',
	build: 'example.Main',
	packages: [
		new lychee.Package('lychee',  '/lychee/lychee.pkg'),
		new lychee.Package('example', './lychee.pkg')
	]
});

environment.init(function(sandbox) {

	// All namespaces are attached to sandbox
	// It is not recommended to use the "with"
	// statement due to deoptimization issues

	var lychee  = sandbox.lychee;
	var example = sandbox.example;

	sandbox.MAIN = new example.Main({
		foo: 'bar'
	});

});
```



= methods-setBuild

```javascript
(Boolean) lychee.Environment.prototype.setBuild(build);
```

- `(String) build` is the identifier of a definition.

This method returns `true` on success and `false` on failure.
It will set the [build](#properties-build) property of the instance.

```javascript
var environment = new lychee.Environment({
	id: 'example'
});

environment.build;                    // 'app.Main', defaulted
environment.setBuild('example.Main'); // false, no such package available

environment.setPackages([
	new lychee.Package('example', './lychee.pkg'),
	new lychee.Package('other',   '../other/lychee.pkg')
]);

environment.setBuild('example.Main'); // true, if package contains such a definition

environment.init(function(sandbox) {
	// example.Main and its requirements are ready
});
```



= methods-setDebug

```javascript
(Boolean) lychee.Environment.prototype.setDebug(debug);
```

- `(Boolean) debug` is a flag. If set to `true`, the `console` prints additional debug messages.

This method returns `true` on success and `false` on failure.
It will set the [debug](#properties-debug) property of the instance.

It also reflects the property onto the [lychee.debug](lychee#properties-debug)
property to maintain concurrency.

```javascript
var environment = new lychee.Environment({
	id: 'example'
});

environment.debug;               // true
environment.global.lychee.debug; // true

environment.setDebug(false);     // true

environment.debug;               // false
environment.global.lychee.debug; // false
```



= methods-setDefinitions

```javascript
(Boolean) lychee.Environment.prototype.setDefinitions(definitions);
```

- `(Array) definitions` is an array of [lychee.Definitions](lychee.Definition).

This method returns `true` on success and `false` on failure.
It will try to inject definitions into the environment, which will be available
with their identifier as the key in the [definitions](#properties-definitions)
property.

```javascript
var Foo         = new lychee.Definition('example.Foo').requires([ 'example.Bar' ]);
var Bar         = new lychee.Definition('example.Bar');
var environment = new lychee.Environment({
	id:    'example',
	build: 'example.Foo'
});

environment.definitions;                  // {}
environment.setDefinitions([ Foo, Bar ]); // true
environment.definitions;                  // { 'example.Foo': lychee.Definition, 'example.Bar': lychee.Definition }
```



= methods-setId

```javascript
(Boolean) lychee.Environment.prototype.setId(id);
```

- `(String) id` is the unique identifier of the environment.

This method returns `true` on success and `false` on failure.
It will set the [id](#properties-id) property of the instance.

It is important that this identifier is unique across the peer cloud.

```javascript
var environment = new lychee.Environment({
	id: 'example'
});

environment.id;             // 'example'
environment.setId('blubb'); // true
environment.id;             // 'blubb'
```



= methods-setPackages

```javascript
(Boolean) lychee.Environment.prototype.setPackages(packages);
```

- `(Array) packages` is an array of [lychee.Packages](lychee.Package).

This method returns `true` on success and `false` on failure.
It will set the [packages](#properties-packages) property of the instance.

It is important that each package has a unique namespace (identifier) as
what it is included. Each package can refer its components internally under
a different namespace compared to as under what namespace they are available.

For example, you can include two projects that have internally all definitions
in the `app` namespace. If you want to do so, you can include one project as
`foo` and the other as `bar`, so now their `app.Main` is available as
`foo.Main` or `bar.Main`.

```javascript
// The packages themselves have both an 'app.Main' identifier
var foo = new lychee.Package('foo', '../projects/foo/lychee.pkg');
var bar = new lychee.Package('bar', '../projects/bar/lychee.pkg');

var environment = new lychee.Environment({
	id: 'example'
});

environment.setPackages([ foo, bar ]);

environment.setBuild('app.Main'); // false, Package not ready

environment.setBuild('foo.Main'); // true
environment.setBuild('bar.Main'); // true
```



= methods-setSandbox

```javascript
(Boolean) lychee.Environment.prototype.setSandbox(sandbox);
```

- `(Boolean) sandbox` is a flag. If set to `true`, the environment will create an isolated [global](#properties-global) property.

This method returns `true` on success and `false` on failure.
It will set the [sandbox](#properties-sandbox) property of the instance.

This method creates a new sandbox each time the method is called.

```javascript
var da_real_global = typeof global !== 'undefined' ? global : this;
var environment    = new lychee.Environment({
	id: 'example'
});

environment.sandbox;                   // true
environment.global === da_real_global; // false

environment.setSandbox(false);         // true
environment.sandbox;                   // false
environment.global === da_real_global; // true
```



= methods-setTags

```javascript
(Boolean) lychee.Environment.prototype.setTags(tags);
```

- `(Object) tags` is an object that contains all specific tags for the build.

This method returns `true` on success and `false` on failure.
It will set the [tags](#properties-tags) property of the instance.

```javascript
var environment = new lychee.Environment({
	build: 'example.Main',
	tags:  {
		platform: [ 'html-webgl', 'html' ]
	}
});

environment.init(function(sandbox) {

	var lychee     = sandbox.lychee;
	var definition = lychee.environment.definitions['example.Main'] || null;
	if (definition !== null) {
		definition.tags; // { platform: 'html-webgl' } or { platform: 'html' }
	}

});
```



= methods-setTimeout

```javascript
(Boolean) lychee.Environment.prototype.setTimeout(timeout);
```

- `(Number) timeout` is the timeout in milliseconds until the active build stops.

This method returns `true` on success and `false` on failure.
It will set the [timeout](#properties-timeout) property of the instance.

```javascript
var environment = new lychee.Environment({
	id: 'example'
});

environment.timeout;          // 10000
environment.setTimeout(5000); // true
environment.timeout;          // 5000
```



= methods-setType

```javascript
(Boolean) lychee.Environment.prototype.setType(type);
```

- `(String) type` is the type of the active build.

This method returns `true` on success and `false` on failure.
It will set the [type](#properties-type) property of the instance.

If `type` is set to `source`, the environment loads all definitions
from `project/source` and matches them against the given
[tags](#properties-tags) property.

If `type` is set to `export`, the environment loads all definitions
from `project/source` and does not match them against the given `tags`.

If `type` is set to `build`, the environment assumes all definitions
and requirements are included already. This type is used to deserialize
a serialized environment snapshot.

```javascript
var environment = new lychee.Environment({
	id: 'example'
});

environment.type;             // 'source'
environment.setType('build'); // true
environment.type;             // 'build'
```

