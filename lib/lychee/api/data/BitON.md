
= constructor

```javascript
lychee.data.BitON;
```

This implementation is a Module and has no constructor.


```javascript
lychee.data.BitON; // lychee.data.BitON reference
```


#### Implementation Notes

The BitON codec offers an encoder and decoder with the custom
bitwise BitON format. The implementation is built for stream
usage, which means that the codec works for partial or
fragmented data.

It can be used with the [lychee.net.Tunnel](lychee.net.Tunnel)
interface as its `codec` setting in the constructor.

The BitON codec is built for bytewise streams, which means the
trailing 0-Bits will be added until the stream has a bytewise
length. It has no support for the `undefined` value.

```javascript
var data = {
	foo: null,
	bar: true,
	qux: 13.37,
	doo: [ 'foo', 'bar' ]
};


var blob  = lychee.data.BitON.encode(data);
var check = lychee.data.BitON.decode(blob);


blob; // "¡foocbarcquxF§\"`doofoo`barü"
```



#### BitON Specification

The BitON format is bitwise and using a 3-Bit header field. Each
data type has a sub-header with a varying length that optimizes
internal data structures.

Booleans and Null are represented as binary flags (`000`). All
serialized binary flags have a 2-Bit value.

```bash
| Value | Header | Value | Complete Blob |
| null  | 000    | 01    | 000 01        |
| true  | 000    | 11    | 000 11        |
| false | 000    | 10    | 000 10        |
```

Numbers are represented as integers (`001`) and doubles
(`002`). All serialized numbers have a trailing 1-Bit sign
value.

If the sign is set to `0`, the number was positive.
If the sign is set to `1`, the number was negative.

Integers don't have a trailing shift while doubles have their
shift represented as a 4-Bit value. That means they will lose
precision if their digits are too long and smaller than
`10^-16`.

```bash
| Value | Header | Value          | Complete Blob      |
| 1     | 001    | 0000 01 0      | 001 0000 01 0      |
| -1    | 001    | 0000 01 1      | 001 0000 01 1      |
| 1.0   | 002    | 0000 01 0 0000 | 002 0000 01 0 0000 |
```

Numbers are also not represented as 64-Bit values as you might
have noticed. They are optimized by the necessary bits they
require to be represented.

The magic values for optimization are `2`, `16`, `256`,
`4096`, `65536`, `1048576`, `16777216`, `268435456`.

Numbers greater than 32-Bit are represented with their `string`
representation. That means big integers like date timestamps
are transferred with their `toString()` value.

```bash
| Value | Header | Value                 | Complete Blob             |
| 2     | 001    | 0001 0010 0           | 001 0001 0010 0           |
| 15    | 001    | 0001 1111 0           | 001 0001 1111 0           |
| 16    | 001    | 0010 0001 1111 0      | 001 0010 0001 1111 0      |
| 255   | 001    | 0010 1111 1111 0      | 001 0010 1111 1111 0      |
| 256   | 001    | 0011 0001 1111 1111 0 | 001 0011 0001 1111 1111 0 |
```

Strings (`003`) are represented as string values directly. They
are optimized by the necessary bits to represent their length.

The magic string value lengths for optimization are `28`, `255`,
`65535`.

```bash
| Value Length | Header | Value         | Complete Blob     |
| > 65535      | 011    | 11111 "value" | 011 11111 "value" |
| > 255        | 011    | 11110 "value" | 011 11110 "value" |
| > 28         | 011    | 11101 "value" | 011 11101 "value" |
| <= 28        | 011    | "value"       | 011 "value"       |
```

Arrays (`004`) are represented with their cell values.

They are optimized by using a 3-Bit `EOC` (End of Cell) marker
in between each cell and an `EOO` (End of Object) marker after
the array.

Arrays are filled recursively to reflect their internal data
structures.

```bash
| Value    | Header | Value                               | Complete Blob                               |
| [ 1 ]    | 100    | 000 001 0000 01 0                   | 100 000 001 0000 01 0 111                   |
| [ 1, 2 ] | 100    | 000 001 0000 01 0 000 001 0000 10 0 | 100 000 001 0000 01 0 000 001 0000 10 0 111 |
```

Objects (`005`) are represented with their property names and
property values.

They are optimized by using a 3-Bit `EOC` (End of Cell) marker in
between each property name/value pair and an `EOO` (End of Object)
marker after the object.

Objects are filled recursively to reflect their internal data
structures.

```bash
| Value          | Header | Value                   | Complete Blob                   |
| { foo: "bar" } | 101    | 000 "foo" "bar"         | 101 000 "foo" "bar" 111         |
| { foo: 1 }     | 101    | 000 "foo" 001 0000 01 0 | 101 000 "foo" 001 0000 01 0 111 |
```

Instances (`006`) are represented with their `lychee.serialize()`
blob.

This data structure is used internally by lycheeJS components to
optimize the JSON data structures and to have automatic
deserialization on the other end.

Instances have a trailing `EOO` (End of Object) marker,
everything else is encoded as a JSON object (`005`).



= methods-serialize

```javascript
(Serialization Object) lychee.data.BitON.serialize(void);
```

- This method has no arguments

This method is not intended for direct usage.
You can serialize a module using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = lychee.data.BitON;
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { reference: "lychee.data.BitON" }
foo2; // lychee.data.BitON module
```



= methods-decode

```javascript
(Object || null) lychee.data.BitON.decode(data);
```

- `(String) data` is a string. It is defaulted with `null`.

This method returns `Object` on success and `null` on failure.

```javascript
var data   = "¡foocbar`bar$öà";
var object = lychee.data.BitON.decode(data);
if (object !== null) {
	object.foo; // "bar"
	object.bar; // 123
}
```



= methods-encode

```javascript
(String || null) lychee.data.BitON.encode(data);
```

- `(Object) data` is an `Object instance`. It is defaulted with `null`.

This method returns `String` on success and `null` on failure.

```javascript
var data = { foo: "bar", "bar": 123 };
var blob = lychee.data.BitON.encode(data);
if (blob !== null) {
	blob; // "¡foocbar`bar$öà";
}
```

