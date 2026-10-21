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

## Game layout

The arena is the only page layout and fits the visual viewport from initial load. No Page view or layout-switch controls remain. The world keeps its original960×600 coordinates; the displayed viewport clips only the old top72px HUD region (960×528 remains visible). Mouse/touch aiming uses the full canvas rectangle. Never resize the simulation or crop the bottom edge to fit a screen.

Resume leads Pause; Controls and Build are native collapsed details. Phone upgrade choices stack. Browser/device checks remain required for visual quality and touch comfort.

## Release history

`dist/releases.js` is the single human-maintained source for the Updates tab. Add one newest-first entry per published release, bump currentVersion (Sites Build), displayVersion and HTML asset queries together, and keep notes to one or two player-visible changes. Dates use Asia/Kuala_Lumpur. Record actual verification limits. No background fetch, local history or automatic code-change tracking is used.

For each historical entry, copy savedVersionId and commitSha from Sites list_site_versions/get_site_version. The current release cannot embed its own resulting Git SHA or saved ID: it resolves through projectId + currentVersion using Sites version discovery; fill its exact references when preparing the next release. Never guess references. Rollback is a separate, explicitly requested Sites action; this tab is read-only. Older versions may lack later bug fixes (notably v30 reward visibility).

From Build33 onward, displayVersion uses 0.feature.patch: small fixes/UI cleanup increment patch, meaningful new features increment feature and reset patch. Reserve1.0.0 for an explicitly approved release milestone; no Alpha/Beta labels. Historical v22–v32 entries keep their original numbers.

## GitHub backup workflow

Sites remains the publishing source. GitHub is a one-way private backup of the same Git history, not a second editable game or a second deployment. See [backup and restore](docs/backup-and-restore.md). Exact published SHAs, Sites saved IDs and tag names are recorded in `planning/published-versions.json`.

Setup status: prepared; repository creation and authenticated Git push are still pending. Do not report the backup as complete until GitHub branch and tags have been independently verified.
