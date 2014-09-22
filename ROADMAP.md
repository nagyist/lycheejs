
# Features Roadmap

The features listed here are not implemented.
This document shows the planned features for upcoming lycheeJS releases.
Only if all features are completed, the lycheeJS release is merged
back into master, tagged and published.


## v0.8.4

- lychee.game.Logic
- lychee.game.Physic
- lychee.verlet Stack serialization and finalization
- html-webgl platform finalization (webgl2d refactor)
- html-cordova platform finalization
- Blitzkrieg Game with basic tanks interaction

## v0.8.5

- lychee.data.Markdown encoder/decoder
- Automatized API doc generation
- Automatized Fuzztest suite (based on API docs)

## v0.8.6

- Simulator for Dashboard
- Debugger for Dashboard (Remote-Debugging API UI)
- lychee.Environment needs serializable injection API
- sorbet.module.Fertilizer needs injection references (and internal cache)

## v0.8.7

- Sorbet needs major support for Content-Security-Policy
- sorbet.module.Blacklist integration with Content-Security-Policy

## v0.8.8

- port ws (*1*) project for identical API on html and nodejs
- lychee.net.Client for nodejs
- lychee.net.Protocol for nodejs (should work due to Buffer implementation in bootstrap.js)


# References (Articles and Sources)

1. [ws project](https://github.com/einaros/ws)

