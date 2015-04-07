
# Features Roadmap

This document shows the planned features for upcoming lycheeJS releases.
Only if all features are completed, the lycheeJS release is merged
back into master, tagged and published.


## v0.8.6

- /lychee/dist build via configure script for CDNJS and standalone deployment
- sorbet.plugin.Fertilizer should auto-build environments for all projects
- Sorbet Log File serialization to be inspectable and remote-debuggable via ranger
- lychee.net.(client||remote).DHT as described in Bittorrent's DHT protocol [1] which extends lychee.data.BENCODE for its logical behaviours
- API + Implementation: lychee.net.Hybrid

## v0.8.7

- Debugger Tool: Timeline Analysis of Snapshots (live-edit and live-modification)
- lychee.net.remote.Controller and lychee.net.client.Controller
- API + Implementation: lychee.game.Logic
- API + Implementation: lychee.game.Physic
- API + Major Refactor: lychee.verlet Stack

## v0.8.8

- LethalMaze Game finalization (auto-join and auto-matchmaking multiplayer)
- Fertilizer: html-cordova for Android, iOS and Blackberry

## Backlog

- Blitzkrieg Game finalization (auto-connect 4 players and let them play against each other)
- Mode7 Game finalization (lane switch), required assets: racing car, box sprite, explosion sprite
- API: lychee.Renderer
- API: lychee.Storage
- API: lychee.data Stack
- API: lychee.game Stack
- API: lychee.ui Stack
- API + Implementation: lychee.data.BSON
- API + Implementation: lychee.data.MSGPACK
- Fertilizer: html-webgl Refactor (webgl2d refactor)


## References (Articles and Sources)

1. [DHT Protocol Specification](http://www.bittorrent.org/beps/bep_0005.html)
2. [Mainline DHT on wikipedia](http://en.wikipedia.org/wiki/Mainline_DHT#Routing_Table)
3. [webtorrent implementation](https://github.com/feross/bittorrent-dht)
4. [chrome app websocket server](https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/websocket-server)

