
## Getting Started

The best way to get started is to clone the Boilerplate.

```bash
cd /path/to/lycheeJS/projects;
cp -R ./boilerplate ./myproject; # Replace myproject with a unique name
```

Each project has a unique identifier (e.g. /projects/boilerplate has the
identifier **boilerplate**). A project's folder name is equivalent to
its unique identifier.

It is wise to change the identifier for automatic port assignments
and debugger integration. There are two places where you need to change
the identifier:

```javascript
  var settings = {
    // ./projects/myproject/source/Main.js#L16
    client: '/api/server?identifier=boilerplate', // Replace boilerplate with correct identifier
  };
```

```javascript
  var environment = new lychee.Environment({
    // ./projects/myproject/source/index.js#L5
	id: 'boilerplate', // Replace boilerplate with correct identifier
  });
```

