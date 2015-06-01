
={constructor}

```javascript-constructor
(null || Config || Font || Music || Sound || Texture || Stuff) new lychee.Asset(url [, type]);
```

- `(String) url` is the resource identifier of the asset.
- `(String) type` is the type of the resource. Valid types
are `json`, `fnt`, `msc`, `snd`, `png`.

This constructor returns an instance on success and `null` on failure.
It integrates the Assets of the [bootstrap](bootstrap) file with the core stack.

```javascript
var foo = new lychee.Asset('/path/to/config.json');
var bar = new lychee.Asset('/api/Server?identifier=boilerplate');
var qux = new lychee.Asset('/api/Server?identifier=boilerplate', 'json');

foo instanceof Config; // true
bar instanceof Config; // false, no type in URL
qux instanceof Config; // true,  enforced type
```

**Implementation Notes**

Defaulted Asset type is [Stuff](bootstrap#constructor-Stuff).

Other Supported Asset types are:

- [Config](bootstrap#constructor-Config) (`json`)
- [Font](bootstrap#constructor-Font) (`fnt`)
- [Music](bootstrap#constructor-Music) (`msc`)
- [Sound](bootstrap#constructor-Sound) (`snd`)
- [Texture](bootstrap#constructor-Texture) (`png`)

