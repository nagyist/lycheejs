
={constructor}

```javascript-constructor
new lychee.event.Queue(void);
```

This constructor returns an instance of `lychee.event.Queue`.

```javascript
var queue = new lychee.event.Queue();

queue.then({ foo: 'bar' });
queue.then({ foo: 'qux' });
queue.then({ qux: 'bar' });

queue.bind('update', function(data, oncomplete) {

	if (data.qux === 'bar') {
		oncomplete(false);
	} else {
		oncomplete(true);
	}

}, this);

queue.bind('complete', function() {
	console.log('All Queue steps were successful!');
});

queue.bind('error', function() {
	console.log('A Queue step was unsuccessful!');
});

queue.init();
```



={methods-serialize}

```javascript-method
(Serialization Object) lychee.event.Queue.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage. You can serialize an
object using the [lychee.serialize()](lychee#methods-serialize) method.

```javascript
var foo1 = new lychee.event.Queue();
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.event.Queue', arguments: []}
foo2; // lychee.event.Queue instance
```



={methods-then}

```javascript-method
(Boolean) lychee.event.Queue.prototype.then(data);
```

- `(Object) data` is an object that is passed to the update event.

This method returns `true` on success and `false` on failure.
It will try to bind the data to the stack.

```javascript
var queue = new lychee.event.Queue();

queue.then({ step: 1 });    // true
queue.then({ step: 2 });    // true
queue.then({ step: 3 });    // true

queue.then('invalid data'); // false

queue.bind('complete', function() {
	console.log('All Queue steps were successful!');
});

queue.bind('error', function() {
	console.log('A Queue step was unsuccessful!');
});

queue.init();
```



={methods-init}

```javascript-method
(Boolean) lychee.event.Queue.prototype.init(void);
```

- This method has no arguments.

This method returns `true` on success and `false` on failure.
It will try to initialize the processing of the stack.

```javascript
var queue = new lychee.event.Queue();

queue.bind('complete', function() {
	console.log('The Queue was successful!');
});

queue.init();               // false
queue.then({ foo: 'bar' }); // true
queue.init();               // true
```

