
# lycheeJS (v0.7)

lycheeJS is a JavaScript Game library that offers a
complete solution for prototyping and deployment
of HTML5 Canvas, WebGL or native OpenGL(ES) based
games inside the Web Browser or native environments.

The development process is optimized for Google Chrome
and its developer tools.


# Installation

- Download and install the newest stable release of NodeJS from [nodejs.org](http://nodejs.org).

- Download lycheeJS via [zip-file](https://github.com/martensms/lycheeJS/archive/master.zip)
and extract its contents to **/var/www/lycheeJS**.

- Navigate to the folder in the shell (or PowerShell) and execute:

```bash
cd /var/www/lycheeJS;
./forge.sh start
```

- Open your Web Browser, navigate to **http://localhost:8080** or try out the examples
at [forge.lycheeJS.org](http://forge.lycheeJS.org) and have fun :)

Those games show you how to develop real cross-platform games and the best practices
in high-performant JavaScript code.

[Link to examples on github](https://github.com/martensms/lycheeJS/tree/master/game)


# Documentation

The documentation is online available at [http://lycheejs.org/docs](http://lycheejs.org/docs)
or in the [lycheejs.org github repository](https://github.com/martensms/lycheejs.org)


# License

The lycheeJS framework is licensed under MIT License.


### lycheeJS-ADK (App Development Kit)

The [lycheeJS ADK](http://github.com/martensms/lycheeJS-adk)
is the underlying framework to deliver platforms natively.

The ADK allows you to cross-compile to different platforms
natively using a custom V8 based JIT runtime with OpenGL
bindings as the target environment. The equivalent environment
integration is the platform/v8gl inside the lycheeJS Game library.


### Other (yet unsupported) JavaScript environments

**The lycheeJS architecture is independent of the environment which
means it will run on any theoretical JavaScript environment.**

The only requirement for such a platform is a fully implemented
[lychee.Preloader](http://lycheejs.org/docs/api-lychee-Preloader.html)
API.

As the lychee.Preloader itself is inside the core, you only need
to implement the [lychee.Preloader.\_load](http://lycheejs.org/docs/api-lychee-Preloader.html#lychee-Preloader-_load)
method.

For fully supporting a client-side environment, you will also
have to implement a [lychee.Renderer](http://lycheejs.org/docs/api-lychee-Renderer.html),
a [lychee.Input](http://lycheejs.org/docs/api-lychee-Input.html),
and a [lychee.Jukebox](http://lycheejs.org/docs/api-lychee-Jukebox.html);
but these are fully optional and only necessary if you are using
them inside your Game or App.

