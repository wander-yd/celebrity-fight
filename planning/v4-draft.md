# Void Arena v4 — microphone campaign

## Outcome and Backward Plan
Underlying Need: Combat should require positioning, pursuit, timing and use of scenery rather than stationary continuous fire.
User-visible Outcome: Play Trump with a melee microphone, obtain a sound-wave upgrade, pursue three satirical bosses through five connected rooms per chapter, and use destructible scenery.
Audience: User and visitors to the existing public mini game.
Core Loop: Enter room, read threats, attack or jump, use tariff and scenery, follow or escape boss, revisit persistent rooms, clear surviving enemies, choose an item and continue.
Backward Path: Completed three-chapter campaign requires chapter state and completion proof; that requires one five-room pursuit; first prove collision, doorway persistence, microphone hits and a chasing boss around walls before adding all portraits and patterns.
Success Criteria: Fifteen persistent rooms can be visited; each boss has three warned phases and two retreats; survivors remain after boss death; microphone and all six items work; no wall tunneling or door softlock in deterministic scenarios.
Stopping Point: Automated mechanics/scenarios pass and version is saved and deployed; human/browser feel remains explicitly unverified.

### Human Frame
Purpose: Turn the existing arena prototype into a more deliberate combat and pursuit game.
What Matters: Existing jump/shield interaction, readable combat, six item synergies, no paid services, reversible release and low user process burden.
Initial Frame: Three small chapters with repeated five-room structure, shared navigation and interaction rules, distinct bosses.
Material Frame Change: None; current scope already incorporates the user-approved five-room expansion and microphone combat.
Clarification: Second boss is Xi Jinping, with the trade-war setting retained.

## Evidence and Outside View
Authority Order: Current user approvals in this conversation; v4 draft when frozen; existing SPEC.md v3 for unaffected rules; source and tests for implemented evidence.
Sources Read: /workspace/sites/trump-void-arena/SPEC.md and dist/game.js establish single-arena state and item behavior; tests/game.cjs establishes 28 mocked-canvas scenario groups, not browser playtesting.
Conflicts and Staleness: Earlier bans on expanded maps and original ranged weapon are superseded by explicit current approval. Shield turning, arc, HP7 and speed67 remain protected. Old wave tests will require replacement for room transitions.
Reference Class: The completed v2/v3 iterations of this same game, source checkpoints bcc77b3b07f37f3894bc99d6cd249ca4f57c5ed1 and 918cfcb185c798450bc0be83b58cc1d54f045337.
Similarities: Same canvas, browser inputs, static hosting, three themes, items and deterministic testing.
Differences: Previous tests do not prove navigation, room serialization or longer-run balance; no base-rate duration evidence exists for this larger change.
Outside-view Forecast: No numerical success forecast. A reusable five-room chapter and cheap navigation simulations must precede content replication. Approved 90-minute ceiling bounds this attempt; report incomplete work if acceptance cannot be reached.
Lessons Applied: Explicit death/transition tests, no visual verification claims from mocked drawing calls, saved rollback version and bounded features.

## Frozen Scope and Decisions
In Scope: Microphone melee; first-chapter room3 sound-wave pickup; three chapters each with five linear connected persistent rooms; Biden feces attacks, Xi trade attacks, Mojtaba Khamenei missile/minion satire; boss pursuit and two forward retreats; stronger warned combos; surviving mobs; walls, crates and timed explosive barrels; existing six items, tutorial and controls.
Out of Scope: Random mazes, network play, save/load, extra items, rarity, inventories, paid assets and more chapters.
Constraints: Static self-contained assets; existing public Site and URL; keyboard/mouse and touch; 90-minute machine-time ceiling for this iteration; human feel and physical input are not machine-provable.
Locked Decisions: Each chapter has rooms1 entry,2 first boss encounter,3 reward,4 rematch,5 finale; east/west doors allow backtracking and preserve enemies/props/pickups. Boss starts room2. Damage gates at 68% and34% force retreat to rooms4 and5 respectively. Once settled at a retreat destination, boss waits for player there before resuming combat; while actively engaged it pursues the player across rooms with warned doorway arrival. Boss death never clears mobs; chapter completes only after all rooms were visited, boss died and all chapter mobs died. No live boss duplication.
Reversible Defaults: Microphone cone radius94, arc120 degrees, damage4, cooldown0.42s. Sound upgrade adds a forward projectile with two-target penetration; E/touch interacts in range. Main/mini tariff and item durations retain v3 values. Echo ricochet supports melee, clones use current weapon, settlement counts landed melee/wave hits, shards never chain recursively. Ordinary landing remains damage4/stun1.5s/shield break3s/radius65; bosses take a brief0.45s stagger with a 2s resistance window to prevent permanent jump lock. Warning timings, art, rooms and HP may be conservatively tuned within these behaviors.
Future Backlog: New ideas are deferred until one human playthrough; no implicit authorization from this plan.
Allowed Changes: /workspace/sites/trump-void-arena/dist, tests, SPEC.md and planning; package and deploy only this Site with its current public audience.
Do Not Change: Shield turning/arc/HP/speed; six item identities and tariff semantics; Site identity/access; unrelated workspace files or services; no fees, accounts or external messaging.
Implementation Freeze Rule: Return to user if intended behavior, maintenance boundary, cost, irreversible action or accepted stopping point must materially change. Reversible numeric/art details stay autonomous.

