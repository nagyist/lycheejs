
= constructor

```javascript
lychee.data.BENCODE;
```

This implementation is a Module and has no constructor.


```javascript
lychee.data.BENCODE; // lychee.data.BENCODE reference
```


#### Implementation Notes

The BENCODE codec offers an encoder and decoder for the popular
BENCODE (BitTorrent encode) format. The implementation
is built for stream usage, which means that the codec works
for partial or fragmented data.

It can be used with the [lychee.net.Tunnel](lychee.net.Tunnel)
interface as its `codec` setting in the constructor.

It is backwards compatible to other BENCODE implementations,
but extends the BENCODE format with support for Booleans and
Null.

The BENCODE codec strips out any dangerous unicode characters
that might crash your application or result in buffer overflows
of any kind. It has no support for the `undefined` value.

```javascript
var data = {
	foo: null,
	bar: true,
	qux: 13.37,
	doo: [ 'foo', 'bar' ]
};


var blob  = lychee.data.BENCODE.encode(data);
var check = lychee.data.BENCODE.decode(blob);

blob; // "d3:barbte3:dool3:foo3:bare3:foobne3:quxi13ee"
data; // { "foo": null, "bar": true, "qux": 13, "doo": [ "foo", "bar" ] }
```



#### BENCODE Specification

The BENCODE format is bytewise and using a dictionary and list
structure. It has no support for floats or doubles and
therefore represents Numbers only as integers.

Booleans and Null are represented as binary flags (`b`). All
serialized binary flags have a 1-byte value, which can be
either `t`, `f` or `n`.

```bash
| Value | Header | Value | Complete Blob |
| null  | b      | n     | bne           |
| true  | b      | t     | bte           |
| false | b      | f     | bfe           |
```

Numbers are represented as integers (`i`) only. All serialized
numbers have a leading `i`, an optional sign (`-`) and a
trailing `e`.

```bash
| Value | Header | Value | Complete Blob |
| 1     | i      | 1     | i1e           |
| -1    | i      | -1    | i-1e          |
| 1.0   | i      | 1     | i1e           |
```

Strings are represented as string values directly. They are
optimized by the necessary leading integer to represent their
length in base 10.

```bash
| Value    | Header | Value  | Complete Blob |
| "foo"    | 3:     | foo    | 3:foo         |
| "foobar" | 6:     | foobar | 6:foobar      |
```

Arrays are represented as lists (`l`) with their cell values.

Arrays are filled recursively to reflect their internal data
structures.

```bash
| Value        | Header | Value    | Complete Blob |
| [ 1 ]        | l      | i1e      | li1ee         |
| [ 1, 2 ]     | l      | i1ei2e   | li1ei2ee      |
| [ 1, "foo" ] | l      | i1e3:foo | li1e3:fooe    |
```

Objects are represented as dictionaries (`d`) with their
property names and property values.

Objects are filled recursively to reflect their internal data
structures.

```bash
| Value          | Header | Value      | Complete Blob |
| { foo: "bar" } | d      | 3:foo3:bar | d3:foo3:bare  |
| { foo: 1 }     | d      | 3:fooi1e   | d3:fooi1e     |
```



= methods-serialize

```javascript
(Serialization Object) lychee.data.BENCODE.serialize(void);
```

- This method has no arguments

This method is not intended for direct usage.
You can serialize a module using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = lychee.data.BENCODE;
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { reference: "lychee.data.BENCODE" }
foo2; // lychee.data.BENCODE module
```



= methods-decode

```javascript
(Object || null) lychee.data.BENCODE.decode(data);
```

- `(String) data` is a string. It is defaulted with `null`.

This method returns `Object` on success and `null` on failure.

```javascript
var data   = "d3:bari123e3:foo3:bare";
var object = lychee.data.BENCODE.decode(data);
if (object !== null) {
	object.foo; // "bar"
	object.bar; // 123
}
```



= methods-encode

```javascript
(String || null) lychee.data.BENCODE.encode(data);
```

- `(Object) data` is an `Object instance`. It is defaulted with `null`.

This method returns `String` on success and `null` on failure.

```javascript
var data = { foo: "bar", "bar": 123 };
var blob = lychee.data.BENCODE.encode(data);
if (blob !== null) {
	blob; // "d3:bari123e3:foo3:bare"
}
```

