
={constructor}

# new lychee.Storage(settings);

- *settings* is an *Object*.

This constructor returns an instance of *lychee.Storage*.
The *settings* object consists of the following properties:

- *(String) id* will be passed to [setId()](#methods-setId).
- *(Object) model* will be passed to [setModel()](#methods-setModel).
- *(Enum) type* will be passed to [setType()](#methods-setType).

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



={properties-id}

### (String) new lychee.Storage().id;

The *(String) id* property is the unique identifier
of the storage instance.

It influences the *sync* event and the *sync* method.

It is set via *settings.id* in the [constructor](#constructor)
or via [setId()](#methods-setId).

```javascript
var storage = new lychee.Storage({
	id: 'awesome'
});

storage.id;                    // 'awesome'
storage.setId('more-awesome'); // true
storage.id;                    // 'more-awesome'
```



// TODO: Document properties and custom methods

={properties-model}
={properties-type}

={methods-sync}
={methods-serialize}
={methods-create}
={methods-filter}
={methods-insert}
={methods-update}
={methods-get}
={methods-remove}



={methods-setId}

### (Boolean) lychee.Storage.prototype.setId(id);

- *(String) id* is a unique identifier used for the instance.

This method returns *true* on success and *false* on failure.

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

### (Boolean) lychee.Storage.prototype.setModel(model);

- *(Object) model* is an Object that is used as a template for the
creation of new Storage Objects via [create()](#methods-create).

This method returns *true* on success and *false* on failure.

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

### (Boolean) lychee.Storage.prototype.setType(type);

- *(Number) type* is an *enum of lychee.Storage.TYPE*.
It is defaulted with lychee.Storage.TYPE.persistent.

This method returns *true* on success and *false* on failure.

```javascript
var storage = new lychee.Storage();

storage.type;                                   // 0
storage.setType(lychee.Storage.TYPE.temporary); // true
storage.type;                                   // 1
storage.type === lychee.Storage.TYPE.temporary; // true
```

