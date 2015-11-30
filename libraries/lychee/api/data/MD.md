
= constructor

```javascript
lychee.data.MD;
```

This implementation is a Module and has no constructor.


```javascript
lychee.data.MD; // lychee.data.MD reference
```


#### Implementation Notes

The MD codec offers an encoder and decoder for the popular
MD (MarkDown or CommonMark) format. The implementation is
built for stream usage, which means that the codec works
for partial or fragmented data.

The MD codec strips out any dangerous characters and
shrinks error-prone new-line characters.

The blob requires a leading `\n=` and a trailing `\n\n`
to operate properly and be compatible with other formats.

It has no support for link names containing whitespaces.
It has no support for image names containing whitespaces.

The decoded format matches the interchange format, which is
fully compatible with [lychee.data.HTML](lychee.data.HTML).

```javascript
var blob = '\n= introduction\n\n# This is a test\n\nWoohoo with *italic* and **bold** `code`!';


var data = lychee.data.MD.decode(blob);
var blob = lychee.data.MD.encode(data);

blob; // "\n= introduction\n\n# This is a test\n\nWoohoo with *italic* and **bold** `code`!"
```



= methods-serialize

```javascript
(Serialization Object) lychee.data.MD.serialize(void);
```

- This method has no arguments

This method is not intended for direct usage.
You can serialize a module using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = lychee.data.MD;
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { reference: "lychee.data.MD" }
foo2; // lychee.data.MD module
```



= methods-decode

```javascript
(Array || null) lychee.data.MD.decode(data);
```

- `(String) data` is a string. It is defaulted with `null`.

This method returns `Array` on success and `null` on failure.

```javascript
var data  = '\n= section\n\n';
var array = lychee.data.MD.decode(data);
if (array !== null) {
	array.length; // 1
	array[1];     // { token: 'Section', type: null, value: 'section' }
}
```



= methods-encode

```javascript
(String || null) lychee.data.MD.encode(data);
```

- `(Object) data` is an `Array instance`. It is defaulted with `null`.

This method returns `String` on success and `null` on failure.

```javascript
var data = { token: 'Section', type: null, value: 'section' };
var blob = lychee.data.MD.encode(data);
if (blob !== null) {
	blob; // '\n= section\n\n';
}
```

