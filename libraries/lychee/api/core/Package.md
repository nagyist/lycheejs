
= constructor

```javascript
new lychee.Package(id, url);
```

- `(String) id` is a unique identifier.
- `(String) url` is the url to the `lychee.pkg` file.

This constructor returns an instance of `lychee.Package`.

```javascript
// Package initialized as namespace 'lychee'
var pkg1 = new lychee.Package('lychee', '/lychee/lychee.pkg');

// Package initialized as namespace 'myname'
var pkg2 = new lychee.Package('myname', '/lychee/lychee.pkg');
```



= properties-id

```javascript
(String) new lychee.Package().id;
```

The `(String) id` property is the unique identifier of
the package.

It influences into which namespace the Definitions are
mapped after they were loaded.

It is set via `id` in the [constructor](#constructor).

```javascript
var pkg = new lychee.Package('app', './lychee.pkg');

pkg.id; // 'app'
```



= properties-url

```javascript
(String || null) new lychee.Package().url;
```

The `(String) url` property represents the location of
the `lychee.pkg` file.

If the property is set to `null`, the `url` argument
in the constructor had an invalid value.

```javascript
var foo = new lychee.Package('foo', './lychee.pkg');
var bar = new lychee.Package('bar', './invalid/value');

foo.url; // './lychee.pkg'
bar.url; // null
```



= properties-root

```javascript
(String || null) new lychee.Package().root;
```

The `(String) root` property represents the folder
of the `lychee.pkg` file.

If the property is set to `null`, the `url` argument
in the constructor had an invalid value.

```javascript
var foo = new lychee.Package('foo', './path/to/lychee.pkg');
var bar = new lychee.Package('bar', './invalid/value');

foo.root; // './path/to'
bar.root; // null
```



= methods-serialize

```javascript
(Serialization Object) lychee.Package.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage.
You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.

```
var foo1 = new lychee.Package('example', './lychee.pkg');
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Package', arguments: [ 'example', './lychee.pkg' ]}
foo2; // lychee.Package instance
```



= methods-isReady

```javascript
(Boolean) lychee.Package.prototype.isReady(void);
```

This method returns `true` if the instance is ready and `false`
if the instance is not ready.

Due to asynchronous loading behaviours, this method might give
different results on otherwise identical systems. The `lychee.pkg`
file is loaded and parsed. After this process is done, the `lychee.Package`
instance is marked as being ready.

This method is not intended for public usage. It is called
by the [lychee.Environment](lychee.Environment) instance.



= methods-load

```javascript
(Boolean) lychee.Package.prototype.load(id, tags);
```

- `(String) id` is the unique identifier of a Definition.
- `(Object) tags` is an object consisting of a key and an Array of values.

This method returns `true` on success and `false` on failure.
It will try to load a Definition that matches the given tags
and is properly supporting the target environment.

This method is not intended for public usage. It is called
by the [lychee.Environment](lychee.Environment) instance.



= methods-setEnvironment

```javascript
(Boolean) lychee.Package.prototype.setEnvironment(environment);
```

- `(lychee.Environment) environment` is a [lychee.Environment](lychee.Environment) instance.

This method returns `true` on success and `false` on failure.
It will set the [environment](#properties-delay) property of the instance.

```javascript
var pkg = new lychee.Package('app', './lychee.pkg');

pkg.environment;         // null
pkg.setEnvironment(env); // true

```



= methods-setType

```javascript
(Boolean) lychee.Package.prototype.setType(type);
```

- `(String) type` is a string that can have the following values: `source`, `export` or `build`.

This method returns `true` on success and `false` on failure.
It will set the type of the package that influences the
behaviour of the [load](#methods-load) method.

This method is not intended for public usage. It is called
by the [lychee.Environment](lychee.Environment) instance.

