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

The suites cover simulation rules, HTML-backed DOM fixtures, frame-rate timing, historical combat/world-render parity, CSS structure and UI/UX geometry/flows. Historical comparisons use the v22 commit already in Git history and require no network.

The DOM/canvas fixture is deliberately limited: it catches missing or unmounted element IDs and loads the actual shipped scripts, but cannot verify browser layout, native input behavior or game feel. Those require a browser/device playtest.

When editing rendering, preserve the threat layers: ground → actors/effects → jump indicator → hostile projectiles; readable HUD text and the touch Jump control live in DOM bars outside the world. Keep gameplay numbers in `PLAYER_ABILITIES` and read those definitions in descriptions instead of copying numeric text.

## Play mode

Start automatically enters Play mode, which collapses page branding and fits the arena to the visual viewport. Menus offer Page view / Play mode; the toolbar also has a view toggle. The world keeps its original960×600 coordinates. The displayed viewport clips only the old top72px HUD region (960×528 remains visible); mouse/touch aiming uses the full canvas rectangle. Never resize the simulation or crop the bottom edge to fit a screen.

Resume leads the Pause menu; Controls and Build are native collapsed details. Phone upgrade choices stack and show an action summary before full effects. Browser/device checks remain required for visual quality and touch comfort.
