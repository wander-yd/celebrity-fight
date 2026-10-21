# The Donald — Void Arena

A buildless browser game. The intended rules and change boundaries live in `SPEC.md`; the current handoff is `planning/current-state.json`.

## Source map

| File | Responsibility |
| --- | --- |
| `dist/core.js` | Pure combat simulation, shared ability/item definitions and generated item descriptions |
| `dist/timing.js` | Fixed 60 Hz simulation clock, bounded stall recovery |
| `dist/camera.js` | Pure fixed-area camera, soft edge target and world/screen projection |
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

The full visual viewport is the game screen. Hearts/menu controls and the Boss/Jump HUD float above the world with no reserved header/footer bars. HUD text stays at readable CSS sizes; only controls accept pointer events. The square arena interior is668×668 in728×728 world units (area within0.1% of the old904×494 arena). Spawns, movement, projectiles, health kits and two opposite conveyors share the same exported arena geometry.

`camera.js` is presentation-only: visible area270400 world units², exponential ground-follow10/s, soft edge overscan96. Portrait and landscape change the view shape, not its area or simulation. Near an edge, following gradually weakens; outside the arena is black. Rotation preserves the view center when possible and minimally corrects it if Donald would leave the new view. It never repositions entities or advances combat. New rooms snap the camera. Jump height affects art only.

Mouse aim is recomputed through the inverse of the same camera used for drawing, including a stationary cursor while the camera moves. Touch dragging uses CSS-screen deltas, independent of world scale. Resize releases stale touch/held-pointer input and discards clock catch-up. The backing canvas uses capped DPR2; CSS viewport and physical buffer size remain separate.

Tests include camera corner/inverse/equal-area/rotation cases and controlled interior combat parity vs Build35. Full-arena trajectories/render traces intentionally differ; the parity test excludes relocated conveyors, boundary contacts and long projectile travel while dedicated scenarios test their new geometry. Combat constants and character/enemy/weapon art remain compared. Preview used a desktop browser and390×844/844×390 game frames; this does not establish physical phone touch comfort or offscreen-attack fairness.

## Release history

`dist/releases.js` is the single human-maintained source for the Updates tab. Add one newest-first entry per published release, bump currentVersion (Sites Build), displayVersion and HTML asset queries together, and keep notes to one or two player-visible changes. Dates use Asia/Kuala_Lumpur. Record actual verification limits. No background fetch, local history or automatic code-change tracking is used.

For each historical entry, copy savedVersionId and commitSha from Sites list_site_versions/get_site_version. The current release cannot embed its own resulting Git SHA or saved ID: it resolves through projectId + currentVersion using Sites version discovery; fill its exact references when preparing the next release. Never guess references. Rollback is a separate, explicitly requested Sites action; this tab is read-only. Older versions may lack later bug fixes (notably v30 reward visibility).

From Build33 onward, displayVersion uses 0.feature.patch: small fixes/UI cleanup increment patch, meaningful new features increment feature and reset patch. Reserve1.0.0 for an explicitly approved release milestone; no Alpha/Beta labels. Historical v22–v32 entries keep their original numbers.

## GitHub backup workflow

Sites remains the publishing source. GitHub is a one-way private backup of the same Git history, not a second editable game or a second deployment. See [backup and restore](docs/backup-and-restore.md). Exact published SHAs, Sites saved IDs and tag names are recorded in `planning/published-versions.json`.

Setup status: prepared; repository creation and authenticated Git push are still pending. Do not report the backup as complete until GitHub branch and tags have been independently verified.
