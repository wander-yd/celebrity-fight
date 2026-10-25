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
| `dist/controller.js` | Pure device-independent command format and simulation mapping |
| `dist/input-keyboard.js` | Keyboard/mouse adapter |
| `dist/input-touch.js` | Touch gestures, soft/manual aim and feedback adapter |
| `dist/input.js` | Adapter coordination, command dispatch and interruption clearing |
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
# Mobile controls (0.2.1 / Build37)

Touch uses a visible left floating stick and an inset 84px Jump button. Hold/drag on the left to move with the existing auto aim/attack; use the other thumb to jump. A small neutral zone filters finger jitter; maximum movement speed is unchanged. Controls follow touch versus mouse/keyboard input, not screen width. Mouse/keyboard keeps WASD/arrows, mouse aiming/hold attack and Space to jump. Rotate or open Pause/Debug to safely release held touch.

`tests/touch.cjs` covers input switching, radial movement, independent fingers, capture cancellation and transitions. Browser frame layouts were inspected; physical-device touch comfort still needs playtest. See `planning/touch-controls.md`.

## Local touch tuning (0.2.2 / Build38)

The movement stick now fades at its release point instead of returning to a home corner. Debug → Controls lets you drag/resize Jump or use the labelled sliders, independently for Portrait and Landscape. Changes autosave on the current browser; Reset restores the selected profile; Copy config copies or exposes selectable JSON to share for default tuning. This does not change other players' defaults. Relative positions are constrained to the current safe area; opposite-orientation preview is approximate until rotation. Storage failure falls back to session-only settings with a visible message.

`touch-layout.js` owns versioned layout validation/storage and safe positioning; `debug.js` owns the paused editor. See `planning/touch-layout-tuning.md` for limits and verification.

## Landing contact fix (0.2.3 / Build39)

Landing no longer relocates overlapping bodies. A per-target contact-only exit window waits for stun recovery, then expires after 0.3 seconds or immediately on separation. It never extends projectile/explosion immunity. Jump damage, shield breaking and item interactions remain unchanged. `tests/landing-contact.cjs` covers recovery, re-entry, unrelated enemies, resistant Bosses, projectile/blast damage, pause and resets. Historical combat parity disables only the baseline's former landing relocation; dedicated scenarios verify the intentional difference.

## Independent mobile attack (0.3.0 / Build40)

Left touch movement no longer attacks. Tap ATTACK requests one swing at the next available normal cooldown; hold repeats. Drag12 CSS pixels to switch the current press to manual aim; release ends repeat, while an initiated swing completes. A single pending tap cannot accumulate repeated clicks. Soft aim selects visible targets, prioritizes melee reach, retains nearby targets to reduce flicker and keeps facing if none are visible. It never changes reach/damage/cadence. Input adapters feed the existing simulation aim/attack interface.

ATTACK defaults to96px and Jump84px above-left, with safe-area and non-overlap placement. Debug Controls edits both buttons independently in portrait/landscape; Reset resets the selected orientation. Version2 local storage migrates version1 Jump settings without overwriting the old storage key. Layout can shrink on tiny viewports to keep buttons separate. Help follows actual touch/keyboard mode. Keyboard/mouse and landing behavior remain unchanged.

`tests/attack.cjs` covers independent fingers, tap/hold cadence, manual direction, target stability/visibility/reach, interruptions and desktop inputs. Layout tests cover migration, both buttons and extreme placement. Browser editor checks complement fixtures; physical-phone ergonomics and fast Attack→Jump thumb switching remain playtest evidence.

## Swing aiming (0.3.1 / Build41)

Player swings track live aim during0.12s windup, commit direction for the downswing/0.20s impact, and visually turn back toward live aim during recovery to0.42s via the shortest angle. Impact never overwrites the player's live aim or hits twice. Clone rules and melee stats are unchanged. `tests/swing-aim.cjs` covers boundary locking, damage, recovery, clones and combat/tutorial/touch integration. Historical parity explicitly excludes the new steering behavior. Physical-device feel remains pending.

## Controller extraction (0.3.2 / Build42)

Device adapters emit moveX/moveY, world aim, attackHeld, attackPressed and jumpPressed. `controller.js` snapshots those commands without DOM dependencies and maps them onto the retained simulation interface. `input.js` selects the adapter, clears both on interruption, and acknowledges pending taps only after a swing starts. Immediate Jump requests pass through `Arena.applyInputActions`; normal fixed steps never replay the request. Existing shared browser state remains in state.js; Actor/Ability/state encapsulation and networking are deferred.

`tests/controllers.cjs` verifies identical device commands, immediate one-shot Jump, pending taps, clearing without deleting swings, and representative keyboard/touch replay against Build41. Existing full regression remains required. Stop for desktop/phone smoke playtest before extracting an Ability.

## Frozen touch aim (0.3.3 / Build43)

Normal ATTACK release captures the last direction, including a single pending tap. Idle and released reads never query targets; a new press restores assisted aim. Touch manual/frozen commands carry an optional aimAngle so movement cannot shift facing through stale world coordinates. Mouse aim, damage, cadence and swing locking remain unchanged. Cancellation clears the pending attack without selecting a target.

Five regression groups cover idle combat/tutorial movement, queued release, enemy motion after release, manual movement and cancellation. Full regression passes; physical-phone feel remains pending.
