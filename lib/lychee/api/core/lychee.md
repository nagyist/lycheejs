
= constructor

```javascript
lychee;
```

This implementation is a Module and has no constructor.

```javascript
console.log(lychee); // lychee core
```

#### Implementation Notes

The lychee core offers many functionalities that are
necessary across the whole Stack. These functions are
independent of platform-specific variants and
therefore are identical across all platforms.



= properties-debug

```javascript
(Boolean) lychee.debug;
```

The `(Boolean) debug` property is the flag that
determines if the current environment is being
debugged.

If set to `true`, it influences event
serialization and logging additional debug data
to the console.

```javascript
var env = new lychee.Environment({
	debug: true
});

lychee.init(function(sandbox) {

	var lychee = sandbox.lychee;

	if (lychee.debug === true) {
		console.log('additional debug data');
	}

});
```



= properties-environment

```javascript
(lychee.Environment) lychee.environment;
```

The `(lychee.Environment) environment` property
has a back-reference to the currently active
environment.

The active environment is important for the
loading process of new Definitions and dependencies.

You can manually switch the environment and
isolate the loading process into it by calling
the [setEnvironment](#methods-setEnvironment)
method.

```javascript
var foo = new lychee.Environment({ id: 'foo' });
var bar = new lychee.Environment({ id: 'bar' });

lychee.setEnvironment(foo);
lychee.init(function(sandbox) {

	console.log(sandbox.lychee.environment.id); // foo

	lychee.setEnvironment(bar);
	lychee.init(function(sandbox) {
	
		// sandbox is now the sandbox of the isolated environment
		console.log(sandbox.lychee.environment.id);

	});

});
```



= properties-ENVIRONMENTS

```javascript
(Object) lychee.ENVIRONMENTS;
```

The `(Object) ENVIRONMENTS` property is a cache
that contains all previously loaded isolated
environments that were built for library usage.

The key is the unique identifier of the environment,
for example `boilerplate/html/main` or
`sorbet/html/core`.



= properties-VERSION

```javascript
(String) lychee.VERSION;
```

The `(String) VERSION` property is representing the
lycheeJS version. The lycheeJS version is built using
the year and quartal of the release, for example
`2015-Q4` or `2016-Q1`.



= methods-diff

```javascript
(Boolean) lychee.diff(aobject, bobject);
```

- `(Object) aobject` is an Object.
- `(Object) bobject` is an Object.

This method returns `true` if the objects are different and `false` if they are identical.

```javascript
var foo = { foo: 'bar' };
var bar = { foo: 'bar' };
var qux = { foo: 'foo' };

console.log(lychee.diff(foo, bar)); // false
console.log(lychee.diff(foo, qux)); // true
console.log(lychee.diff(bar, qux)); // true
console.log(lychee.diff(bar, foo)); // false
```



= methods-enumof

```javascript
(Boolean) lychee.enumof(template, value);
```

- `(Enum) template` is an object consisting of `(String) key` and `(Number) value`.
- `(Number) value` is representing the Enum data to verify.

```
var MY_ENUM = {
	'foo': 0,
	'bar': 1
};

console.log(lychee.enumof(MY_ENUM, MY_ENUM.foo)); // true
console.log(lychee.enumof(MY_ENUM, MY_ENUM.bar)); // true
console.log(lychee.enumof(MY_ENUM, 1337));        // false
```



= methods-extend

```javascript
(Object) lychee.extend(target [, object1, object2, ...]);
```

- `(Object) target` is the target object that will be extended with the properties of the other objects.

This method will extend the target object and iterate
over additional arguments in order to extend the
target object with their properties.

```javascript
var foo = { bar: 'qux' };
var bar = { qux: 'doo' };

var qux = lychee.extend({}, foo, bar);
console.log(qux); // { bar: 'qux', qux: 'doo' }

var doo = lychee.extend(foo, bar);
console.log(doo === foo); // true
console.log(foo); // { bar: 'qux', qux: 'doo' }
```



= methods-extendsafe

```javascript
(Object) lychee.extendsafe(target [, object1, object2, ...]);
```

- `(Object) target` is the target object that will be extended with the properties of the other objects.

This method will extend the target object and iterate
over additional arguments in order to extend the
target object with their properties.

The behavioural difference to [extend](#methods-extend)
is that this method only extends the target with the
properties if they are from the same type as the
target. So the target acts as a typed template.

```javascript
var foo = { bar: 'qux' };
var bar = { qux: 13.37 };
var tpl = { bar: 'str', qux: 1337  }

var qux = lychee.extendsafe({}, foo, bar);
console.log(qux); // {}

var doo = lychee.extendsafe(foo, bar);
console.log(doo === foo); // true
console.log(foo); // {}

var blu = lychee.extendsafe(tpl, foo, bar);
console.log(blu); // { bar: 'qux', qux: 13.37 }
```



= methods-extendunlink

```javascript
(Object) lychee.extendunlink(target [, object1, object2, ...]);
```

- `(Object) target` is the target object that will be extended with the properties of the other objects.

This method will extend the target object and iterate
over additional arguments in order to extend the
target object with their properties.

The behavioural difference to [extend](#methods-extend)
is that this method only extends the target with the
properties if they are from the same type as the
target. So the target acts as a typed template.

```javascript
var foo = { bar: 'qux' };
var bar = { qux: 13.37 };
var tpl = { bar: 'str', qux: 1337  }

var qux = lychee.extendsafe({}, foo, bar);
console.log(qux); // {}

var doo = lychee.extendsafe(foo, bar);
console.log(doo === foo); // true
console.log(foo); // {}

var blu = lychee.extendsafe(tpl, foo, bar);
console.log(blu); // { bar: 'qux', qux: 13.37 }
```



= methods-interfaceof

```javascript
(Boolean) lychee.interfaceof(template, instance);
```

- `(Class || Module) template` is the interface the instance is be validated against.
- `(Object) instance` is the instance that is validated.

This method returns `true` on success and `false` on failure.
It will match the API of the instance against the template.
It will check properties, enums and method names.

```javascript
var Foo = lychee.app.Entity;
var Bar = function() {};
Bar.prototype = { method: function() {} };

var qux = new Foo();
var doo = new Bar();

lychee.interfaceof(Foo, qux); // true
lychee.interfaceof(Foo, doo); // false
lychee.interfaceof(Bar, qux); // false
lychee.interfaceof(Bar, doo); // true
```



= methods-deserialize

```javascript
(Object || null) lychee.deserialize(data);
```

- `(Serialization Object) data` is the serialized
data of an instance that was created by a previous
[serialize](#methods-serialize) method call.

This method returns a `Serialization Object` on success and `null` on failure.
It will try to serialize the given definition.

```javascript
var data = lychee.serialize(new lychee.Input());

var instance = lychee.deserialize(data);
if (instance instanceof lychee.Input) {
	console.log('Success!', instance);
} else {
	console.log('Failure!', instance);
}
```
 


= methods-serialize

```javascript
(Serialization Object || null) lychee.serialize(definition);
```

- `(Object) definition` is the instance that is serialized.

This method returns a `Serialization Object` on success and `null` on failure.
It will try to serialize the given definition.

```javascript
var instance = new lychee.Input();

var data = instance.serialize();
if (data !== null) {
	console.log('Success!', data);
} else {
	console.log('Failure!', data);
}
```



= methods-define

```javascript
(lychee.Definition) lychee.define(identifier);
```

- `(String) identifier` is the unique identifier for the lychee.Definition.

This method returns a `lychee.Definition` instance.
It will currify the [exports](lychee.Definition#methods-exports)
method in order to define the definition in the
currently active [lychee.environment](#properties-environment).



= methods-init

```javascript
(void) lychee.init(callback);
```

- `(Function) callback` is the callback that is executed once the active [lychee.environment](#properties-environment) is initialized successfully.

This method returns nothing.
It will initialize the active [lychee.Environment](lychee.Environment)
instance which is reflected by the [lychee.environment](#properties-environment)
property.

```javascript
var env = new lychee.Environment({ /* ... */ });

lychee.setEnvironment(env);              // true
console.log(lychee.environment === env); // true

lychee.init(function(sandbox) {

	var lychee = sandbox.lychee;
	var app    = sandbox.app;

	// App Initialization Code

});
```



= methods-inject

```javascript
(Boolean) lychee.inject(environment);
```

- `(lychee.Environment) environment` is a [lychee.Environment](lychee.Environment) instance. If set to `null`, the original environment will be used.

This method returns `true` on success and `false` on failure.
It will inject the given environment into the active environment
and dispatch its [definitions](lychee.Environment#properties-definitions)
property.

```javascript
// This is the API for serialized environment snapshots in sandboxed builds
lychee.ENVIRONMENTS['lychee'] = new lychee.Environment({ /* ... */ });


var env = new lychee.Environment({ /* ... */ });

lychee.setEnvironment(env);                       // true
console.log(lychee.environment === env);          // true

lychee.inject(lychee.ENVIRONMENTS['lychee']);     // true, if preloaded
```



= methods-setEnvironment

```javascript
(Boolean) lychee.setEnvironment(environment);
```

- `(lychee.Environment) environment` is a [lychee.Environment](lychee.Environment) instance. If set to `null`, the original environment will be used.

This method returns `true` on success and `false` on failure.
It will set the active environment and dispatch its
[debug](lychee.Environment#properties-debug) property.

```javascript
var env = new lychee.Environment({ /* ... */ });

lychee.setEnvironment(env);                       // true
console.log(lychee.environment === env);          // true
lychee.setEnvironment({ not: 'an environment' }); // false
console.log(lychee.environment === env);          // false
```

