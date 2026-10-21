# Square arena and following camera — 0.2.0 / Build36

## Outcome and Backward Plan
Underlying Need: Read nearby combat comfortably on a phone or computer while reaching arena corners without fixed HUD bars taking away the playfield.
User-visible Outcome: One full-screen game viewport with compact floating hearts/menu controls, a closer ground-following camera, black outside a square arena, and orientation changes that preserve the run.
Audience: Existing single-player game users on portrait/landscape touchscreens and mouse/keyboard.
Core Loop: Move, aim/swing, jump/land, clear wave/Boss/minions, collect safe health kit, choose item, enter next level.
Backward Path: Safe three-level flow and corner/rotation playtest follow integration checks; first prove square bounds, camera projection/inverse and equal-area orientation mathematically before wiring the renderer.
Success Criteria: A1–A7 pass with no changed combat constants; native browser checks when available; actual phone comfort remains pending user playtest.
Stopping Point: Publish one bounded first version, then stop feature work for user feedback. Authorized budget: two50-minute Sections including checks.

## Evidence and Outside View
Authority Order: Latest approved user scope > this frozen delta > existing SPEC.md/current-state > implementation/tests > reference games.
Sources Read: dist/core.js (world960x600, playable904x494, asymmetric top78 bounds and fixed spawns); render.js (world/HUD mixed coordinates); input.js (fixed-canvas inverse and world-based touch drag); ui.js/styles.css (toolbar/footer consume viewport); tests/ (geometry-dependent scenarios and historical parity); planning/current-state.json (Build35, reward visibility fix, GitHub backup pending).
Conflicts and Staleness: Old geometry/whole-arena parity assertions are superseded only for intentional square/camera changes. Existing active rules remain authoritative. GitHub backup work stays pending and separate; no new backup claim.
Reference Class: This project's v24 HUD/viewport pass and v30 frozen-blink fix.
Similarities: Same menu/progression, responsive viewport and shared timers; risk of visual changes breaking input or phase visibility.
Differences: v24 clipped a fixed canvas; this delta introduces world/screen transforms and square bounds, so old full-world trajectories cannot be presumed identical.
Outside-view Forecast: No usable numerical base rate. Geometry-only pilot and deterministic inverse/phase checks replace speculative confidence; supported browser preview is additional evidence, not physical phone testing.
Lessons Applied: Keep simulation and camera state independent; assert phase transitions and protected timers; preserve regression visibility checks and explicitly narrow historical comparisons instead of concealing geometry differences.

## Frozen Scope and Decisions
In Scope: Equal-area square competition space; ground-following camera with soft edge limit; zoom; floating HUD; correct aiming and screen-based touch drag; resize/rotate support; bounded verification and same-Site publication.
Out of Scope: New attacks/items/enemies, minimap, danger indicators, engine changes, Vercel/GitHub operations, native fullscreen, competitive fairness guarantees, physical-device automation.
Constraints: No new dependencies/services. English UI. Same Site/audience. No small-screen forced orientation. Preserve combat units and60Hz timing.
Locked Decisions: Square arena interior668x668 in728x728 world with30px margins; area446224 vs prior446576 (0.08% smaller). Geometric placement only changes: player centered horizontally and55 below arena center; Boss center x and upper-area y; practice player/dummy remain50px apart. Natural spawn candidates use all four new edges with existing170px safety gap. Two horizontal48px conveyors remain opposite directions at symmetric offsets from center; speed70 unchanged. Bullets/item shots use new arena bounds. Retain movement/speeds/radii/timers/health/damage/rosters/attacks/items/reward rules.
Reversible Defaults: Visible world area270400 square units at every orientation; view width=sqrt(area*aspect), height=sqrt(area/aspect). Camera target per axis is arenaCenter + travel*tanh((groundPosition-center)/travel), travel=max(0,arenaHalf-viewHalf+96), using exponential easing10/s. Snap only on new room/run/tutorial/debug destination; never follow visual jump height. Rendering uses CSS-pixel viewport plus capped DPR2; inverse projection refreshes stationary mouse aim as camera moves. Resize is atomic, preserves simulation and current camera position when safe (otherwise the smallest center correction keeps the ground player in view), releases stale touch drag only and resets frame accumulator to avoid resizing catch-up. Constants are adjustable only within this approved camera presentation, not combat balance.
Future Backlog: Edge threat indicator only if playtest proves offscreen hits unfair; zoom/lag tuning after user evidence.
Allowed Changes: dist camera/core geometry/state/render/ui/input/game/index/styles/releases, geometry-aware tests, README/SPEC and planning controls. No other project/service targets.
Do Not Change: Numeric combat abilities/TYPES/THEMES/WAVES/items, original Boss behavior/scale/radii, reward visibility/owner-bomb immunity/landing safety, health-kit→item→level, Start/Resume text and existing icons, debug password/actions, source project identity/audience, GitHub backup status.
Implementation Freeze Rule: New mechanics, stronger fairness guarantees, forced orientation, budgets beyond two Sections or new services return to user scope review; reversible camera defaults proceed without another gate.

