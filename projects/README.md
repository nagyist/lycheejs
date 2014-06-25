
## (Your) lycheeJS Projects

This is the folder to put your lycheeJS projects in.
If you don't know what to do, you may start cloning the [Game Boilerplate](./boilerplate).

```bash
cd /var/www/lycheeJS;
cd ./projects; # This folder
cp -R ./boilerplate ./myproject; # Replace myproject with your unique name
```

Each project has a unique identifier (e.g. /projects/boilerplate has the identifier **boilerplate**).
This identifier is used to integrate the project with:

- sorbet.net.remote.Debugger (Remote Debugger Service)
- sorbet.net.remote.Session (Remote Session Service)
- sorbet.module.Project (Continous Integration Build Service)
- sorbet.module.Server (Server Auto-Configuration Service and REST API)
- sorbet.module.Log (Project Statistics Service and REST API)

In order to integrate your project with all these capabilities and the Dashboard,
you will have to modify the game.Main's settings.client property accordingly.
A project's folder name is equivalent to its unique identifier.


```javascript

  var settings = {
  
    // ./projects/myproject/source/Main.js#L19
    client: '/api/Server?identifier=myproject', // Replace myproject with the correct identifier
  
  };

```

