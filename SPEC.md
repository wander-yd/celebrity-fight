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
