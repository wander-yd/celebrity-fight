'use strict';

// Bootstrap and fixed-step scheduling only.
const frameClock = VoidTiming.createClock();
function loop(t) {
  syncCameraRoom();
  keyboardController.refreshAim();
  const cameraDt = cameraStamp === null ? 0 : Math.max(0, Math.min(.25, (t - cameraStamp) / 1000));
  cameraStamp = t;
  frameClock.advance(t, game.room, !document.hidden && ['play', 'tutorial', 'tutorialSuccess', 'reward'].includes(game.mode), dt => {
    const mode = game.mode,
      room = game.room;
    const command = playerController.read(), previousSwing = game.room.melee.find(swing => swing.origin === game.player);
    game.step(dt, VoidInput.simulation(command));
    playerController.afterStep(command, previousSwing);
    if (game.player.hp < lastHp) heartFlash = .35;
    if (lastJumpCd > 0 && game.player.jumpCd <= 0) jumpFlash = .2;
    lastHp = game.player.hp;
    lastJumpCd = game.player.jumpCd;
    heartFlash = Math.max(0, heartFlash - dt);
    jumpFlash = Math.max(0, jumpFlash - dt);
    return game.mode === mode && game.room === room;
  });
  syncCameraRoom();
  if (!document.hidden && ['play', 'tutorial', 'tutorialSuccess', 'reward'].includes(game.mode)) camera.follow(game.player, cameraDt);
  keyboardController.refreshAim();
  syncOverlay();
  hud();
  touchController.drawAim();
  draw();
  for (const e of game.events.splice(0)) {
    if (e === 'swing') tone(160, .065, 'triangle', .018);
    if (e === 'hurt') tone(90, .2, 'sawtooth');
    if (e === 'jump') tone(400, .12, 'sine');
    if (e === 'bossdead') tone(600, .45);
    if (e === 'phase') tone(310, .2);
  }
  requestAnimationFrame(loop);
}
const debugPanel = createDebugCodex({
  game,
  releaseInput() {
    release();
  },
  syncOverlay,
  hud,
  drawEnemy: (e, c) => drawMob(e, c, 3),
  drawPerson: (kind, c) => person(70, 86, kind, 1.25, c)
});
bindInput();
syncOverlay();
hud();
fitArena();
draw();
requestAnimationFrame(loop);
