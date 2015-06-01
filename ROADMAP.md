
# Features Roadmap

This document shows the planned features for upcoming lycheeJS releases.
Only if all features are completed, the lycheeJS release is merged
back into master, tagged and published.


## v0.8.6

- Debugger Service needs integration for Editor and Ranger
- Debugger Service needs clear functionality of outdated remotes from orphaned server instances


## v0.8.7

- sorbet.mod.Fertilizer should auto-build environments for all projects
- lychee.net.remote.Controller and lychee.net.client.Controller
- API + Major Refactor: lychee.verlet Stack
- LethalMaze Game finalization (auto-join and auto-matchmaking multiplayer)


## v0.8.8

- lychee.net.(client||remote).DHT as described in Bittorrent's DHT protocol [1] which extends lychee.data.BENCODE for its logical behaviours
- API + Implementation: lychee.net.Hybrid


## Backlog

- Debugger Tool: Timeline Analysis of Snapshots (live-edit and live-modification)
- Blitzkrieg Game finalization (auto-connect 4 players and let them play against each other)
- Mode7 Game finalization (lane switch), required assets: racing car, box sprite, explosion sprite
- API + Implementation: lychee.game.Logic
- API + Implementation: lychee.game.Physic
- API: lychee.Renderer
- API: lychee.Storage
- API: lychee.data Stack
- API: lychee.game Stack
- API: lychee.ui Stack
- API + Implementation: lychee.data.BSON
- API + Implementation: lychee.data.MSGPACK
- Fertilizer: html-webview support for iOS webview runtime
- Fertilizer: html-webgl Refactor (webgl2d refactor)


## References (Articles and Sources)

1. [DHT Protocol Specification](http://www.bittorrent.org/beps/bep_0005.html)
2. [Mainline DHT on wikipedia](http://en.wikipedia.org/wiki/Mainline_DHT#Routing_Table)
3. [webtorrent implementation](https://github.com/feross/bittorrent-dht)
4. [chrome app websocket server](https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/websocket-server)

