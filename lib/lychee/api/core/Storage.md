
= constructor

```javascript
new lychee.Storage(settings);
```

- `settings` is an `Object`.

This constructor returns an instance of `lychee.Storage`.
The `settings` object consists of the following properties:

- `(String) id` will be passed to [setId](#methods-setId).
- `(Object) model` will be passed to [setModel](#methods-setModel).
- `(Enum) type` will be passed to [setType](#methods-setType).

```javascript
var model = {
	name:  'robot',
	squad: 'Artificial-Engineering',
	score: 1337
};

var storage = new lychee.Storage({
	id:    'app-trainingdata',
	model: model,
	type:  lychee.Storage.TYPE.persistent
});
```

#### Implementation Notes

This implementation uses a view-based concept, which means
each instance is a projected view based on its identifier.

The events are used to integrate instances with the network stack.
Note that events are not guaranteed, as the implementation is
non-blocking and using asynchronous i/o.



= enums-TYPE

```javascript
(Enum) lychee.Storage.TYPE;
```

The `(Enum) TYPE` enum consist of the following properties:

- `(Number) persistent` that reflects a persistent storage.
- `(Number) temporary` that reflects a temporary storage.

If a storage is persistent, all objects will be stored forever.
If a storage is temporary, all objects will be stored until the
current session ends.



= events-insert

```javascript
new lychee.Storage().bind('insert', function(index, object) {}, scope);
```

The `insert` event is triggered on storage [insert](#methods-insert) method calls.

- `(Number) index` is the index of the inserted object.
- `(Model instance) object` is the inserted object.

```javascript
var storage = new lychee.Storage({ model: { foo: 0 }});

var obj1 = storage.create();
var obj2 = storage.create();

storage.bind('insert', function(index, object) {
	console.log(index, object);
});

obj1.foo = 1;
obj2.foo = 2;

storage.insert(obj1); // triggers event
storage.insert(obj2); // triggers event
```



= events-update

```javascript
new lychee.Storage().bind('update', function(index, object) {}, scope);
```
The `update` event is triggered on storage [update](#methods-update) method calls.

- `(Number) index` is the index of the updated object.
- `(Model instance) object` is the updated object.

```javascript
var storage = new lychee.Storage({ model: { foo: 0 }});

var obj1 = storage.create();
var obj2 = storage.create();

storage.bind('update', function(index, object) {
	console.log(index, object);
});

obj1.foo = 1;
obj2.foo = 2;

storage.insert(obj1);
storage.insert(obj2);
storage.update(obj1); // triggers event
storage.update(obj2); // triggers event
```



= events-remove

```javascript
new lychee.Storage().bind('remove', function(index, object) {}, scope);
```

The `remove` event is triggered on storage [remove](#methods-remove) method calls.

- `(Number) index` is the index of the removed object.
- `(Model instance) object` is the removed object.

```javascript
var storage = new lychee.Storage({ model: { foo: 0 }});

var obj1 = storage.create();
var obj2 = storage.create();

storage.bind('remove', function(index, object) {
	console.log(index, object);
});

obj1.foo = 1;
obj2.foo = 2;

storage.insert(obj1);
storage.insert(obj2);

storage.remove(obj1); // triggers event
storage.remove(obj2); // triggers event
```



= events-sync

```javascript
new lychee.Storage().bind('sync', function(objects) {}, scope);
```

The `sync` event is triggered on storage [insert](#methods-insert),
[update](#methods-update) and [remove](#methods-remove) method calls.

- `(Array) objects` is an array of modified objects.

```javascript
var storage = new lychee.Storage({ model: { foo: 0 }});

var obj1 = storage.create();
var obj2 = storage.create();

storage.bind('sync', function(objects) {
	console.log(objects.length, objects);
});

storage.insert(obj1); // triggers event
storage.insert(obj2); // triggers event

obj1.foo = 1;
obj2.foo = 2;

storage.update(obj1); // triggers event
storage.update(obj2); // triggers event

storage.remove(obj1); // triggers event
storage.remove(obj2); // triggers event
```



= properties-id

```javascript
(String) new lychee.Storage().id;
```

The `(String) id` property is the unique identifier
of the storage instance.

It influences the `sync` event and the `sync` method.

It is set via `settings.id` in the [constructor](#constructor)
or via [setId](#methods-setId).

```javascript
var storage = new lychee.Storage({
	id: 'awesome'
});

storage.id;                    // 'awesome'
storage.setId('more-awesome'); // true
storage.id;                    // 'more-awesome'
```



= properties-model

```javascript
(Object) new lychee.Storage().model;
```

The `(Object) model` property is the object model
of the storage instance.

It influences how the [create](#methods-create),
[insert](#methods-insert) and [update](#methods-update)
methods validate objects of the storage instance.

It is set via `settings.model` in the [constructor](#constructor)
or via [setModel](#methods-setModel).

```javascript
var storage = new lychee.Storage();

storage.model;                    // {}
storage.setModel({ foo: 'bar' }); // true
storage.model;                    // { foo: 'bar' }

var object = storage.create();

object;                     // { foo: 'bar' }
object === storage.model;   // false
object.foo === storage.foo; // true
```



= properties-type

```javascript
(Number) new lychee.Storage().type;
```

The `(Number) type` property is the type
of the storage instance.

It influences how long created objects are stored.
Possible values are all values of the [TYPE](#enums-TYPE) enum.

It is set via `settings.type` in the [constructor](#constructor)
or via [setType](#methods-setType).

```javascript
var storage = new lychee.Storage({
	type: lychee.Storage.TYPE.persistent
});

storage.type;                                    // 0
storage.type === lychee.Storage.TYPE.persistent; // true

storage.setType(lychee.Storage.TYPE.temporary);  // true
storage.type;                                    // 1
storage.type === lychee.Storage.TYPE.temporary;  // true
```



= methods-deserialize

```javascript
(void) lychee.Storage.prototype.deserialize(blob);
```

- `(Object) blob` is an Object that is part of the Serialization Object.

This method is not intended for direct usage.
You can deserialize an object using the [lychee.deserialize](lychee#methods-deserialize) method.

```javascript
var foo1 = new lychee.Storage({ id: 'foo' });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Storage', arguments: [{ id: 'foo' }]}
foo2; // lychee.Storage instance
```



= methods-serialize

```javascript
(Serialization Object) lychee.Storage.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage.
You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = new lychee.Storage({ id: 'foo' });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Storage', arguments: [{ id: 'foo' }]}
foo2; // lychee.Storage instance
```



= methods-create

```javascript
(Model instance) lychee.Storage.prototype.create(void);
```

This method returns a `Model` instance.
It creates a unique `Object instance` that is created from
the `Model` template previously set via [setModel](#methods-setModel).

The `Model instance` can be integrated with the instance
by using [insert](#methods-insert).

```javascript
var storage = new lychee.Storage();

storage.model;                    // {} (empty object)
storage.setModel({ foo: 'bar' }); // true

var object = storage.create();    // { foo: 'bar' }

storage.model;                    // { foo: 'bar' }
storage.model === object;         // false

storage.insert(object);           // true
storage.insert(object);           // false, already in storage
```



= methods-filter

```javascript
(Array) lychee.Storage.prototype.filter(callback [, scope]);
```

- `(Function) callback` is the callback that is executed to filter the objects. If set to a `Function`, it will filter the returned array. If the callback returns `true` for an `object`, it is pushed to the returned array.
- `(Object) scope` is the scope of the callback.

This method returns an `(Array) objects` of filtered objects.

```javascript
var storage = new lychee.Storage();

storage.setModel({ foo: 'bar' });

var obj1 = storage.create();
var obj2 = storage.create();
var obj3 = storage.create();

obj1.foo = 'foo';
obj2.foo = 'baz';
obj3.foo = 'qux';

storage.insert(obj1); // true
storage.insert(obj2); // true
storage.insert(obj3); // true

var filtered = storage.filter(function(object, index) {

	if (object.foo !== 'foo') {
	   return true;
	} else {
		return false;
	}

}, this);

filtered.length;        // 2
filtered.indexOf(obj1); // false
filtered.indexOf(obj2); // true
filtered.indexOf(obj3); // true
```



= methods-insert

```javascript
(Boolean) lychee.Storage.prototype.insert(object);
```

- `(Model instance) object` is the object that was previously created via [create](#methods-create) method call.

This method returns `true` on success and `false` on failure.
It inserts the `object` into the storage.
It will trigger an [insert](#events-insert) event on success.

```javascript
var storage = new lychee.Storage();

storage.filter().length; // 0

var obj = storage.create();
storage.insert(obj);     // true
storage.insert(obj);     // false, already in storage

storage.filter().length; // 1
```



= methods-update

```javascript
(Boolean) lychee.Storage.prototype.update(object);
```

- `(Model instance) object` is the object that was previously created via [create](#methods-create) method call.

This method returns `true` on success and `false` on failure.
It updates the `object` into the storage.
It will trigger an [update](#events-update) event on success.

Note that a storage instance can get out of sync if you prevent
the `update` or `sync` event chain that is integrated with the
network stack.

```javascript
var storage = new lychee.Storage({
	model: { foo: 0 }
});


var obj = storage.create();

storage.insert(obj); // true
obj.foo++;           // 1

storage.update(obj); // true
```
 


= methods-get

```javascript
(null || Model instance) lychee.Storage.prototype.get(index);
```

- `(Number) index` is the index of the object that was previously stored via [insert](#methods-insert) method call.

This method returns a `Model instance` on success and `null` on failure.
It returns the `Model instance` that matches the specified criteria.

```javascript
var storage = new lychee.Storage({
	model: { foo: 'bar' }
});


var obj1 = storage.create();
var obj2 = storage.create();

storage.insert(obj1);
storage.insert(obj2);

storage.get(0) === obj1; // true
storage.get(1) === obj2; // true
storage.get(2) === null; // true
```



= methods-remove

```javascript
(Boolean) lychee.Storage.prototype.remove(index [, object ]);
```

- `(Number) index` is the index of the object that was previously stored via [insert](#methods-insert) method call.
- `(Model instance) object` is the object that was previously stored via [insert](#methods-insert) method call.

This method returns `true` on success and `false` on failure.
It removes the `object` from the storage.
It will trigger a [remove](#events-remove) event on success.

Note that a storage instance can get out of sync if you prevent
the `remove` or `sync` event chain that is integrated with the
network stack.

```javascript
var storage = new lychee.Storage({
	model: { foo: 'bar' }
});


var obj1 = storage.create();
var obj2 = storage.create();

storage.insert(obj1);
storage.insert(obj2);

storage.remove(0);          // true
storage.remove(null, obj1); // false, already removed
storage.remove(null, obj2); // true
```
 


= methods-setId

```javascript
(Boolean) lychee.Storage.prototype.setId(id);
```

- `(String) id` is a unique identifier used for the instance.

This method returns `true` on success and `false` on failure.

The unique identifier is used for synchronization purposes,
so the storage can be used among different sessions in the
same environment.

```javascript
var storage = new lychee.Storage();

storage.id;               // 'lychee-Storage-0'
storage.setId('awesome'); // true
storage.id;               // 'awesome'
```



= methods-setModel

```javascript
(Boolean) lychee.Storage.prototype.setModel(model);
```

- `(Object) model` is an Object that is used as a template for the creation of new Storage Objects via [create](#methods-create) method call.

This method returns `true` on success and `false` on failure.

The model object is dereferenced, so it is not the same as the argument.

```javascript
var storage = new lychee.Storage();

var model = { foo: 'bar' };

Object.keys(storage.model); // []
storage.setModel(model);    // true

storage.model;              // { foo: 'bar' }
storage.model === model;    // false
```



= methods-setType

```javascript
(Boolean) lychee.Storage.prototype.setType(type);
```

- `(Number) type` is an `enum of [lychee.Storage.TYPE](#enums-TYPE)`. It is defaulted with lychee.Storage.TYPE.persistent.

This method returns `true` on success and `false` on failure.

```javascript
var storage = new lychee.Storage();

storage.type;                                   // 0
storage.setType(lychee.Storage.TYPE.temporary); // true
storage.type;                                   // 1
storage.type === lychee.Storage.TYPE.temporary; // true
```

