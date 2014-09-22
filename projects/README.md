
## Getting Started

First of all, a project's server is a websocket server, not a webserver.
The best way to get started is to clone the Boilerplate.

```bash
cd ~/lycheeJS/projects;
cp -R ./boilerplate ./myproject; # Replace myproject with a unique name
```

Each project has a unique identifier (e.g. /projects/boilerplate has the
identifier **boilerplate**). A project's folder name is equivalent to
its unique identifier.

This identifier is used to integrate the project with sorbet's remote
debugging and continous integration components. In order to integrate
your project with all these capabilities and the Dashboard, you will
have to modify the game.Main's settings.client property accordingly.

```javascript
  var settings = {
    // ./projects/myproject/source/Main.js#L16
    client: '/api/server?identifier=boilerplate', // Replace boilerplate with correct identifier
  };
```

It is wise to change the identifier of the lychee.Environment
in order to find debugging reports in the remote debugger and the
lycheeJS Dashboard.

```html
  var environment = new lychee.Environment({
    // ./projects/myproject/source/index.html#L48
	id: 'boilerplate', // Replace boilerplate with correct identifier
  });
```

