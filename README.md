
### Work-in-progress features for next minor release v0.8.3

- Debugger integration to Dashboard
- html-webgl platform finalization (webgl2d refactor)
- html-cordova platform finalization
- Game Boilerplate needs broadcast demo *Touch to create random Highscore*
- Automatized APIdoc generation
- Automatized Fuzz test suite


# lycheeJS (v0.8.2)

lycheeJS is a JavaScript Game library that offers a
complete solution for prototyping and deployment
of HTML5 Canvas, WebGL or native OpenGL(ES) or libSDL2
based games inside the Web Browser or native runtimes.

The development process is optimized for Google Chrome
and its developer tools.


# Installation

- Download and install the newest stable release of NodeJS from [nodejs.org](http://nodejs.org).

- Download lycheeJS via [zip-file](https://github.com/LazerUnicorns/lycheeJS/archive/master.zip)
and extract its contents to **~/lycheeJS**.

### < Important >

The *nodejs* command on Linux is the new NodeJS version (with included npm).
You should always use that on Linux, because *node* is probably an old NodeJS build.
Other operating systems may use the *node* command, so you might to replace it there accordingly.

The port range 0-1024 is reserved for root user. To prevent running nodejs as root
(for exploit and remote shell prevention reasons), you might want to allow nodejs to
bind to those ports in production to serve port 80 successfully without getting an
*EACCESS* error.

```bash

# DO NOT EXECUTE THIS IF YOU DON'T KNOW WHAT IT DOES. READ ABOVE

user@box:~$ which nodejs
/usr/bin/nodejs
user@box:~$ sudo setcap cap_net_bind_service=+ep /usr/bin/nodejs
user@box:~$ sudo getcap /usr/bin/nodejs
/usr/bin/nodejs = cap_net_bind_service+ep
```

### < / Important >


- Navigate to the folder in the shell (or PowerShell) and execute the configure script
to build the lycheeJS core:

```bash
cd ~/lycheeJS;
nodejs ./tool/configure.js; # Important: current working directory is lycheeJS root folder
```

- After building the core, you are ready to go. Start Sorbet via:

```bash
cd ~/lycheeJS;
nodejs ./tool/Sorbet.js localhost; # see ./sorbet/profile folder for alternative profiles
```

- Open your Web Browser, navigate to **http://localhost:8080** or try out the Dashboard
at [http://dashboard.lycheejs.org](http://dashboard.lycheejs.org) and have fun :)

Those games show you how to develop real cross-platform games and the best practices
in high-performant JavaScript code. [Link to projects folder](./projects)


# Getting Started

**Note**: A project's server is a websocket server, no webserver.

The best way to get started is to clone the Boilerplate.

```bash
cd ~/lycheeJS/projects;
cp -R ./boilerplate ./myproject; # Replace myproject with your unique name
```

Each project has a unique identifier (e.g. /projects/boilerplate has the identifier **boilerplate**).
This identifier is used to integrate the project with:

- sorbet.net.remote.Debugger (Remote Debugger Service)
- sorbet.net.remote.Session (Remote Session Service)
- sorbet.module.Fertilizer (Continous Integration Cross-Compiler Build Service)
- sorbet.module.Server (Server Auto-Configuration Service and REST API)
- sorbet.module.Log (Project Statistics Service and REST API)

In order to integrate your project with all these capabilities and the Dashboard,
you will have to modify the game.Main's settings.client property accordingly.
A project's folder name is equivalent to its unique identifier.


```javascript
  var settings = {
    // ./projects/myproject/source/Main.js#L19
    client: '/api/server?identifier=myproject', // Replace myproject with the correct identifier
  };
```


# Documentation

The documentation is available online at [http://lycheejs.org/docs](http://lycheejs.org/docs).


# Other (unsupported) JavaScript Runtimes

The lycheeJS architecture is independent of the environment which
means it will run on any theoretical JavaScript environment.

The only requirement for such a platform is a fully implemented
[bootstrap API](http://lycheejs.org/docs/api-bootstrap.html).

For fully supporting a client-side environment, you will also have to implement
a [lychee.Input](http://lycheejs.org/docs/api-lychee-Input.html),
a [lychee.Renderer](http://lycheejs.org/docs/api-lychee-Renderer.html),
a [lychee.Storage](http://lycheejs.org/docs/api-lychee-Storage.html),
and a [lychee.Viewport](http://lycheejs.org/docs/api-lychee-Viewport.html).

These implementations are fully optional and only necessary if you are using
them inside your Game or App.


# Other (non-Sorbet) Web Server Environments

The lycheeJS architecture depends on different file types served as **application/json**.
These file types are:

- **Attachment.fnt**: Font Serialization Objects
- **lychee.env**: A Serialization Object used for [lychee.Enviroment](http://lycheejs.org/docs/api-lychee-Environment.html)
- **lychee.pkg**: A Serialization Object used for [lychee.Package](http://lycheejs.org/docs/api-lychee-Package.html)
- **lychee.store**: A Serialization Object used for [lychee.Storage](http://lycheejs.org/docs/api-lychee-Storage.html)


# License

The lycheeJS framework is licensed under MIT License.

