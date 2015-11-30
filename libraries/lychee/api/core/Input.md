
= constructor

```javascript
new lychee.Input(settings);
```

- `settings` is an `Object`.

This constructor returns an instance of `lychee.Input`.
The `settings` object consists of the following properties:

- `(Number) delay` will be passed to [setDelay](#methods-setDelay).
- `(Boolean) key` will be passed to [setKey](#methods-setKey).
- `(Boolean) keymodifier` will be passed to [setKeyModifier](#methods-setKeyModifier).
- `(Boolean) touch` will be passed to [setTouch](#methods-setTouch).
- `(Boolean) swipe` will be passed to [setSwipe](#methods-setSwipe).

```javascript
var input = new lychee.Input({
	delay:       0,
	key:         true,
	keymodifier: true,
	touch:       true,
	swipe:       true
});
```



= events-name

```javascript
new lychee.Input().bind(name, function(delta) {}, scope);
```

The unique `name` event is fired on keyboard interaction.

- `(String) name` is the unique identifier of the key event itself. It contains all modifiers in the following order if they are pressed. The resulting event name is in the maximum case `ctrl-alt-shift-(key)`.
- `(Number) delta` is the delta to the last event of the same type in milliseconds.

```javascript
var input = new lychee.Input({
	key:         true,
	keymodifier: true
});

input.bind('ctrl-a', function(delta) {
	// User is pressing [Ctrl] + [A]
}, this);

input.bind('ctrl-shift-a', function(delta) {
	// User is pressing [Ctrl] + [Shift] + [A]
}, this);
```



= events-key

```javascript
new lychee.Input().bind('key', function(key, name, delta) {}, scope);
```

The `key` event is fired on keyboard interaction.
It is fired right before the corresponding `name` event is fired.

- `(String) key` is the mapped key as a UTF8 character.
- `(String) name` is the unique identifier of the key event itself. It contains all modifiers in the following order if they are pressed. The resulting event name is in the maximum case `ctrl-alt-shift-(key)`.
- `(Number) delta` is the delta to the last event of the same type in milliseconds.

```javascript
var input = new lychee.Input({
	key:         true,
	keymodifier: true
});

input.bind('key', function(key, name, delta) {

	// User is pressing [A]
	// key == 'a', name == 'a'

	// User is pressing [Shift] + [A]
	// key == 'A', name == 'shift-a'

}, this);
```



= events-touch

```javascript
new lychee.Input().bind('touch', function(id, position, delta) {}, scope);
```

The `touch` event is fired on mouse or touchscreen interaction.

- `(Number) id` is the finger that is used for the touch. On missing multi-touch support, it is defaulted with `0`.
- `(Object) position` is the absolute position of the touch. It consists of the following properties: `(Number) x`, `(Number) y`, `(Number) z`.
- `(Number) delta` is the delta to the last event of the same type in milliseconds.

```javascript
var input = new lychee.Input({
	touch: true
});

input.bind('touch', function(id, position, delta) {
	// User is touching screen on Mobile or clicking on Desktop
}, this);
```



= events-swipe

```javascript
new lychee.Input().bind('swipe', function(id, state, position, delta, swipe) {}, scope);
```

The `swipe` event is fired on mouse or touchscreen interaction.

- `(Number) id` is the finger that is used for the touch. On missing multi-touch support, it is defaulted with `0`.
- `(String) state` is the touch interaction state. It consists either of the following values: `'start'`, `'move'`, `'end'`.
- `(Object) position` is the absolute position of the touch. It consists of the following properties: `(Number) x`, `(Number) y`, `(Number) z`.
- `(Number) delta` is the delta to the last event of the same type in milliseconds.
- `(Object) swipe` is the position delta from the beginning of the `swipe` event. It consists of the following properties: `(Number) x`, `(Number) y`, `(Number) z`.

The `swipe` event allows implementations of drag and drop behaviours and is
therefore available to track the movement and acceleration of `touch` events.

```javascript
var input = new lychee.Input({
	touch: true,
	swipe: true
});

var _dragged = null;

input.bind('swipe', function(id, state, position, delta, swipe) {

	if (drag === null && state === 'start') {
		_drag = getEntityByPosition(position);
	} else if (_drag !== null && state === 'move') {
		_drag.setPosition(position);
	} else if (drag !== null && state === 'end') {
		_drag.setPosition(position);
		_drag = null;
	}

}, this);
```



= properties-delay

```javascript
(Number) new lychee.Input().delay;
```

The `(Number) delay` property is the delay in milliseconds after
which an event is fired.

It influences all events, meaning that a [touch](#events-touch)
event can delay a [key](#events-key) event.

It is set via `settings.delay` in the [constructor](#constructor)
or via [setDelay](#methods-setDelay).

```javascript
var input = new lychee.Input({
	delay: 2000,
	touch: true
});

input.bind('touch', function() {

	console.log('Input is locked for 2000ms.');

	setTimeout(function() {
		console.log('Input is unlocked now.');
	}, input.delay);

}, this);
```



= properties-key

```javascript
(Boolean) new lychee.Input().key;
```

The `(Boolean) key` property is the state whether the instance is
firing the [key](#events-key) event.

It influences the [key](#events-key) event and the
[name](#events-name) event.

It is set via `settings.key` in the [constructor](#constructor)
or via [setKey](#methods-setKey).

```javascript
var input = new lychee.Input({
	key: true
});

input.bind('key', function() {

	input.setKey(false);
	console.log('Input is locked now.');

}, this);
```



= properties-keymodifier

```javascript
(Boolean) new lychee.Input().keymodifier;
```

The `(Boolean) keymodifier` property is the state whether the instance is
firing the [name](#events-name) event.

It influences the [name](#events-name) event.

It is set via `settings.keymodifier` in the [constructor](#constructor)
or via [setKeyModifier](#methods-setKeyModifier).

```javascript
var input = new lychee.Input({
	key:         true,
	keymodifier: true
});

input.bind('key', function(key) {

	console.log('Input fired key ' + key + '.');

}, this);

input.bind('ctrl-s', function() {

	input.setKey(false);
	console.log('Input is locked now, name event depends on key property.');

}, this);
```



= properties-touch

```javascript
(Boolean) new lychee.Input().touch;
```

The `(Boolean) touch` property is the state whether the instance is
firing the [touch](#events-touch) event.

It influences the [touch](#events-touch) event and the
[swipe](#events-swipe) event.

It is set via `settings.touch` in the [constructor](#constructor)
or via [setTouch](#methods-setTouch).

```javascript
var input = new lychee.Input({
	touch: true
});

input.bind('touch', function() {

	input.setTouch(false);
	console.log('Input is locked now.');

}, this);
```



= properties-swipe

```javascript
(Boolean) new lychee.Input().swipe;
```

The `(Boolean) swipe` property is the state whether the instance is
firing the [swipe](#events-swipe) event.

It influences the [swipe](#events-swipe) event.

It is set via `settings.swipe` in the [constructor](#constructor)
or via [setSwipe](#methods-setSwipe).

```javascript
var input = new lychee.Input({
	touch: true,
	swipe: true
});

input.bind('swipe', function() {

	input.setTouch(false);
	console.log('Input is locked now, swipe event depends on touch property.');

}, this);
```



= methods-destroy

```javascript
(Boolean) lychee.Viewport.prototype.destroy(void);
```

- This method has no arguments.

This method returns `true` on success and `false` on failure.
It will destroy the instance from any interaction bindings.



= methods-serialize

```javascript
(Serialization Object) lychee.Input.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage.
You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = new lychee.Input({ delay: 5000 });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Input', arguments: [{ delay: 5000 }]}
foo2; // lychee.Input instance
```



= methods-setDelay

```javascript
(Boolean) lychee.Input.prototype.setDelay(delay);
```

- `(Number) delay` is the delay in milliseconds. If set to a value bigger than `0`, the instance will wait the amount of milliseconds until a new event of any kind is fired.

This method returns `true` on success and `false` on failure.
It will set the [delay](#properties-delay) property of the instance.

```javascript
var input = new lychee.Input({
	key: true
});

input.delay;          // 0
input.setDelay(1337); // true
input.delay;          // 1337

input.bind('key', function(key, name, delta) {
	delta >= input.delay; // true
}, this);
```



= methods-setKey

```javascript
(Boolean) lychee.Input.prototype.setKey(key);
```

- `(Boolean) key` is a flag. If set to `true`, the [key](#events-key) event is fired.

This method returns `true` on success and `false` on failure.
It will set the [key](#properties-key) property of the instance.

```javascript
var input = new lychee.Input();

input.key;          // false
input.setKey(true); // true
input.key;          // true

input.bind('key', function() {
	// key event is only fired if input.key === true
}, this);
```



= methods-setKeyModifier

```javascript
(Boolean) lychee.Input.prototype.setKeyModifier(keymodifier);
```

- `(Boolean) keymodifier` is a flag. If set to `true`, the [name](#events-name) event is fired.

This method returns `true` on success and `false` on failure.
It will set the [keymodifier](#properties-keymodifier) property of the instance.

```javascript
var input = new lychee.Input({
	key: true
});

input.keymodifier;          // false
input.setKeyModifier(true); // true
input.keymodifier;          // true

input.bind('ctrl-a', function() {
	// key event is only fired if input.key === true and input.keymodifier === true
}, this);
```



= methods-setTouch

```javascript
(Boolean) lychee.Input.prototype.setTouch(touch);
```

- `(Boolean) touch` is a flag. If set to `true`, the [touch](#events-touch) event is fired.

This method returns `true` on success and `false` on failure.
It will set the [touch](#properties-touch) property of the instance.

```javascript
var input = new lychee.Input();

input.touch;          // false
input.setTouch(true); // true
input.touch;          // true

input.bind('touch', function() {
	// touch event is only fired if input.touch === true
}, this);
```



= methods-setSwipe

```javascript
(Boolean) lychee.Input.prototype.setSwipe(swipe);
```

- `(Boolean) swipe` is a flag. If set to `true`, the [swipe](#events-swipe) event is fired.

This method returns `true` on success and `false` on failure.
It will set the [swipe](#properties-swipe) property of the instance.

```javascript
var input = new lychee.Input({
	touch: true
});

input.swipe;          // false
input.setSwipe(true); // true
input.swipe;          // true

input.bind('swipe', function() {
	// swipe event is only fired if input.touch === true and input.swipe === true
}, this);
```

