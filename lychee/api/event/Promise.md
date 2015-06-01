
={constructor}

```javascript-constructor
new lychee.event.Promise(void);
```

This constructor returns an instance of `lychee.event.Promise`.

```javascript
var promise = new lychee.event.Promise();

promise.then({
	step: 0
}, function(oncomplete) {
	data.step++;
	oncomplete(data); // This is a successful execution
});

promise.then(null, function(oncomplete) {
	data.step++;
	oncomplete(false); // This is an unsuccessful execution
});

promise.bind('complete', function() {
	console.log('All Promise steps were successful!');
});

promise.bind('error', function() {
	console.log('A Promise step was unsuccessful!');
});

promise.init();
```



={methods-serialize}

```javascript-method
(Serialization Object) lychee.event.Promise.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage. You can serialize an
object using the [lychee.serialize()](lychee#methods-serialize) method.

```javascript
var foo1 = new lychee.event.Promise();
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.event.Promise', arguments: []}
foo2; // lychee.event.Promise instance
```



={methods-then}

```javascript-method
(Boolean) lychee.event.Promise.prototype.then(data, callback [, scope]);
```

- `(Object || null) data` is an object that is passed as the first argument to the callback.
- `(Function) callback` is the callback that is executed when the stack is processed.
- `(Object) scope` is the scope of the callback.

This method returns `true` on success and `false` on failure.
It will try to bind the callback to the stack.

If the `data` parameter is `null` and the `oncomplete(result)` from
the previous step is an `Object`, the `result` parameter will be the
first argument of the followingly executed callback.

```javascript
var promise = new lychee.event.Promise();

promise.then({
	step: 0
}, function(data, oncomplete) {

	data.step++;
	oncomplete(data);

}); // true

promise.then(null, function(data, result) {

	data.step++; // data is the previous oncomplete() argument
	result(data);

}); // true

promise.then('invalid parameters'); // false

promise.bind('complete', function() {
	console.log('All Promise steps were successful!');
});

promise.bind('error', function() {
	console.log('A Promise step was unsuccessful!');
});

promise.init();
```



={methods-init}

```javascript-method
(Boolean) lychee.event.Promise.prototype.init(void);
```

- This method has no arguments.

This method returns `true` on success and `false` on failure.
It will try to initialize the processing of the stack.

```javascript
var promise = new lychee.event.Promise();

promise.bind('complete', function() {
	console.log('promise was successful!');
});

promise.init();                                                // false
promise.then(null, function(data, result) { result(true);  }); // true
promise.init();                                                // true
```

