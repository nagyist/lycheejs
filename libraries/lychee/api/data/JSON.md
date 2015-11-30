
= constructor

```javascript
lychee.data.JSON;
```

This implementation is a Module and has no constructor.


```javascript
lychee.data.JSON; // lychee.data.JSON reference
```


#### Implementation Notes

The JSON codec offers an encoder and decoder for the popular
JSON (JavaScript Object Notation) format. The implementation
is built for stream usage, which means that the codec works
for partial or fragmented data.

It can be used with the [lychee.net.Tunnel](lychee.net.Tunnel)
interface as its `codec` setting in the constructor.

The JSON codec strips out any dangerous unicode characters
that might crash your application or result in buffer overflows
of any kind. It has no support for the `undefined` value.

```javascript
var data = {
	foo: null,
	bar: true,
	qux: 13.37,
	doo: [ 'foo', 'bar' ]
};


var blob  = lychee.data.JSON.encode(data);
var check = lychee.data.JSON.decode(blob);


blob; // "{\"foo\":null,\"bar\":true,\"qux\":13.37,\"doo\":[\"foo\",\"bar\"]}"
```



= methods-serialize

```javascript
(Serialization Object) lychee.data.JSON.serialize(void);
```

- This method has no arguments

This method is not intended for direct usage.
You can serialize a module using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = lychee.data.JSON;
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { reference: "lychee.data.JSON" }
foo2; // lychee.data.JSON module
```



= methods-decode

```javascript
(Object || null) lychee.data.JSON.decode(data);
```

- `(String) data` is a string. It is defaulted with `null`.

This method returns `Object` on success and `null` on failure.

```javascript
var data   = '{"foo":"bar","bar":123}';
var object = lychee.data.JSON.decode(data);
if (object !== null) {
	object.foo; // "bar"
	object.bar; // 123
}
```



= methods-encode

```javascript
(String || null) lychee.data.JSON.encode(data);
```

- `(Object) data` is an `Object instance`. It is defaulted with `null`.

This method returns `String` on success and `null` on failure.

```javascript
var data = { foo: "bar", "bar": 123 };
var blob = lychee.data.JSON.encode(data);
if (blob !== null) {
	blob; // '{"foo":"bar","bar":123}'
}
```

