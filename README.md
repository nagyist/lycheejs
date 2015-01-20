
# lycheeJS (v0.8.4)

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Gratipay][gratipay-image]][gratipay-url]

[npm-image]: https://img.shields.io/npm/v/lycheejs.svg
[npm-url]: https://npmjs.org/package/lycheejs

[downloads-image]: https://img.shields.io/npm/dm/lycheejs.svg
[downloads-url]: https://npmjs.org/package/lycheejs

[gratipay-image]: https://img.shields.io/gratipay/martensms.svg
[gratipay-url]: https://gratipay.com/martensms/


lycheeJS is a JavaScript Game library that offers a
complete solution for prototyping and deployment
of HTML5 Canvas, WebGL or native OpenGL(ES) or libSDL2
based games inside the Web Browser or native runtimes.

The development process is optimized for Blink-based
browsers (Chromium, Google Chrome, Opera) and their
developer tools.


## Installation

The *client-side* lycheeJS Engine Stack is supporting
all Operating Systems that can execute JavaScript.

The *server-side* CDN, CI-, Web-, and Websocket Stack though
is only supporting Linux and Mac OSX due to sandboxing and
cross-compilation reasons. Windows also can't support SPDY
and WebSocket extensions without Ephermal Port issues.

Always remember, there's no client-side and server-side
application code whatsoever, because all the network components
can be used on either side and peer-to-peer. That means you
can run a native build on Windows using the client-side and
server-side stack.


### 1. Download lycheeJS

- Download and install the newest stable release of
NodeJS from [nodejs.org](http://nodejs.org).

- Download lycheeJS via [zip-file](https://github.com/LazerUnicorns/lycheeJS/archive/master.zip)
and extract its contents to **~/lycheeJS**.

```bash
wget https://github.com/LazerUnicorns/lycheeJS/archive/master.zip;
unzip lycheeJS-master.zip;
mv lycheeJS-master ~/lycheeJS;
```

- Make sure the lycheeJS-master folder contained in the
zip-file is renamed to lycheeJS to follow up with the
tutorials.


### 2. Start lycheeJS

- After building the core, you are ready to go. Start Sorbet,
the lycheeJS webserver:

```bash
user@box:~$          cd ~/lycheeJS;
user@box:~/lycheeJS$ nodejs ./tool/configure.js;
user@box:~/lycheeJS$ npm start;
```

- Open your Web Browser and navigate to **http://localhost:8080**
to open the lycheeJS welcome page. The shipped [example projects](./projects)
show you best practices on how to develop cross-platform games.


### 3. Install Fertilizers (optional)

By default, lycheeJS ships with the HTML and NodeJS Fertilizers.

If you want more cross-compilation build targets, you need to run
this command to install those from the
[lycheeJS-fertilizers repository](https://github.com/LazerUnicorns/lycheeJS-fertilizers):

```bash
user@box:~$          cd ~/lycheeJS;
user@box:~/lycheeJS$ nodejs ./tool/install-fertilizers.js
```


### 4. Deployment on a Server (optional)

lycheeJS and Sorbet can also be integrated with your root server.

It is recommended to use the daemon setup on production environments
and to use the npm setup on development environments.

The daemon setup integrates better with Debian / Ubuntu systems and
features daily automatic updates with your git repository.

#### 4.a) Daemon Setup

The profile parameter is equivalent to the available profiles in
**~/lycheeJS/sorbet/profile/[profile.json]**:

```bash
user@box:~$          cd ~/lycheeJS;
user@box:~/lycheeJS$ sudo ./tool/ubuntu/install.js --profile=localhost.json;
user@box:~$          sudo /etc/init.d/sorbet restart;
```

#### 4.b) NPM Setup

You can modify the **~/lycheeJS/package.json**/*scripts* section to
use your own sorbet profile. Take a look at the examples *localhost*
or *lycheejs.org*:

```bash
# This is identical to npm start, but will run forever
user@box:~$          cd ~/lycheeJS;
user@box:~/lycheeJS$ npm run-script localhost;
```


## Tutorials

There are plenty of tutorials available at
[http://lycheejs.org/tutorials](http://lycheejs.org/tutorials).


## Documentation

The documentation is available online at
[http://lycheejs.org/documentation/index.html](http://lycheejs.org/documentation).


## Roadmap

You want to see what kind of fancy features will arrive next?
Take a look at the [ROADMAP.md](ROADMAP.md) file.


## Contribution

You want to contribute to the project?
Take a look at the [CONTRIBUTING.md](CONTRIBUTING.md) file.


## Other (unsupported) JavaScript Runtimes

The lycheeJS architecture is independent of the environment which
means it will run on any theoretical JavaScript environment.

The only requirement for such a platform is a fully implemented
[bootstrap API](http://lycheejs.org/documentation/api-bootstrap.html).

For fully supporting a client-side environment, you will also have to implement
a [lychee.Input](http://lycheejs.org/documentation/api-lychee-Input.html),
a [lychee.Renderer](http://lycheejs.org/documentation/api-lychee-Renderer.html),
a [lychee.Storage](http://lycheejs.org/documentation/api-lychee-Storage.html),
and a [lychee.Viewport](http://lycheejs.org/documentation/api-lychee-Viewport.html).

These implementations are fully optional and only necessary if you are using
them inside your Game or Application.


## License

The lycheeJS framework is licensed under the MIT License.
The projects and demos are licensed under the CC0 (public domain) License.

