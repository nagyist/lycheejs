
= constructor

```javascript
new lychee.Viewport(settings);
```

- `settings` is an `Object`.

This constructor returns an instance of `lychee.Viewport`.
The `settings` object consists of the following properties:

- `(Boolean) fullscreen` will be passed to [setFullscreen](#methods-setFullscreen).

```javascript
var viewport = new lychee.Viewport({
	fullscreen: true
});
```

#### Implementation Notes

Desktop systems are treated by their resolution, so if a
monitor is rotated by 90 degrees, its `orientation` is `portrait`.

If the monitor is not rotated and has a width/height ratio lower
than 1, it is treated as its `orientation` is `portrait`.



= events-reshape

```javascript
new lychee.Viewport().bind('reshape', function(orientation, rotation, width, height) {}, scope);
```

The `reshape` event is fired on viewport size change or rotation of the device.

- `(String) orientation` is the orientation the device was built for. It consists either of the following values: `'landscape'`, `'portrait'`
- `(String) rotation` is the rotation of the device in its current state. If it differs from `orientation`, the device was rotated and the physical buttons are not in the original place anymore. It consists either of the following values: `'landscape'`, `'portrait'`
- `(Number) width` is the width of the device in its current state.
- `(Number) height` is the height of the device in its current state.

```javascript
var viewport = new lychee.Viewport();

viewport.bind('reshape', function(orientation, rotation) {

	if (viewport.width > viewport.height) {
		console.log('Viewport is in landscape rotation');
	} else {
		console.log('Viewport is in portrait rotation');
	}

}, this);
```



= events-show

```javascript
new lychee.Viewport().bind('show', function() {}, scope);
```

The `show` event is fired if the window is made visible and was not visible before.

- This event has no arguments.

```javascript
var viewport = new lychee.Viewport();

viewport.bind('show', function() {
	console.log('Viewport is visible');
}, this);

viewport.bind('hide', function() {
	console.log('Viewport is hidden');
}, this);
```



= events-hide

```javascript
new lychee.Viewport().bind('hide', function() {}, scope);
```

The `show` event is fired if the window is made not visible and was visible before.

- This event has no arguments.

```javascript
var viewport = new lychee.Viewport();

viewport.bind('show', function() {
	console.log('Viewport is visible');
}, this);

viewport.bind('hide', function() {
	console.log('Viewport is hidden');
}, this);
```



= properties-fullscreen

```javascript
(Boolean) new lychee.Viewport().fullscreen;
```

The `(Boolean) fullscreen` property is the state whether the instance is
in fullscreen mode.

It influences the `reshape` event.

It is set via `settings.fullscreen` in the [constructor](#constructor)
or via [setFullscreen](#methods-setFullscreen).

```javascript
var viewport = new lychee.Viewport({
	fullscreen: true
});

viewport.bind('reshape', function() {
	console.log('Viewport width and height initially change.');
}, this);
```



= properties-width

```javascript
(Number) new lychee.Viewport().width;
```

The `(Number) width` property is the current width of the Viewport.

```javascript
var viewport = new lychee.Viewport();

viewport.bind('reshape', function() {
	console.log('Viewport width is ' + viewport.width);
}, this);
```



= properties-height

```javascript
(Number) new lychee.Viewport().height;
```

The `(Number) height` property is the current height of the Viewport.

```javascript
var viewport = new lychee.Viewport();

viewport.bind('reshape', function() {
	console.log('Viewport height is ' + viewport.height);
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
(Serialization Object) lychee.Viewport.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage.
You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.

```
var foo1 = new lychee.Viewport({ fullscreen: true });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.Viewport', arguments: [ { fullscreen: true }]}
foo2; // lychee.Viewport instance
```



= methods-setFullscreen

```javascript
(Boolean) lychee.Viewport.prototype.setFullscreen(fullscreen);
```

- `(Boolean) fullscreen` is a flag. If set to `true`, the instance will try to go into fullscreen mode.

This method returns `true` on success and `false` on failure.
It depends on asynchronous user interaction.
It will set the [fullscreen](#properties-fullscreen) property of the instance.

```javascript
var viewport = new lychee.Viewport({
	fullscreen: false
});

viewport.fullscreen;          // false
viewport.setFullscreen(true); // true
viewport.fullscreen;          // false

setTimeout(function() {
	viewport.fullscreen; // true, if User confirmed Fullscreen Mode
}, 10000);
```
 
