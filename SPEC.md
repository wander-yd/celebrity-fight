# Void Arena v2 — approved session scope
Goal: three distinct satirical levels and meaningful active combat control.
Allowed: Biden, Trade War, Iran (fictional war-machine satire); one mixed-enemy wave and one boss each; three upgrade choices between levels; Q tariff field; six base enemy types; lecterns, conveyor belts, telegraphed explosions.
Tariff: stationary 170px radius, 5s duration, 12s activation-to-activation cooldown. Normal enemies move 40% slower and attack intervals multiply by 1.3. Boss moves 20% slower, attack timing unchanged. Debuff lingers 1s after leaving. Nonstacking.
Jump: existing invulnerability and landing stun; landing breaks shield briefly. Shield blocks frontal projectiles; splitter creates two weak children once.
Preserve: keyboard/mouse and touch controls, pause, restart, original art, existing site and audience.
Exclude: multiplayer, inventories, skill trees, saves, expanded maps.
Stopping point: machine-checked three-level run, clear UI/telegraphs, saved version and deployment. Human visual/combat-feel checks remain separate.
Verification: node tests/game.cjs. No supported control-browser skill is available, so browser/device QA is unavailable.
Rollback: previous published source commit 982baa5de8109fe893a665960a70959dd85e440f remains in repository history and the earlier Site version remains saved.

## Delivered evidence
Fourteen deterministic scenario groups passed: level configuration, tariff rules, boss modifiers, expiry, shield angles/landing, split offspring, obstacles/bounds, conveyors, explosion warning/damage, boss patterns/escalation, complete three-chapter transitions/upgrades, death/restart/pause, bounded simulations/render API calls, damage upgrade. Browser/device playtest and subjective balance remain unverified.

# v3 — approved item and teaching patch
Goal: upgrade choices change positioning, timing and target selection; teach existing jump/landing attack.
Locked: do NOT change shield turning, shield arc, HP, movement, or attack behavior. Existing landing damage 4, stun 1.5s, shield break 3s, radius65 remain unchanged.
Replace numerical upgrades with six unique items: pull within tariff zones; main tariff expiry settlement (2 + 0.5 per landed projectile hit, capped bonus8); one projectile ricochet including shield blocks; jump-origin firing clone3s; landing mini tariff zone2s/radius90 without expiry explosion; taxed-death short-range shards which cannot recursively cause shards.
Main tariff field remains5s/radius170/cooldown12. Pull80px/s (boss40), no stacking overlapping zones. Damage settlement is per enemy hit count inside main field, resets each activation. Mini fields share debuff/pull and taxed-death synergy, never settle.
Choice contract: 3 unique unowned items after each of first two bosses; second offer guarantees at least one compatible item; descriptions show current-build synergy. No old rate/damage/multishot buffs.
Tutorial: first Start offers short explanation and a safe shield dummy practice; landing near dummy teaches stun + shield break, then explicit Start Campaign. Skip supported, once per page; restart preserves completion. Combat pauses during tutorial overlays. Visible landing radius, expanding shock ring, STUNNED and SHIELD BROKEN labels.
Preserve three chapters, bosses, environments, controls, pause, restart, public audience and existing URL. No inventories, extra levels, rarity or skill tree.
Evidence: expand deterministic game suite for all six item effects, combinations, choice guarantees, tutorial/skip/restart and unchanged shield behavior. Browser feel remains human-only.

## v3 delivered evidence and recovery
`node tests/game.cjs`: 28 deterministic scenario groups pass, including the 15 item-pair combinations, per-target billing, nonrecursive fragments, first-hit landing/chain, clone inheritance, shield-block ricochet, item offer uniqueness/compatibility, tutorial miss/retry/success/skip, and unchanged instant shield facing/arc/HP/speed. Tutorial holds success visibly for 1.1 seconds before its completion overlay. Sidebar and choice cards explain item effects and active synergy.
Highest evidence: mechanical/scenario simulation; browser, physical input, layout and subjective combat feel remain unverified.
Previous deployed v2 source checkpoint: bcc77b3b07f37f3894bc99d6cd249ca4f57c5ed1. Previous saved version: appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_3c127b311ed481919a707be6f0d6b3d0. Can restore that saved version without removing v3 source history.
Only next action after deployment: user plays jump practice and one two-item build; stop feature work until this observation.

