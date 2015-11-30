
= constructor

```javascript
new lychee.net.Tunnel(settings);
```

- `settings` is an `Object`.

This constructor returns an instance of `lychee.net.Tunnel`.
The `settings` object consists of the following properties:


- `(Object) codec` is a reference to an encoder Module, e.g. [lychee.data.BENCODE](lychee.data.BENCODE), [lychee.data.BitON](lychee.data.BitON) or [lychee.data.JSON](lychee.data.JSON).
- `(Boolean) binary` will be passed to [setBinary](#methods-setBinary).
- `(String) host` will be passed to [setHost](#methods-setHost).
- `(Number) port` will be passed to [setPort](#methods-setPort).
- `(Number) reconnect` will be passed to [setReconnect](#methods-setReconnect).

```javascript
var tunnel = new lychee.net.Tunnel({
	codec:     lychee.data.JSON,
	host:      'localhost',
	port:      1337,
	reconnect: 10000
});
```

#### Implementation Notes

This implementation is an interface which is reused by both
[lychee.net.Client](lychee.net.Client) and [lychee.net.Remote](lychee.net.Remote).

The events are integrated with the services, so this interface
automatically manages all services, authentication flows and
synchronization flows.



= events-connect

```javascript
new lychee.net.Tunnel().bind('connect', function() {}, scope);
```

The `connect` event is fired on connect of the socket.

Note that this event is reserved to be implemented by extending implementations,
e.g. [lychee.net.Client](lychee.net.Client) or [lychee.net.Remote](lychee.net.Remote).

```javascript
var socket = new DummySocket();
var tunnel = new lychee.net.Tunnel();

socket.onopen = function() {
	tunnel.trigger('connect');
};

tunnel.bind('connect', function() {
	console.log('Tunnel connected!');
});
```



= events-disconnect

```javascript
new lychee.net.Tunnel().bind('disconnect', function() {}, scope);
```

The `disconnect` event is fired on disconnect of the socket.

Note that this event is reserved to be implemented by extending implementations,
e.g. [lychee.net.Client](lychee.net.Client) or [lychee.net.Remote](lychee.net.Remote).

By default this event is used to implement the [reconnect](#properties-reconnect) property.

```javascript
var socket = new DummySocket();
var tunnel = new lychee.net.Tunnel();

socket.onclose = function() {
	tunnel.trigger('disconnect');
};

tunnel.bind('disconnect', function() {
	console.log('Tunnel disconnected!');
});
```



= events-send

```javascript
new lychee.net.Tunnel().bind('send', function(blob, binary) {}, scope);
```

The `send` event is fired on data needing to be send via the socket.

- `(String) blob` is an encoded string.
- `(Boolean) binary` is a flag. If set to `true`, the `blob` is encoded as `binary`. If set to `false`, the `blob` is encoded as `utf-8`.

Note that this event is reserved to be implemented by extending implementations,
e.g. [lychee.net.Client](lychee.net.Client) or [lychee.net.Remote](lychee.net.Remote).

```javascript
var socket = new DummySocket();
var tunnel = new lychee.net.Tunnel();

tunnel.bind('send', function(blob, binary) {
	binary === true ? socket.sendAsBinary(blob) : socket.sendAsText(blob);
});
```



= events-receive

```javascript
new lychee.net.Tunnel().bind('receive', function(data) {}, scope);
```

The `send` event is fired on data needing to be send via the socket.

- `(Object) data` is an object.

Note that this event is reserved to be implemented by extending implementations,
e.g. [lychee.net.Client](lychee.net.Client) or [lychee.net.Remote](lychee.net.Remote).

```javascript
var socket = new DummySocket();
var tunnel = new lychee.net.Tunnel();

socket.onmessage = function(blob) {
	tunnel.receive(blob);
};

tunnel.bind('receive', function(data) {
	console.log('Tunnel received ', data);
});
```



= properties-binary

```javascript
(Boolean) new lychee.net.Tunnel().binary;
```

The `(Boolean) binary` property the state whether the instance is
encoding all data as `binary` or not.

It influences the [send](#events-send) event, the [send](#methods-send) method
the [receive](#events-receive) event and the [receive](#methods-receive) method.

It is set via `settings.binary` in the [constructor](#constructor)
or via [setBinary](#methods-setBinary).

```javascript
var tunnel = new lychee.net.Tunnel({
	binary: false
});

tunnel.binary;          // false
tunnel.setBinary(true); // true
tunnel.binary;          // true
```



= properties-host

```javascript
(String) new lychee.net.Tunnel().host;
```

The `(String) host` property is the host for the socket.

It is set via `settings.host` in the [constructor](#constructor)
or via [setHost](#methods-setHost).

```javascript
var tunnel = new lychee.net.Tunnel({
	host: 'localhost'
});

tunnel.host;               // 'localhost'
tunnel.setHost('1.3.3.7'); // true
tunnel.host;               // '1.3.3.7'
```



= properties-port

```javascript
(Number) new lychee.net.Tunnel().port;
```

The `(Number) port` property is the port for the socket.

It is set via `settings.port` in the [constructor](#constructor)
or via [setPort](#methods-setPort).

```javascript
var tunnel = new lychee.net.Tunnel({
	port: 1337
});

tunnel.port;           // 1337
tunnel.setPort(13337); // true
tunnel.port;           // 13337
```



= properties-reconnect

```javascript
(Number) new lychee.net.Tunnel().reconnect;
```

The `(Number) reconnect` property is the timeout in milliseconds
until the disconnected instance reconnects. If set to a greater
value than `0`, reconnects are active.

It influences the [disconnect](#events-disconnect) event.

It is set via `settings.reconnect` in the [constructor](#constructor)
or via [setReconnect](#methods-setReconnect).

```javascript
var tunnel = new lychee.net.Tunnel({
	reconnect: 0
});

tunnel.reconnect;          // 0, disabled
tunnel.setReconnect(1337); // true
tunnel.reconnect;          // 1337
```
 


= methods-deserialize

```javascript
(void) lychee.Storage.prototype.deserialize(blob);
```

- `(Object) blob` is an Object that is part of the Serialization Object.

This method is not intended for direct usage.
You can deserialize an object using the [lychee.deserialize](lychee#methods-deserialize) method.

```javascript
var foo1 = new lychee.net.Tunnel({ host: 'localhost', port: 1337 });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.net.Tunnel', arguments: [{ host: 'localhost', port: 1337 }]}
foo2; // lychee.net.Tunnel instance
```



= methods-serialize

```javascript
(Serialization Object) lychee.net.Tunnel.prototype.serialize(void);
```

- This method has no arguments.

This method is not intended for direct usage.
You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.

```javascript
var foo1 = new lychee.net.Tunnel({ host: 'localhost', port: 1337 });
var data = lychee.serialize(foo1);
var foo2 = lychee.deserialize(data);

data; // { constructor: 'lychee.net.Tunnel', arguments: [{ host: 'localhost', port: 1337 }]}
foo2; // lychee.net.Tunnel instance
```



= methods-send

```javascript
(Boolean) lychee.net.Tunnel.prototype.send(data [, service ]);
```

- `(Object) data` is the data object to send.
- `(Object) service` is the optional service description object.

This method returns `true` on success and `false` on failure.
It encodes the `data` object into a `blob` string and sends it
to the remote side.

There are three variants on how to send/receive data, the latter
is the preferred and recommended one:

- If the `service` object is `null`, the remote side triggers the [receive](#events-receive) event.
- If the `service` object has a valid `(String) id` and a valid `(String) method`, the remote side's service's method will be called.
- If the `service` object has a valid `(String) id` and a valid `(String) event`, the remote side's service's event will be triggered.

```javascript
var tunnel = new lychee.net.Tunnel();

tunnel.send({
	foo: 'bar'
}); // will land in the remote's receive event

tunnel.send({
	foo: 'bar'
}, {
	id:     'my-service',
	method: 'my-method'
}); // will call remote's service's method

tunnel.send({
	foo: 'bar'
}, {
	id:    'my-service',
	event: 'my-event'
}); // will trigger remote's service's event
```



= methods-receive

```javascript
(Boolean) lychee.net.Tunnel.prototype.receive(blob);
```

- `(String) blob` is the blob to be received.

This method returns `true` on success and `false` on failure.
It decodes the `blob` string into the `data` object and receives
it from the remote side.

There are three variants on how to send/receive data, the latter
is the preferred and recommended one:

- If the `service` object is `null`, the remote side triggers the [receive](#events-receive) event.
- If the `service` object has a valid `(String) id` and a valid `(String) method`, the remote side's service's method will be called.
- If the `service` object has a valid `(String) id` and a valid `(String) event`, the remote side's service's event will be triggered.

```javascript
// Simulating the remote side
var blob   = lychee.data.JSON.encode({
	foo: 'bar'
});

var tunnel = new lychee.net.Tunnel({
	codec: lychee.data.JSON
});

tunnel.bind('receive', function(data) {
	console.log(data);
}, this);

tunnel.receive(blob); // true
```



= methods-setBinary

```javascript
(Boolean) lychee.net.Tunnel.prototype.setBinary(binary);
```

- `(Boolean) binary` is a flag. If set to `true`, all data is encoded as `binary`. If set to `false`, all data is encoded as `utf-8`.

This method returns `true` on success and `false` on failure.
It will set the [binary](#properties-binary) property of the instance.

```javascript
var tunnel = new lychee.net.Tunnel();

tunnel.binary;          // false
tunnel.setBinary(true); // true
tunnel.binary;          // true
```



= methods-setHost

```javascript
(Boolean) lychee.net.Tunnel.prototype.setHost(host);
```

- `(String) host` is the host for the socket.

This method returns `true` on success and `false` on failure.
It will set the [host](#properties-host) property of the instance.

```javascript
var tunnel = new lychee.net.Tunnel();

tunnel.host;               // 'localhost'
tunnel.setHost('1.3.3.7'); // true
tunnel.host;               // '1.3.3.7'
```



= methods-setPort

```javascript
(Boolean) lychee.net.Tunnel.prototype.setPort(port);
```

- `(Number) port` is the port for the socket.

This method returns `true` on success and `false` on failure.
It will set the [port](#properties-port) property of the instance.

```javascript
var tunnel = new lychee.net.Tunnel();

tunnel.port;          // 1337
tunnel.setPort(1338); // true
tunnel.port;          // 1338
```



= methods-setReconnect

```javascript
(Boolean) lychee.net.Tunnel.prototype.setReconnect(reconnect);
```

- `(Number) reconnect` is the timeout in milliseconds until the disconnected instance reconnects. If set to a greater value than `0`, reconnects are active.

This method returns `true` on success and `false` on failure.
It will set the [reconnect](#properties-reconnect) property of the instance.

```javascript
var tunnel = new lychee.net.Tunnel();

tunnel.reconnect;          // 0, disabled
tunnel.setReconnect(1337); // true
tunnel.reconnect;          // 1337
```



= methods-addService

```javascript
(Boolean) lychee.net.Tunnel.prototype.addService(service);
```

- `(lychee.net.Service) service` is a [lychee.net.Service](lychee.net.Service) instance.

This method returns `true` on success and `false` on failure.
It will add the service to the internal service pool, whose services
are trigger-able via their service [id](lychee.net.Service#properties-id) property.

```javascript
var tunnel  = new lychee.net.Tunnel();
var service = new lychee.net.Service('my-service', tunnel, lychee.net.Service.TYPE.client);


service.bind('my-event', function(data) {
	console.log(data);
});

tunnel.addService(service);

// This has to be executed on the remote side
tunnel.send({ foo: 'bar' }, {
	id:    'my-service',
	event: 'my-event'
});
```



= methods-getService

```javascript
(null || lychee.net.Service) lychee.net.Tunnel.prototype.getService(id);
```

- `(String) id` is the unique service identifier from a service in the internal service pool.

This method returns a `lychee.net.Service` instance on success and `null` on failure.
It returns the `lychee.net.Service` that matches the specified criteria.

```javascript
var tunnel  = new lychee.net.Tunnel();
var service = new lychee.net.Service('bar', tunnel, lychee.net.Service.TYPE.client);

tunnel.addService(service);

tunnel.getService('foo');             // null
tunnel.getService('bar');             // lychee.net.Service
tunnel.getService('bar') === service; // true
```



= methods-removeService

```javascript
(Boolean) lychee.net.Tunnel.prototype.removeService(service);
```

- `(lychee.net.Service) service` is a [lychee.net.Service](lychee.net.Service) instance.

This method returns `true` on success and `false` on failure.
It will remove the service from the internal service pool.

```javascript
var tunnel  = new lychee.net.Tunnel();
var service = new lychee.net.Service('my-service', tunnel, lychee.net.Service.TYPE.client);

tunnel.removeService(service); // false
tunnel.addService(service);    // true
tunnel.removeService(service); // true
```

