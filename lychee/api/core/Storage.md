
={constructor}

```javascript-constructor
new lychee.Storage(settings);
```

- `settings` is an `Object`.

This constructor returns an instance of `lychee.Storage`.
The `settings` object consists of the following properties:

- `(String) id` will be passed to [setId()](#methods-setId).
- `(Object) model` will be passed to [setModel()](#methods-setModel).
- `(Enum) type` will be passed to [setType()](#methods-setType).

```javascript
var model = {
	name:  'Rainbow',
	squad: 'LazerUnicorns',
	score: 1337
};

var storage = new lychee.Storage({
	id:    'game-playerdata',
	model: model,
	type:  lychee.Storage.TYPE.persistent
});
```



={enums-TYPE}

```javascript-enum
(Enum) lychee.Storage.TYPE;
```

The `(Enum) TYPE` enum consist of the following properties:

- `(Number) persistent` that reflects a persistent storage.
- `(Number) temporary` that reflects a temporary storage.

If a storage is persistent, all objects will be stored forever.
If a storage is temporary, all objects will be stored until the
current session ends.



={properties-id}

```javascript-property
(String) new lychee.Storage().id;
```

The `(String) id` property is the unique identifier
of the storage instance.

It influences the `sync` event and the `sync` method.

It is set via `settings.id` in the [constructor](#constructor)
or via [setId()](#methods-setId).

```javascript
var storage = new lychee.Storage({
	id: 'awesome'
});

storage.id;                    // 'awesome'
storage.setId('more-awesome'); // true
storage.id;                    // 'more-awesome'
```



={properties-model}

```javascript-property
(Object) new lychee.Storage().model;
```

The `(Object) model` property is the object model
of the storage instance.

It influences how the [create()](#methods-create),
[insert()](#methods-insert) and [update()](#methods-update)
validate objects of the storage instance.

It is set via `settings.model` in the [constructor](#constructor)
or via [setModel()](#methods-setModel).

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



={properties-type}

```javascript-property
(Number) new lychee.Storage().type;
```

The `(Number) type` property is the type
of the storage instance.

It influences how long created objects are stored.
Possible values are all values of the [TYPE enum](#enums-TYPE).

It is set via `settings.type` in the [constructor](#constructor)
or via [setType()](#methods-setType).

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



={methods-deserialize}

```javascript-method
(void) lychee.Storage.prototype.deserialize(blob);
```

- `(Object) blob` is an Object that is part of the Serialization Object.

This method returns nothing.
It is not intended for direct usage. You can deserialize an
object using the [lychee.deserialize()](lychee#methods-deserialize) method.

```javascript
var foo1 = new lychee.Storage({ id: 'foo' });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Storage', arguments: [{ id: 'foo' }]}
foo2; // lychee.Storage instance
```



={methods-serialize}

```javascript-method
(Serialization Object) lychee.Storage.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage. You can serialize an
object using the [lychee.serialize()](lychee#methods-serialize) method.

```javascript
var foo1 = new lychee.Storage({ id: 'foo' });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Storage', arguments: [{ id: 'foo' }]}
foo2; // lychee.Storage instance
```



// TODO: Document properties and custom methods

={methods-sync}
={methods-create}
={methods-filter}
={methods-insert}
={methods-update}
={methods-get}
={methods-remove}



={methods-setId}

```javascript-method
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



={methods-setModel}

```javascript-method
(Boolean) lychee.Storage.prototype.setModel(model);
```

- `(Object) model` is an Object that is used as a template for the
creation of new Storage Objects via [create()](#methods-create).

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



={methods-setType}

```javascript-method
(Boolean) lychee.Storage.prototype.setType(type);
```

- `(Number) type` is an `enum of [lychee.Storage.TYPE](#enums-TYPE)`.
It is defaulted with lychee.Storage.TYPE.persistent.

This method returns `true` on success and `false` on failure.

```javascript
var storage = new lychee.Storage();

storage.type;                                   // 0
storage.setType(lychee.Storage.TYPE.temporary); // true
storage.type;                                   // 1
storage.type === lychee.Storage.TYPE.temporary; // true
```