## Modular Delivery Plan
Module Strategy: Shared room state, geometry and navigation first; one playable chapter as pilot; then shared boss engine and two themes; final compatibility and deployment. Exactly one active module at a time.
Active Module: M3 — Saved release

### M1 — First chapter pilot
Goal: Move and fight with microphone through five rooms while a persistent boss pursues and retreats.
Direction: Single world owner; collision-aware BFS steering; persistent room records and one boss record; direct wall and door proofs before visual content replication.
Stopping Point: A1 through A5 pass for chapter1 with one microphone boss and scenery.
Depends On: None
Acceptance IDs: A1, A2, A3, A4, A5

### M2 — Themes and compatible builds
Goal: All three chapters, six items, sound evolution and teaching operate with the shared room engine.
Direction: Parameterize boss patterns and room dressing; preserve shield behavior; add item adapter for melee/waves/clones and safe tutorial.
Stopping Point: A6 through A9 pass, including all15 two-item combinations and the full campaign.
Depends On: M1
Acceptance IDs: A6, A7, A8, A9

### M3 — Saved release
Goal: Publish exact tested source to the existing Site with rollback retained.
Direction: Check scripts, source/manifest and tests; helper pushes and packages; save version then deploy to existing audience.
Stopping Point: A10 confirms native deployment success; stop for human playtest.
Depends On: M2
Acceptance IDs: A10

## Interfaces, State, and Recovery
Interfaces: WASD/arrows move; mouse aims and held left click attacks; Space jumps; Q tariff; E interaction; P/Escape pause. Touch drag moves and auto-attacks nearest target, separate jump/tariff/interact buttons. HUD gives chapter/room, boss phase, remaining enemies, interaction prompt and minimap counts.
State Owner: One in-memory campaign world owns five room records and one chapter boss. Active room references its own mob/prop/hazard/projectile collections; boss location and transit are unique. No persistence across reloads. Inactive rooms freeze all local mobs, projectiles, hazard/barrel timers, props and tariff durations. During unpaused play only, the unique boss transit timer advances globally even offscreen; no offscreen boss attacks occur. Pausing freezes both local and global timers. Reentry preserves remaining local timers, grants player1.5s arrival invulnerability and removes hostile projectiles within100px of the doorway; solid entry positions are validated.
Data Flow: Input to movement/collision, melee and projectiles, damage/items, prop explosions, dead-entity collection, boss retreat/pursuit state, global chapter completion; draw only reads resulting state.
Failure Recovery: Room entry projects player to a validated doorway; navigation returns stop rather than walking through solids, with destructible obstruction handling. Restart rebuilds the run. Previous saved v3 can be redeployed if the larger version fails human acceptance.
Compatibility and Migration: No user save data exists to migrate. Existing Site/URL and public audience retained. v3 game source remains recoverable in Git and saved version history.
Privacy and Cost Boundary: No personal data, external API runtime, credentials in source, paid assets or account changes. Source credential stays in tool-session memory.

## Risks and Cheap Proofs
Premortem: Wall/door softlock → unreachable doorway/path → assert traversable routes for all15 rooms, radius-aware collision and door entry → fix geometry before theme work. Boss duplication or teleport hits → multiple references/instant arrival → unique location record and delayed warned arrivals → cancel transit on death. Survivor clearing bug → chapter completes early → global mob-count test after boss death → completion predicate independent of boss actor removal. Item regressions → dead items with melee → adapter and all-pair tests → restore prior behavior or block release. False confidence → mocked rendering called visual QA → provenance explicitly distinguishes simulation from human/browser evidence.
Biggest Risk: A large rewrite may satisfy scenarios but feel worse; no browser-control skill is available to prove actual visual/combat quality.
Early Signals: Unreachable paths, stalled pursuit, failed chapter predicates, unbounded objects or item effects absent during simulations.
Cheap Proofs: Deterministic obstacle/path grids and one-chapter state transitions before remaining boss content; assert cross-room return state and surviving-minion behavior.
Unknown-unknown Allowance: Reserve iteration slack for collision and input defects; remove decoration before weakening frozen core behavior. If scope cannot fit the ceiling, preserve checkpoints and report incomplete acceptance rather than silently shrinking it.