# v4 — microphone / five-room campaign (user approved)
Authority: planning/v4-plan.md contains the current complete contract and supersedes prior single-room/ranged-weapon constraints. Three chapters each contain five connected persistent rooms; bosses Biden, Xi Jinping and Mojtaba Khamenei pursue and retreat, and living minions survive boss death. Melee microphone evolves via room3 pickup into additional sound waves. Walls, destructible crates and warned barrels are interactive. Shield baseline unchanged; items and jump lesson adapted. Inactive local rooms freeze; boss transit alone advances globally during unpaused play. Reentry has1.5s safety. No save data migration, paid services or sharing changes.
Current milestone: M1 first chapter pilot. Human/device checks remain pending.
M1 evidence: node tests/pilot.cjs passes seven groups A1-A5, including all15 room geometries at player/boss radii, microphone occlusion, inactive fuse persistence, boss pursuit/retreat, minions surviving boss death and barrel chains. Independent plan review passed19/20 after inactive-room and canonical-state clarifications. Active milestone now M2 themes/items/UI; no human/browser playtest yet.
M2 + requested Pause/Review evidence: node tests/game.cjs passes 7 pilot +15 integration groups; node tests/review.cjs passes 4 additional regression groups (tutorial repeated landing, stale dash on pursuit, boss cascade, reentry tariff stacking). 26 unique groups, including all15 item pairs. Syntax and local HTML assets checked. Review corrections in planning/v4-review.md. Active module M3 packaging/publication; human/browser layout, device input, performance and fun remain unverified.
V4 delivery closed: native Sites publication succeeded2026-10-20T11:30:19.458703+00:00, version4, deployed product source ebb8878451d73ec0a5acbaf9db903e0deae3ea53. URL https://trump-void-arena-jj.grassy-fawn-9947.chatgpt.site. M1/M2/M3 complete; human/browser playtest pending. Documentation-only checkpoint may follow the deployed product commit. Only next action: user tests one chapter; no further feature work.

# v5 correction — user cancels ALL multi-room design
Latest user authority supersedes both v4 linear rooms and the proposed branch graph. Each of the three chapters returns to one arena. Remove rooms, doors, cross-room transit, retreat routing and minimap. Preserve current three bosses, minions surviving boss death, six item synergies, jump/shield rules, walls/crates/barrels, pause/restart and existing audience.
Weapon intent: microphone MELEE with an overhead/downward strike, directed by mouse. Attack0.42s cycle:0.12s windup +0.08s visible downward stroke, single damage event at0.20s, then0.22s recovery. Direction captured at swing start; body can move during swing. Normal range/cone/damage preserved. Clones use same animation/weapon; sound upgrade launches at strike, not windup.
One wave of12/14/16 enemies precedes each chapter boss. Boss phase HP gates remain68%/34%, but trigger a brief0.65s phase break and remain in the same arena; no retreat. Boss still chases and uses distinct stronger patterns. First arena has an E amplifier pickup; later arenas have a one-use2-heart supply. Boss death never deletes surviving mobs; clear all to advance.
Stopping point: deterministic single-arena/weapon/compatibility checks pass, then publish to same Site. No extra features or room types.
V5 verification: node tests/game.cjs passes20 scenario groups, including downstroke delay/direction/once-only damage, cadence, wave at impact, ordinary shield invariants, same-arena boss phases, all15 item pairs, repeated-jump tutorial recovery, and complete three-arena survivor-gated campaign. Syntax checks pass; no real-browser/device/feel verification. planning/current-state.json is the current resume surface; v4 plan/state are historical and must not resume multi-room work. Publication confirmation is authoritative in the native Sites version/deployment record.

# v6 — open arena and suited Pooh (user requested)
Remove all arena walls, crates and barrels. Trade boss container drops retain warned impact damage but never create solid obstacles. Arena boundary stays. Keep amplifier/supply pickups, conveyors, hazards, weapon, items, bosses and survivor clear rules. Chapter2 boss becomes a golden bear with round ears, navy suit, white shirt and red tie, labeled WINNIE THE POOH. No other scope changes.
Stopping point: existing simulation suite and syntax checks pass; publish same Site and public audience. Browser/device playtest unavailable. Rollback: saved Site version5 / source a57927b8e7e7b6b89fce61ae5e0ec0559a20bb1d.
Evidence: 19 scenario groups passed, including all three obstacle-free arenas after Boss casts, retained pickups, and all15 item pairs. Both JavaScript syntax checks pass. Drawing uses mocks, not a browser.

# v7 — remove amplifier, restore initial three-chapter Boss mechanics
User selected B: return to original thematic three-chapter Boss combat from bcc77b3, preserving current character appearances (Biden, suited Pooh, Mojtaba), melee weapon, items, open arenas and survivor completion gate. No amplifier in chapter1 and no gameplay sound-wave unlock. Chapters2/3 supply remains.
Restore HP105/155/190, chase speed30. Biden five135-speed fans spaced.28 plus105-speed homing scoop, cooldown1.5/1s below half. Trade12 radial150-speed plus3 aimed230-speed spaced.12, cooldown1.3/.9s. Iran10/14 radial155-speed and player-targeted60-radius1.45s warning, cooldown1.5/1s. Iran phase escalation warnings at68%/35% and recurring3.8s bomb warnings. No dash, long cast, summons or HP-gate invincibility. Existing landing and tariff rules remain.
Rollback: previous saved version6, source bbe10cdc4ca31cd3ea2994132c6528c892b5eb3b. Stop after checks and publication.
Evidence:19 scenario groups pass; JavaScript syntax checks pass. Attack counts, half-health cooldowns, original HP/speed, homing scoop, continuous damage, no amplifier, supply preservation and survivor gating verified. Browser/device combat feel remains unverified.

