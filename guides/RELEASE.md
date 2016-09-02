
# Release Guide for lychee.js

1. [Configure Token](#configure-token)
2. [Update lychee.js](#update-lycheejs)
3. [Release lychee.js](#release-lycheejs)


## Configure Token

The Maintenance scripts require a configured GitHub Access
Token. You must be member of the [Artificial-Engineering](https://github.com/Artificial-Engineering)
organization and the [Personal Access Token](https://github.com/settings/tokens)
with `repo` rights must be available in the `.github/TOKEN`
file:

```bash
cd /opt/lycheejs;

echo "MY-PERSONAL-ACCESS-TOKEN" > .github/TOKEN;
```


## Update lychee.js

The `development` branch is the branch that is the newest HEAD
and gets merged back to `master` with a single squashed release
commit.

Before a release is created the update tool has to be executed:

```bash
cd /opt/lycheejs;

# Branch should have been on development already
git checkout development;

./bin/maintenance/do-update.sh;
```


## Release lychee.js

The lychee.js Release Tool is a wizard that automatically updates
and creates the quaterly releases for everything including:

- lycheejs (Engine repository)
- lycheejs-runtime (update and publish on github)
- lycheejs-library (publish on NPM and Bower)
- lycheejs-harvester (build and publish on github)
- lycheejs-website (build and publish on github)

```bash
cd /opt/lycheejs;

./bin/maintenance/do-release.sh;
```

