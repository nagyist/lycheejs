
## Projects Folder

This folder contains all lycheeJS Projects.

Each Project has a unique identifier (its folder name) which is
also used as an identifier for the network connection initiated
by the `Harvester` and the `harvester.js` automatically.


### Initialize a Project

You can initialize a project using the `Breeder`.
The `Breeder` allows to manage your projects and its libraries
as dependencies.


```bash
cd /opt/lycheejs;

mkdir ./projects/my-project;
cd ./projects/my-project;

lycheejs-breeder init;
```


### Alternative: Fork the Boilerplate

Alternatively if you want to use the full isomorphic lycheeJS
stack, you can also fork the boilerplate and edit it with the
`Editor` afterwards.

```bash
cd /opt/lycheejs;

cp -R ./projects/boilerplate ./projects/my-project;
cd ./projects/my-project;

# Replace the identifier inside source/Main.js and source/index.js

sed -i.bak 's/boilerplate/my-project/g' ./my-project/source/Main.js;
sed -i.bak 's/boilerplate/my-project/g' ./my-project/source/index.js;
```

