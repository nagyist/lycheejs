
= constructor

```javascript
lychee.Debugger;
```

This implementation is a Module and has no constructor.

```javascript
console.log(lychee.Debugger); // lychee.Debugger
```

#### Implementation Notes

The Debugger offers an integration with a server-side
[lychee.net.Service](lychee.net.Service) with
the identifier `debugger`.



= methods-expose

```javascript
(Object || null) lychee.Debugger.expose(environment);
```

- `(lychee.Environment) environment` is an instance of `lychee.Environment`.

This method determines the difference from the `global` scopes between
the given environment and the default environment.

It can be used to determine differences in runtime memory that are caused
by feature detection algorithms or memory leaks.

```javascript
var env = new lychee.Environment({
	// ... more settings required
});

env.init(function() {

	var diff = lychee.Debugger.expose(env);
	if (diff !== null) {
		console.log('Environment is different!', env);
	}

});
```



= methods-report

```javascript
(Boolean) lychee.Debugger.report(environment, error [, definition]);
```

- `(lychee.Environment) environment` is an instance of `lychee.Environment`.
- `(Error) error` is an instance of `Error`.
- `(lychee.Definition) definition` is the optional instance of `lychee.Definition` that threw the error.

- `(Function) callback` is a Function that returns the Definition. Allowed return types are Callback, Class and Module

This method returns `true` on success and `false` on failure.
It will report the serialized environment and the error to the `Harvester`.

```javascript
var Bar = new lychee.Definition('foo.Bar').exports(function(lychee, foo, global, attachments) {

	var Class = function() {};

	Class.prototype = {
		throwError: function() {
			throw new Error("Me want cookies!");
		}
	};

	return Class;

});

var env = new lychee.Environment({
	build: 'foo.Bar'
});

env.define(Bar);

env.init(function(sandbox) {

	var foo = sandbox.foo;
	var bar = new foo.Bar();

	try {
		bar.throwError();
	} catch(e) {
		lychee.Debugger.report(env, e, env.definitions['foo.Bar']);
	}

});
```

