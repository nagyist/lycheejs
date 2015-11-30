
= constructor

```javascript
new lychee.event.Emitter(void);
```

This constructor returns an instance of `lychee.event.Emitter`.

```javascript
var emitter = new lychee.event.Emitter();

emitter.bind('foo', function(foo, bar, qux) {

	console.log('foo event was triggered!');

	foo === 'Foo'; // true
	bar === 'Bar'; // true
	qux === 'Qux'; // true

}, this);

emitter.bind('#foo', function(self, foo, bar, qux) {

	console.log('foo event was triggered!');

	self === this;    // false
	self === emitter; // true

}, this);

emitter.bind('@foo', function(event, self, foo, bar, qux) {

	console.log('foo event was triggered!');

	event;            // 'foo'
	self === this;    // false
	self === emitter; // true

}, this);

emitter.trigger('foo', [ 'Foo', 'Bar', 'Qux' ]); // true
emitter.trigger('#foo');                         // false
emitter.trigger('@foo');                         // false
```



= methods-deserialize

```javascript
(void) lychee.event.Emitter.prototype.deserialize(blob);
```

- `(Object) blob` is an Object that is part of the Serialization Object.

This method returns nothing.
It is not intended for direct usage.
You can deserialize an object using the [lychee.deserialize](lychee#methods-deserialize) method.

```javascript
var foo1 = new lychee.event.Emitter();
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.event.Emitter', arguments: []}
foo2; // lychee.event.Emitter instance
```



= methods-serialize

```javascript
(Serialization Object) lychee.event.Emitter.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage.
You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = new lychee.event.Emitter();
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.event.Emitter', arguments: []}
foo2; // lychee.event.Emitter instance
```



= methods-bind

```javascript
(Boolean) lychee.event.Emitter.prototype.bind(event, callback [, scope, once]);
```

- `(String) event` is the event name.
- `(Function) callback` is the callback that is executed when the event is triggered.
- `(Object) scope` is the scope of the callback.
- `(Boolean) once` is a flag. If set to `true`, the callback will be executed once and then removed via [unbind](#methods-unbind) method.

This method returns `true` on success and `false` on failure.
It will try to bind the callback to an event name and parse the modifier of the
event name beforehand.

Supported event name modifiers are:

- `@` will pass the `event name` and `self` parameters to the callback.
- `#` will pass the `self` parameter to the callback.

```javascript
var emitter = new lychee.event.Emitter();

emitter.bind('foo',  function(a, b, c) {}, this);              // true
emitter.bind('foo',  function(a, b, c) {}, this, true);        // true,  triggered only once
emitter.bind(null,   function(a, b, c) {}, this);              // false, invalid event

emitter.bind('@foo', function(event, self, a, b, c) {}, this); // true
emitter.bind('#foo', function(self, a, b, c) {}, this);        // true
```



= methods-relay

```javascript
(Boolean) lychee.event.Emitter.prototype.relay(event, instance [, once]);
```

- `(String) event` is the event name.
- `(Emitter) instance` is an instance of `lychee.event.Emitter`.
- `(Boolean) once` is a flag. If set to `true`, the callback will be executed once

This method returns `true` on success and `false` on failure.
It will try to relay an event to another emitter and parse the modifier of the
event name beforehand.

Supported event name modifiers are:

- `@` will pass the `event name` and `self` parameters to the callback.
- `#` will pass the `self` parameter to the callback.

```javascript
var source = new lychee.event.Emitter();
var target = new lychee.event.Emitter();

source.relay('foo', target, true);
source.relay('bar', target);

source.trigger('foo'); // true
source.trigger('foo'); // false, only bound once

source.trigger('bar'); // true
source.trigger('bar'); // true
```


= methods-trigger

```javascript
(Boolean) lychee.event.Emitter.prototype.trigger(event [, data]);
```

- `(String) event` is the event name.
- `(Array) data` is an array of parameters that will be passed to the bound callbacks.

This method returns `true` on success and `false` on failure.
It will try to find and execute callbacks that are bound to the given event name.

```javascript
var emitter = new lychee.event.Emitter();

emitter.bind('foo', function() {}, this);

emitter.trigger('foo');     // true
emitter.trigger('foo', []); // true
emitter.trigger('bar', []); // false
```



= methods-unbind

```javascript
(Boolean) lychee.event.Emitter.prototype.unbind(event [, callback, scope]);
```

- `(String) event` is the event name.
- `(Function) callback` is the callback that is executed when the event is triggered.
- `(Object) scope` is the scope of the callback.

This method returns `true` on success and `false` on failure.
It will try to unbind the callback of an event name.
It unbinds all callbacks that match the specified criteria.

```javascript
// keep references for later
var emitter   = new lychee.event.Emitter();
var _callback = function() {};
var _scope    = this;

// unbind a single callback
emitter.bind('foo', _callback, _scope);
emitter.unbind('foo', _callback, _scope); // true

// unbind multiple callbacks at once
emitter.bind('foo', _callback, _scope);
emitter.bind('foo', _callback, emitter);
emitter.unbind('foo', _callback); // true
emitter.unbind('foo', _callback); // false

// unbind all callbacks and all scopes at once
emitter.bind('foo', function() {}, this);
emitter.bind('foo', _callback,     _scope);
emitter.bind('foo', _callback,     emitter);

emitter.unbind('foo'); // true
emitter.unbind('foo'); // false
```

