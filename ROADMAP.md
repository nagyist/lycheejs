
# Features Roadmap

The features listed here are not implemented.
This document shows the planned features for upcoming lycheeJS releases.
Only if all features are completed, the lycheeJS release is merged
back into master, tagged and published.


## v0.8.5

- Website: Overhauling and Architecture Diagrams
- Sorbet Log File serialization (sorbet.data.LOG encode/decode that runs every 5 minutes)
- lychee.net.remote.Peer (has own lychee.Storage instance and stores all peers in a /project-specific/lychee.store)
- sorbet.api.remote.Peer (returns an Array of project-specific Peer Servers, based on project identifier)
- Project Tool (inspects and verifies integrity of lychee.pkg files)
- Inspector Tool: Timeline State (that shows bind/trigger/unbind calls)
- Mode7 Game finalization (lane switch), required assets: racing car, box sprite, explosion sprite
- Color Game finalization (UI, Timeout and Point Calculation)
- lychee.Environment needs serializable injection API

## v0.8.6

- Dispenser CLI Tool (creates Templates and validates API Docs of a Definition)
- Blitzkrieg Game finalization (auto-connect 4 players and let them play against each other)
- lychee.net.remote.Controller and lychee.net.client.Controller
- lychee.game.Logic
- lychee.game.Physic
- lychee.verlet Stack serialization and finalization
- lychee.net.Protocol Ping/Pong verification
- html-webgl platform finalization (webgl2d refactor)
- Automatized Fuzztest suite (based on API docs)

## v0.8.7

- sorbet.module.Fertilizer needs injection references (and internal cache)
- Sorbet needs major support for Content-Security-Policy
- sorbet.module.Blacklist integration with Content-Security-Policy


# References (Articles and Sources)