## Modular Delivery Plan
Module Strategy: Three modules, geometry/projection pilot first, one active module.
Active Module: M3
### M1
Goal: Prove square bounds and reversible camera mapping without product UI.
Direction: Shared frozen arena geometry and dependency-free camera module; pure tests of bounds, black overscan target and inverse transform.
Stopping Point: A1/A2 pass and geometry is ready for renderer integration.
Depends On: None
Acceptance IDs: A1,A2
### M2
Goal: Play through projected world with floating HUD and stable input.
Direction: Transform world rendering only; DOM HUD remains screen anchored. Use CSS-screen touch deltas, inverse mouse aim and atomic resize. Snap camera on room identity changes.
Stopping Point: A3–A6 pass.
Depends On: M1
Acceptance IDs: A3,A4,A5,A6
### M3
Goal: Review, verify and publish the approved first version.
Direction: Full applicable suite and supported native preview in portrait/landscape; exact release/history documentation then Sites publication.
Stopping Point: A7 evidence and successful native deployment; user device feel pending.
Depends On: M2
Acceptance IDs: A7

## Interfaces, State, and Recovery
Interfaces: Core exports WORLD/ARENA/CONVEYORS and dimensions; pure camera exposes resize/snap/follow/worldToScreen/screenToWorld. Browser owns viewport/DPR; simulation never reads camera or viewport. Pointer tracks CSS-screen location and derives world aim; touch drag remains CSS-screen based.
State Owner: Arena owns combat state; camera owns view center/size; DOM owns fixed HUD. No persistence migration or backend.
Data Flow: Device resize → view size/projection; input screen point → inverse world aim → fixed-step simulation → camera ground follow → world transform draw → screen HUD updates.
Failure Recovery: Finite positive viewport guards; no NaN state. New room snaps camera, release stale pointer/touch input on transition/rotation. If a camera check fails, fix locally or roll back exact v35 saved version; never mark real-device acceptance from mocks.
Compatibility and Migration: No player-save format. Historical source retained. Old whole-arena trajectory/draw traces are no longer identical by design; preserve config equality and comparable interior encounters, plus explicit current geometry/projection tests.
Privacy and Cost Boundary: No external data transfer except already-authorized same-site publish; no credentials in artifacts; no new recurring cost.

## Risks and Cheap Proofs
Premortem: Camera inverse wrong → swing misses cursor → round-trip tests and stationary cursor/moving camera test → fix inverse before UI. Legacy coordinates remain → entities outside bounds → spawn/corner/conveyor campaign tests → migrate shared geometry. Orientation changes speed/view advantage → state mutates or visible area differs → exact state snapshots/equal-area tests → isolate resize. Phase transition freezes view → reward player invisible/offscreen → retain v30 checks plus camera room snap → fix view lifecycle. Offscreen shots feel unfair → native scripted shooting scene and later phone playtest → conservative zoom first, no new warning mechanics now.
Biggest Risk: Treating a geometry rewrite as visual-only and weakening old tests until green; explicit allowed placement changes and numeric parity distinguish intended differences from regressions.
Early Signals: Invalid spawn coordinates, square area mismatch, inverse error, resize simulation delta, hidden reward player.
Cheap Proofs: A1/A2 pure module tests before browser wiring; no asset generation.
Unknown-unknown Allowance: Camera easing/zoom feel is a bounded reversible default, physical phone evidence remains pending after release.

