# Camera release evidence — 0.2.0 / Build36

Verified on 2026-10-21. Scope and acceptance IDs are in camera-plan.md.

- A1/A2: shared 668×668 arena and pure camera tests pass, including 63 corner/orientation/inverse cases, equal visible area, zero camera travel and bounded spawns/conveyors.
- A3/A4: 17 UX scenario groups pass, including stationary-cursor aiming, CSS-pixel touch drag, full viewport floating HUD and rotation without combat mutation. Native browser preview inspected desktop 1363×936 and live iframe viewports 390×844 and 844×390; tutorial state remained after rotation, HUD remained inside the viewport and exterior was black.
- A5: 40 gameplay scenario groups pass, including reward player visibility and full-health kit pickup → item choice → next level. All 16 Debug/Codex scenario groups pass.
- A6: 10 refactor/timing groups pass. Combat defaults match Build35. 48 seeded 900-step controlled interior encounters and original character/enemy/weapon art traces match. Historical comparison deliberately excludes relocated conveyors, boundaries and long projectile travel; current geometry has separate tests.
- Rotation regression: a corner player could initially leave the viewport after rotation. Resize now minimally corrects the camera center to retain the player; all four corner/orientation checks pass without relocating simulation entities or resetting combat timers.
- Commands: `node tests/run.cjs`, changed JavaScript syntax checks, HTML nesting/unique-ID/local-script checks, stylesheet contracts, `git diff --check`, and planner draft/compiled validation.
- A7: exact pushed source is packaged and published through native Sites. The returned saved-version/deployment result is the publication authority; the previous saved Build35 remains the rollback target.

Limits: browser iframe resizing is not physical-phone touch testing. Offscreen attack fairness and zoom/easing comfort need user playtest. No claim of identical whole-arena trajectories after the square geometry change. No combat balance changes or new threat indicators.

Publication succeeded: Build36 saved version `appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_b391d10fc080819190eb2a356b272b82`, source `3dafa13495ac4c18e40063b34efff9cbffa902b5`, deployment `appgdep_6ad8cab0b2748191bd30f29a2644a802`, status `succeeded`. Post-release documentation records these references; it does not change the deployed game.
