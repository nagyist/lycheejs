
# Contribution Workflow for lycheeJS Developers

Upcoming feature requests are better stored in their own branch, so
we can make usage of pull requests on github.

First, you have to fork the project on github to your own repository.
This allows you to work on the feature before the decision of merging
it in was done.

![How to create a Fork](./howto-fork.png)

This example shows how the feature branches work.
Replace *yourname* accordingly with your github username.
Replace *fancy-feature* accordingly with a better description for your
feature.


```bash
git clone git@github.com:YourName/lycheeJS.git;
cd lycheeJS;
git checkout development;
git checkout -b fancy-feature;

# BEGIN of your own work
echo "foo" > ./worksimulation.txt;
git add worksimulation.txt;
git commit -m "Meaningful description";
# END of your own work

# After some days of work, make sure you are up-to-date
git pull https://github.com/Artificial-Engineering/lycheeJS.git development;

# The final push to your github repository before your pull request
git push origin fancy-feature;

```

Now you can go on github to your repository and switch to the
*fancy-feature* branch. After you did that, there's a new green
button appearing with the label **Compare & pull request**.

![How to create a Pull Request](./howto-pullrequest.png)

Click on it, now you have to fill out the form with the description.
After that, we can now automatically merge in your implemented
features.


# Reserved Branches

- the *development* branch is reserved for the master repository.
- the *2XXX-QX* branch scheme is reserved for build bots.


# Contribution to Documentation

If you want to contribute to the documentation, please use the guide in the
**Contribution Workflow** and replace *fancy-feature* with *documentation-thetitle*.

The main guide for documentation is that all the files have the same structure.
For automatic parsing purposes, the structure of articles shall have the
identical structure and wordings.

The folder structure is setup like this:

```javascript

if (exists('/lib/lychee/source/game/Entity.js') && !exists('/lib/lychee/api/game/Entity.md')) {
    contributor.writeAPIDocs('lychee.game.Entity');
}

```
