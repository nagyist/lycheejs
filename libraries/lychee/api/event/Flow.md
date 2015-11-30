
= constructor

```javascript
new lychee.event.Flow(void);
```

This constructor returns an instance of `lychee.event.Flow`.

```javascript
var flow = new lychee.event.Flow();


flow.then('first');
flow.then('second', [ 'foo', { bar: 'qux' }]);


// default behaviour
flow.bind('first', function(oncomplete) {
	oncomplete(true);
});

// data behaviour
flow.bind('second', function(a, b, oncomplete) {
	a === 'foo';     // true
	b.bar === 'qux'; // true
	oncomplete(true);
});


flow.bind('complete', function() {
	console.log('Flow stack has been processed!');
});

flow.bind('error', function(event) {
	console.log('Flow event "' + event + '" failed!');
});


flow.init();
```



= methods-serialize

```javascript
(Serialization Object) lychee.event.Flow.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage.
You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = new lychee.event.Flow();
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.event.Flow', arguments: []}
foo2; // lychee.event.Flow instance
```



= methods-then

```javascript
(Boolean) lychee.event.Flow.prototype.then(event [, data]);
```

- `(String) event` is the event name that is triggered when the stack is processed.
- `(Array || null) data` is an array that is passed as the first arguments to the callback.

This method returns `true` on success and `false` on failure.
It will try to bind the callback to the stack.

If the `data` parameter is not `null` the `callback` gets its contents as the first
parameters, the last argument is always the `oncomplete` callback.

```javascript
var flow = new lychee.event.Flow();


flow.then('first');
flow.then('second', [ 'foo', 'bar' ]);
flow.then('third');


flow.bind('first', function(oncomplete) {
	oncomplete(true);
});

flow.bind('second', function(foo, bar, oncomplete) {
	oncomplete(true);
});

flow.bind('third', function(oncomplete) {
	oncomplete(true);
});


flow.bind('complete', function() {
	console.log('Flow stack has been processed!');
});

flow.bind('error', function(event) {
	console.log('Flow event "' + event + '" failed!');
});


flow.init();
```



= methods-init

```javascript
(Boolean) lychee.event.Flow.prototype.init(void);
```

- This method has no arguments.

This method returns `true` on success and `false` on failure.
It will try to initialize the processing of the stack.

```javascript
var flow = new lychee.event.Flow();

flow.bind('complete', function() {
	console.log('Flow stack has been processed!');
});

flow.init();        // false
flow.then('first'); // true
flow.init();        // true
```

