# The Donald — Void Arena

A buildless browser game. The intended rules and change boundaries live in `SPEC.md`; the current handoff is `planning/current-state.json`.

## Source map

| File | Responsibility |
| --- | --- |
| `dist/core.js` | Pure combat simulation, shared ability/item definitions and generated item descriptions |
| `dist/timing.js` | Fixed 60 Hz simulation clock, bounded stall recovery |
| `dist/state.js` | Shared browser state and canvas/overlay references |
| `dist/render.js` | Character art and ordered canvas drawing passes |
| `dist/ui.js` | Menus, HUD text and sound |
| `dist/debug.js` | Pausing Debug & Codex dialog |
| `dist/input.js` | Keyboard, mouse, touch and interruption handlers |
| `dist/game.js` | Clock integration and startup |
| `dist/styles.css` | Page, arena, menus and Codex styling |
| `dist/index.html` | Page structure and explicit classic-script load order |

No framework, bundler, install step or runtime dependency is required. Keep the script order in `index.html`; `game.js` creates the clock and Debug dialog, then binds input and starts the application after the other scripts load. Formatting tools are not required to run or publish the game.

## Verification

Run from the repository root:

```sh
node tests/run.cjs
```

The suites cover simulation rules, HTML-backed DOM fixtures, frame-rate timing, historical combat/render parity, and CSS cleanup. Historical comparisons use the v22 commit already in Git history and require no network.

The DOM/canvas fixture is deliberately limited: it catches missing or unmounted element IDs and loads the actual shipped scripts, but cannot verify browser layout, native input behavior or game feel. Those require a browser/device playtest.

When editing rendering, preserve the threat layers: ground → actors/effects → jump indicator → hostile projectiles → HUD. Keep gameplay numbers in `PLAYER_ABILITIES` and read those definitions in descriptions instead of copying numeric text.
