
# lycheeJS (2015-Q4)


## Overview

lycheeJS is a Next-Gen Isomorphic Application Engine that
offers a complete solution for prototyping and deployment
of HTML5, native OpenGL, native OpenGLES and libSDL2 based
applications.

The project has the goal to ease up development of applications
and shipment to further platforms. The development process is
optimized for Blink-based browsers (Chromium, Google Chrome,
Opera) and their developer tools.


**Target Platforms / Fertilizers**

| Target       | Fertilizer                   | Package  | arm | x64 |
|:-------------|:-----------------------------|:---------|:---:|:---:|
| Browser      | html                         |          |  ✓  |  ✓  |
| Linux        | html-nwjs, node, node-sdl    | bin      |  ✓  |  ✓  |
| OSX          | html-nwjs, node              | app, bin |     |  ✓  |
| Windows      | html-nwjs, node              |          |     |  ✓  |
| Android      | html-webview, node, node-sdl | apk, bin |  ✓  |  ✓  |
| BlackberryOS | html-webview, node, node-sdl | apk, bin |  ✓  |  ✓  |
| FirefoxOS    | html-webview                 | zip      |  ✓  |  ✓  |
| iOS          |                              |          |     |     |
| Ubuntu Touch | html-webview, node, node-sdl | deb, bin |  ✓  |  ✓  |

The iOS Fertilizer has currently no support for cross-compilation
due to XCode limitations. You can still create an own WebView iOS
app and use the `html` platform adapter.
The [lycheeJS-runtime](https://github.com/Artificial-Engineering/lycheeJS-runtime.git)
repository contains all binary pre-compiled runtimes included
in the bundles.
The [lycheeJS-bundle](https://github.com/Artificial-Engineering/lycheeJS-bundle.git)
repository contains all logic required to generate operating
system ready bundles.


## Bundle Installation

There are prebuilt bundles that ship all dependencies and
runtimes lycheeJS needs in order to work and cross-compile
properly. These bundles should be installed on the developer's
machine and not on the target platform. Visit [lycheejs.org](http://lycheejs.org)
for a list of available bundles.


## Manual Installation

The netinstall shell script allows to automatically install
lycheeJS on any machine (arm, x86 or x86\_64). The only
requirement for the script is `curl` and `unzip`.

```bash
# This will create a lycheeJS Installation in ./lycheejs
wget -q -O - http://lycheejs.org/download/lycheejs-latest-netinstall.sh | bash;
```


## Contributor Installation

```bash
sudo mkdir -m 0777 /opt/lycheejs-edge;
cd /opt/lycheejs-edge;

git clone https://github.com/Artificial-Engineering/lycheeJS.git ./;
git checkout development;

git clone https://github.com/Artificial-Engineering/lycheeJS-runtime.git ./bin/runtime;

sudo ./bin/configure.sh;           # use --no-integration if you want a sandboxed installation
./bin/sorbet.sh start development; # no sudo required
```


## Contribution

You want to contribute to the project?
Take a look at the [CONTRIBUTION.md](asset/CONTRIBUTION.md) file.


## License

lycheeJS is (c) 2012-2016 Artificial-Engineering and released under MIT license.
The projects and demos are licensed under CC0 (public domain) license.
The runtimes are owned and copyrighted by their respective owners.

Take a look at the [LICENSE.txt](LICENSE.txt) file.