# v8 — bounded regression cleanup (user requested)
Keep v7 gameplay scope. Fix stale sound-wave item/help text and remove unreachable sound-wave firing and old summon routines. Boss HUD now shows actual half-health enragement rather than obsolete gated phases; entry grace is labeled entry readiness. Supply is a medical kit and vanishes after collection; chapter1 no longer prompts supply interaction, and interaction button hides when no unused supply exists.
Restore safe Boss entry: clear hostile bullets, pending hazards and slow pools; grant player at least2s invulnerability. Do not clear living minions or change the survivor completion gate. Prevent terminal Boss damage from triggering new escalation bombardments. Grounded chapter2 Boss receives conveyor displacement consistently with other bodies. Preserve original Boss HP, attacks/cadence, six items, melee timing, shield rules and empty arenas.
Evidence: node tests/game.cjs24 scenario groups pass including actual melee-only15 item pairs, entry leftovers, fatal escalation, surviving escalation thresholds, Boss conveyor, current help text, controller HUD, pause/restart/tutorial and full survivor-gated campaign. Drawing/controller use mocks. No supported browser QA available; layout, device input and combat feel remain unverified. Rollback: v7 source92e6e5b878b7ec14047ace654d0f059097a12851.

# v9 — restore original small-enemy pressure (user requested)
Restore bcc77b3 small-enemy baseline: chapter counts15/21/24; initial spawn delay1s, subsequent intervals1.03/.91/.79s; original chapter rosters; perimeter spawn locations with170px player clearance; initial attack timers1–1.8s. Charger420px/s for.45s; shooter stops approaching within245px and fires185px/s. Existing HP, baseline speeds, shield arc/facing and turret patterns remain. Preserve melee4 damage/.42s cadence, six items, current Boss mechanics/skins and empty arenas. This restores enemy parameters, not historical overall balance with the former ranged weapon.
Stopping point: exact baseline regressions plus existing campaign/item tests pass; publish same Site. Browser feel remains unverified. Rollback: v8 source10f1c5ae95065a5b0f611e18fc060806781ad9fa.
Evidence:27 scenario groups pass, including baseline wave counts/cadence/rosters, perimeter spawn clearance, charger distance and shooter bullet speed. Current melee timing, Boss patterns and15 item pairs also pass.

# v10 — Biden projectile appearance only (user approved)
Biden fan bullets become yellow urine droplets with brief cosmetic hit splashes. Slow homing scoop becomes stacked cartoon poop. Keep counts5+1, speeds135/105, radii8/11, homing blend.7, half-health intervals1.5/1s and normal player damage. Use kind homingPoop rather than legacy poop to prevent accidentally enabling old slow-puddle behavior. No slow zones or added damage; other gameplay unchanged.
Rollback: v9 source9085c3ec16bf80632b0e37a468fe59cc4785e9d3. Evidence: existing scenario suite extended to check unchanged projectile radii/speed, retained homing, cosmetic splash and no puddle. Browser appearance unverified.

# v11 — English-only localization (user requested)
Translate every player-facing string to English: page controls, menus, tutorial, combat HUD, feedback labels, supplies, Boss names, six item descriptions and pair synergies. Remove repeated English item subtitles after names become English. Preserve all mechanics and visual assets.
Evidence: no Han characters in shipped HTML/JS. Combat-core source matches prior version exactly after string literals are masked. Existing regression suite checks current English help. Browser typography/layout and physical input remain unverified. Rollback: v10 source95df7b6345590423fb56e28c39fe6ff37a5117ae.
Final check:27 scenario groups pass, including English HUD/controller checks and all15 item pairs. Both JS syntax checks pass.

# v12 — Biden diaper costume (user requested)
Add a clearly visible cartoon white diaper with pale-blue waistband/tabs and exposed lower legs to the existing Biden sprite. Retain recognizable white hair, glasses and upper suit. Rendering-only change; keep all attacks, stats, collision and other characters unchanged. English UI remains. Rollback: v11 source26e1bad530c286724bb9428928015082830e7f58.
Evidence: JS syntax and all27 existing scenario groups pass, including Boss draw/controller mocks. core.js unchanged. Browser visual appearance remains unverified.