## Acceptance, Rollout, and Evidence
Acceptance Tests: Given the following scenarios, Expected results and evidence are: A1 / Core / square world and spawns/conveyors/reward placement / bounded entities, original area within1%, original combat config / core tests. A2 / Pure camera / center/corners and portrait↔landscape / equal visible area, smooth bounded follow, finite inverse round trips, black margin / camera tests. A3 / Browser integration / stationary cursor while camera moves or resize / world aiming follows rendered cursor, touch drag uses CSS deltas, no state mutation / DOM+canvas tests. A4 / UI / menu/tutorial/play/reward/Pause/Debug / floating readable HUD, no bars or removed view switches, overlay buttons do not start movement, Start/Resume retained / fixtures and preview. A5 / Gameplay / all levels and rewards at full health / safe kit pickup/item/next level and visible player / scenarios. A6 / Config/timing / old-vs-new interior controlled encounters and15–144FPS / unchanged defaults/effects/timing except geometry / parity and clock suites. A7 / Release / validated package / same project/audience and new release0.2.0 Build36 with actual limits / Sites tool result.
Evidence Ladder: Frozen specification → pure tests → integrated automated scenarios → native browser preview if available → user physical-device playtest pending → native publication verified independently of device feel.
Verification Provenance: Store commands/results in current-state and camera evidence notes; exact scripts in tests/run.cjs. Preview evidence names its viewport and limitations.
Rollout: Pass all applicable checks, package exact pushed source, save/deploy using returned IDs. No extra confirmation for already-approved publication.
Rollback: appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_1650e3e47c74819199c61ccc4e86b4c6, game0.1.3 Build35 SHA03345c66fd408a426f715f2216c6b58c3ad21016. Current source additionally includes documentation commit9f6c1397a469f003ddf00fff73d99b1b6c9ca0ab.
Release Stop: One successful first-version publication; stop feature additions for user camera/phone playtest.
Status Consistency Check: SPEC delta/current-state/release notes and plan module evidence must agree; backup remains prepared-not-uploaded.

## Decisions and Unknowns
Discoverable Unknowns: None remaining for initial implementation; legacy coordinate search completed.
Preference Unknowns: None; approved square arena and camera scope.
High-Impact Unresolved Unknowns: None.
Low-Impact Reversible Unknowns: Actual zoom/easing feel and compact HUD overlap on physical devices; bounded defaults above.
External Blockers: None for implementation; native preview may be unavailable and will be reported if blocked.
Open Decisions: None.
Only Necessary Question: None.

## Execution Control
Current Stage: Build
Gate Result: Pass
Next Stage: Build
Exact Next Action: Complete M3 regression and publication checks for the implemented camera delta, then publish to the existing Site and stop for user playtest.
Destination: Current agent in /workspace/sites/trump-void-arena
Handoff Packet/paths: planning/camera-plan.md and planning/camera-stage.json
Build Instructions: Complete M3 checks and same-Site publication only; no new features; stop for the user device playtest.
Current Action Evidence: Local geometry/projection changes are reversible, authorized and testable; no current publication or credential decision.
Risk Tags: bounded_reversible
High Failures on Same Action: 0
Interacting M-class Risks: 0
Named Max Failure: None
Automatic Handoff Available: yes
DeepSeek Effort: not-applicable
Manual UI Action: None
Manual Prompt: None

## Durable Stage State
Locked Decisions: Square668 interior; fixed-area270400 camera; soft edge96 and easing10; screen HUD/input; unchanged combat rules.
Allowed Changes: dist camera/core geometry/state/render/ui/input/game/index/styles/releases, geometry-aware tests, README/SPEC and planning controls. No other project/service targets.
Do Not Change: Numeric combat abilities/TYPES/THEMES/WAVES/items, original Boss behavior/scale/radii, reward visibility/owner-bomb immunity/landing safety, health-kit→item→level, Start/Resume text and existing icons, debug password/actions, source project identity/audience, GitHub backup status.
Remaining Blockers: None.
Authoritative Artifact: planning/camera-plan.md
Evidence Paths: dist/core.js,dist/render.js,dist/input.js,tests/,planning/current-state.json
Approved Paths: None supplied.
Location Assumptions: Use existing repository planning/ alongside canonical SPEC/current-state.
