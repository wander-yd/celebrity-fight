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
