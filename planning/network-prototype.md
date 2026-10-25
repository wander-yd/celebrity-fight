# Two-device network validation · 0.4.0 / Build48

## Frozen scope

- One arena, one Boss device, one Hunter device, one practice session.
- The Boss host runs `Arena.step`, receives Hunter input and owns damage/health/reset state.
- The Hunter sends only normalized movement/attack intentions and renders host snapshots.
- Existing touch/keyboard adapters remain the input sources.
- No jump for the remote Hunter in this first pass; no multiplayer progression, scoring, matchmaking, database, anti-cheat or paid hosting.
- PeerJS Cloud provides signaling; WebRTC data channel carries gameplay packets peer-to-peer. A TURN relay is deliberately out of scope.

## What is implemented

`dist/network.js` owns peer setup, message version/sequence checks, 30Hz input send, 15Hz host snapshots, room UI status, input sanitization, snapshot serialization and disconnect state. `dist/core.js` accepts an optional network Hunter command in Boss Practice while preserving the existing AI when no command is supplied. Actor references in melee snapshots are encoded by role and restored against each browser's own actor records. `dist/debug.js` adds host/join. The main game loop does not advance on the Hunter client.

## Verification so far

- `node tests/run.cjs`: passed, including historical combat parity and the network authority/snapshot test.
- Browser fixtures verify the DOM and script wiring; they do not load the public PeerJS Cloud or prove two-device connectivity.
- Real playtest still needs two devices on the deployed version: host, copy code, join, move/attack from Hunter, observe both views/health, disconnect, then leave/restart.

## Rollback

Restore the saved Build47 Site version and its exact source commit (`507e2735bd936fd90e5183eb63d37d0ce5da544f`) if campaign or existing Boss Practice behavior regresses. Do not infer publication IDs or claim connectivity until the Sites result and real device test exist.
