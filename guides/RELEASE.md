
# Release Guide for lychee.js

1. [Configure Token](#configure-token)
2. [Log in NPM](#log-in-npm)
3. [Update lychee.js](#update-lycheejs)
4. [Release lychee.js](#release-lycheejs)


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


## Log in NPM

The NPM package manager is some kind of bloat, as it is
not integrated with `git` and neither with `github` and
therefore has its own publishing process.

In order to have a machine setup for a successful `npm publish`,
it is necessary to execute an initial `npm login` first.

The account name for NPM is [~artificial-engineering](https://www.npmjs.com/~artificial-engineering).
Contact [@cookiengineer](https://github.com/cookiengineer) to
get a login token for your machine.

```bash
npm login;

# Username: artificial-engineering
# Password: Contact @cookiengineer
# Email: robot [ insert an at here ] artificial.engineering
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