## Acceptance, Rollout, and Evidence
Acceptance Tests: Layer / Given-When / Expected / Evidence are stated for each case. A1 / rules / melee inside cone and visible line hits once, behind wall does not, cooldown holds / tests/game.cjs. A2 / geometry / every room door and reward is reachable, movers and projectiles collide correctly / seeded BFS and collision fixtures. A3 / state / leave and return preserves mobs, damaged crates and claimed loot; leave a primed barrel, wait elsewhere and return with unchanged remaining fuse and safe entry, while a pursuing boss advances its delayed transit; pause freezes both timers / room transition assertions. A4 / boss / two retreats preserve HP, pursuit arrives after warning, no duplicate, death cancels transit / scenario traces. A5 / environment / crates break and barrels warn then hurt both sides with bounded chains / timed fixture. A6 / content / three distinct named bosses, warned phase patterns, late minion summons, feces puddles and Xi containers / pattern fixtures. A7 / items / all six operate with melee, wave, clone and all15 pairs; sound pickup idempotent / fixture matrix. A8 / control / tutorial success/skip, pause, blur, touch interaction and restart preserve rules / event mocks. A9 / campaign / all15 rooms, three bosses and surviving mobs gate chapter/win correctly / deterministic full run. A10 / release / exact tested source pushed, saved archive version and deployment succeeded with URL / helper and native Sites result.
Evidence Ladder: Specified to implemented to mechanically/scenario tested to published; human/device/browser playtest remains separate.
Verification Provenance: node --check dist/game.js and node tests/game.cjs in managed Linux; retain test summary and exact commit in planning evidence. Do not claim browser layout/performance from canvas stubs.
Rollout: M1 pilot test, M2 integration test, M3 source/package/save/deploy, then link same public URL to user.
Rollback: Redeploy saved v3 appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_cbe7fcd0d938819180dc6250a98b7c9c; source commit918cfcb185c798450bc0be83b58cc1d54f045337 retained.
Release Stop: After native success report scope and verification limits; only next action is human playthrough.
Status Consistency Check: SPEC current v4 section and stage-state must agree on one active module, exact evidence and completion/pending-human status.

## Decisions and Unknowns
Discoverable Unknowns: None after current source and skill inspection; geometry feasibility is the bounded pilot proof.
Preference Unknowns: None; user approved microphone interpretation, five rooms per chapter and Xi clarification.
High-Impact Unresolved Unknowns: None
Low-Impact Reversible Unknowns: Room decoration, exact safe obstacle placement, warning timings and boss HP within frozen behavior.
External Blockers: Browser/device quality cannot be verified here; this does not block implementation or native deployment.
Open Decisions: None
Only Necessary Question: None

## Execution Control
Current Stage: M3 published; human playtest pending
Gate Result: Pass
Next Stage: Human playtest
Exact Next Action: Open the deployed game, complete the safe jump/microphone lesson and play one five-room chapter; report readability, controls and combat feel. No further product changes.
Destination: User browser at https://trump-void-arena-jj.grassy-fawn-9947.chatgpt.site
Handoff Packet/paths: /workspace/sites/trump-void-arena/planning/v4-plan.md and /workspace/sites/trump-void-arena/planning/v4-state.json
Build Instructions: Product implementation and publication are complete. Only the user browser playtest remains; no further code, hosting or access mutations are authorized by this next action.
Current Action Evidence: A1-A9 and four review regressions pass, 26 unique scenario groups; native A10 deployment succeeded at2026-10-20T11:30:19.458703+00:00 with saved version4 and source ebb8878451d73ec0a5acbaf9db903e0deae3ea53. Next action is reversible human playtest only.
Risk Tags: bounded_reversible
High Failures on Same Action: 0
Interacting M-class Risks: 0
Named Max Failure: None
Automatic Handoff Available: no
DeepSeek Effort: not-applicable
Manual UI Action: Open https://trump-void-arena-jj.grassy-fawn-9947.chatgpt.site and play one chapter.
Manual Prompt: In your browser at https://trump-void-arena-jj.grassy-fawn-9947.chatgpt.site, complete the safe microphone/jump lesson, pick up the sound amplifier with E in room3, and play one five-room chapter. Report controls, visibility and combat feel; make no code, hosting or access changes.

## Durable Stage State
Locked Decisions: Fifteen rooms, microphone with sound pickup, three distinct bosses with pursuit/retreat, survivors persist, six adapted items and unchanged shield behavior.
Allowed Changes: /workspace/sites/trump-void-arena/dist, tests, SPEC.md and planning; package and deploy only this Site with its current public audience.
Do Not Change: Shield turning/arc/HP/speed; six item identities and tariff semantics; Site identity/access; unrelated workspace files or services; no fees, accounts or external messaging.
Remaining Blockers: None
Authoritative Artifact: /workspace/sites/trump-void-arena/planning/v4-plan.md
Evidence Paths: /workspace/sites/trump-void-arena/SPEC.md, dist/game.js, tests/game.cjs and planning/v4-state.json
Approved Paths: None supplied
Location Assumptions: Reuse existing git-backed Site checkout /workspace/sites/trump-void-arena.
