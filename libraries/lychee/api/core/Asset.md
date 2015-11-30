
= constructor

```javascript
(null || Config || Font || Music || Sound || Texture || Stuff) new lychee.Asset(url [, type]);
```

- `(String) url` is the resource identifier of the asset.
- `(String) type` is the type of the resource. Valid types are `json`, `fnt`, `msc`, `snd`, `png`.

This constructor returns an instance on success and `null` on failure.
It integrates the Assets of the [bootstrap](bootstrap) file with the core stack.

```javascript
var foo = new lychee.Asset('/libraries/lychee/lychee.pkg'); // absolute path
var bar = new lychee.Asset('./lychee.pkg');                 // relative path

var qux = new lychee.Asset('http://localhost:8080/api/Server?identifier=boilerplate');
var doo = new lychee.Asset('http://localhost:8080/api/Server?identifier=boilerplate', 'json');

foo instanceof Config; // true
bar instanceof Config; // true
qux instanceof Config; // false, no type in URL
doo instanceof Config; // true,  enforced type
```

#### Implementation Notes

The defaulted Asset type is [Stuff](bootstrap#constructor-Stuff).

Some Asset types are made for dynamic interaction, such as [lychee.Package](lychee.Package)
instances using the `pkg` file extension or [lychee.Storage](lychee.Storage) using the
`store` file extension.

The mapped extensions for processing the file contents are mapped as listed here:

- [Buffer](bootstrap#constructor-Buffer) for a generic binary buffer.
- [Config](bootstrap#constructor-Config) for files with the `json`, `pkg` or `store` extension.
- [Font](bootstrap#constructor-Font) for files with the `fnt` extension.
- [Music](bootstrap#constructor-Music) for files with the `msc` extension.
- [Sound](bootstrap#constructor-Sound) for files with the `snd` extension.
- [Texture](bootstrap#constructor-Texture) for files with the `png` extension.


