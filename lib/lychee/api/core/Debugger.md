
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

For easier integration with the Sorbet Stack, you
can simply include the `sorbet/build/<platform>/core.js`
file and the Debugger will automatically report
errors and bugs to the server.



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

- `(Function) callback` is a Function that returns the Definition. Allowed return types are Callback, Class and Module

This method returns `true` on success and `false` on failure.

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
		lychee.Debugger.report(env, e, foo.Bar);
	}

});
```

