
= constructor

```javascript
new lychee.Stash(settings);
```

- `settings` is an `Object`.

This constructor returns an instance of `lychee.Stash`.
The `settings` object consists of the following properties:

- `(String) id` will be passed to [setId](#methods-setId).
- `(Enum) type` will be passed to [setType](#methods-setType).

```javascript
var stash = new lychee.Stash({
	id:   'app-stash',
	type: lychee.Stash.TYPE.persistent
});
```

#### Implementation Notes

This implementation offers a temporary or persistent stash
that can be used for filesystem and asset modification
simulations.

The events are used to integrate instances with the network stack.
Note that events are not guaranteed, as the implementation is
non-blocking and using asynchronous i/o.



= enums-TYPE

```javascript
(Enum) lychee.Stash.TYPE;
```

The `(Enum) TYPE` enum consist of the following properties:

- `(Number) persistent` that reflects a persistent stash.
- `(Number) temporary` that reflects a temporary stash.

If a stash is persistent, all assets will be stored forever.
If a stash is temporary, all assets will be stored until the
current session ends.



= events-sync

```javascript
new lychee.Stash().bind('sync', function(assets) {}, scope);
```

The `sync` event is triggered on stash [write](#methods-write)
and [remove](#methods-remove) method calls.

- `(Object) assets` is an object consisting of `(String) id` and `(Asset) value`.

```javascript
var stash = new lychee.Stash();
var foo   = stash.read('./foo.json');

stash.bind('sync', function(assets) {
	console.log(assets);
});

foo;        // Config instance
foo.load(); // true

foo.buffer; // Parsed JSON

foo.buffer = {
	squad: 1337
};


stash.write('./foo.json', foo); // true
```



= properties-id

```javascript
(String) new lychee.Stash().id;
```

The `(String) id` property is the unique identifier
of the stash instance.

It influences the `sync` event and the `sync` method.

It is set via `settings.id` in the [constructor](#constructor)
or via [setId](#methods-setId).

```javascript
var stash = new lychee.Stash({
	id: 'awesome'
});

stash.id;                    // 'awesome'
stash.setId('more-awesome'); // true
stash.id;                    // 'more-awesome'
```



= properties-type

```javascript
(Number) new lychee.Stash().type;
```

The `(Number) type` property is the type
of the stash instance.

It influences how long created assets are stored.
Possible values are all values of the [TYPE](#enums-TYPE) enum.

It is set via `settings.type` in the [constructor](#constructor)
or via [setType](#methods-setType).

```javascript
var stash = new lychee.Stash({
	type: lychee.Stash.TYPE.persistent
});

stash.type;                                  // 0
stash.type === lychee.Stash.TYPE.persistent; // true

stash.setType(lychee.Stash.TYPE.temporary);  // true
stash.type;                                  // 1
stash.type === lychee.Stash.TYPE.temporary;  // true
```



= methods-sync

```javascript
(Boolean) lychee.Stash.prototype.sync(silent);
```

- `(Boolean) silent` is a flag. If set to `true`, the instance will not fire a `sync` event.

This method returns `true` on success and `false` on failure.



= methods-deserialize

```javascript
(void) lychee.Stash.prototype.deserialize(blob);
```

- `(Object) blob` is an Object that is part of the Serialization Object.

This method is not intended for direct usage.
You can deserialize an object using the [lychee.deserialize](lychee#methods-deserialize) method.

```javascript
var foo1 = new lychee.Stash({ id: 'foo' });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Stash', arguments: [{ id: 'foo' }]}
foo2; // lychee.Stash instance
```



= methods-serialize

```javascript
(Serialization Object) lychee.Stash.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage.
You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = new lychee.Stash({ id: 'foo' });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Stash', arguments: [{ id: 'foo' }]}
foo2; // lychee.Stash instance
```



= methods-read

```javascript
(null || Asset instance) lychee.Stash.prototype.read(id);
```

- `(String) id` is the relative path to the asset that is compatible with [lychee.Asset](lychee.Asset).

This method returns an `Asset instance` on success and on failure.
It returns the `Asset instance` that matches the specified criteria.

```javascript
var stash = new lychee.Stash();
var foo   = stash.read('./foo.json');

foo;        // Config instance
foo.load(); // true

foo.buffer; // Parsed JSON

foo.buffer = {
	squad: 1337
};


stash.write('./foo.json', foo);   // true
stash.read('./foo.json') === foo; // true
```



= methods-remove

```javascript
(Boolean) lychee.Stash.prototype.remove(id);
```

- `(String) id` is the unique identifier of the asset that was previously stored via [write](#methods-write) method call.

This method returns `true` on success and `false` on failure.
It removes the `object` from the stash.

Note that a stash instance can get out of sync if you prevent
the `sync` event chain that is integrated with the network stack.

```javascript
var stash = new lychee.Stash();
var foo   = stash.read('./foo.json');

stash.write('./foo.json', foo);   // true
stash.read('./foo.json') === foo; // true

stash.remove('./foo.json');       // true
stash.read('./foo.json') === foo; // false, new Asset instance
```



= methods-write

```javascript
(Boolean) lychee.Stash.prototype.write(id, asset);
```

- `(String) id` is the unique identifier of the asset.
- `(Asset instance) asset` is the asset that was previously created via [read](#methods-read) method call.

This method returns `true` on success and `false` on failure.
It writes the `asset` into the stash.

Note that a stash instance can get out of sync if you prevent
the `sync` event chain that is integrated with the network stack.

```javascript
var stash = new lychee.Stash();
var foo   = stash.read('./foo.json');

stash.write('./foo.json', foo);   // true
stash.read('./foo.json') === foo; // true

stash.remove('./foo.json');       // true


var bar = stash.read('./foo.json');

foo === bar;                      // false, new Asset instance
stash.write('./foo.json', qux);   // true
```



= methods-setId

```javascript
(Boolean) lychee.Stash.prototype.setId(id);
```

- `(String) id` is a unique identifier used for the instance.

This method returns `true` on success and `false` on failure.

The unique identifier is used for synchronization purposes,
so the stash can be used among different sessions in the
same environment.

```javascript
var stash = new lychee.Stash();

stash.id;               // 'lychee-Stash-0'
stash.setId('awesome'); // true
stash.id;               // 'awesome'
```



= methods-setType

```javascript
(Boolean) lychee.Stash.prototype.setType(type);
```

- `(Number) type` is an `enum of [lychee.Stash.TYPE](#enums-TYPE)`. It is defaulted with lychee.Stash.TYPE.persistent.

This method returns `true` on success and `false` on failure.

```javascript
var stash = new lychee.Stash();

stash.type;                                 // 0
stash.setType(lychee.Stash.TYPE.temporary); // true
stash.type;                                 // 1
stash.type === lychee.Stash.TYPE.temporary; // true
```
 
