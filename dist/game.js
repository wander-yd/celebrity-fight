'use strict';

// Bootstrap and fixed-step scheduling only.
const frameClock = VoidTiming.createClock();
function loop(t) {
  const input = {
    mx: touchMove ? touchMove.x : (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0),
    my: touchMove ? touchMove.y : (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0),
    aim: pointer,
    attack: pointer.down || !!touchMove,
    autoAim: !!touchMove
  };
  frameClock.advance(t, game.room, !document.hidden && ['play', 'tutorial', 'tutorialSuccess', 'reward'].includes(game.mode), dt => {
    const mode = game.mode,
      room = game.room;
    game.step(dt, input);
    if (game.player.hp < lastHp) heartFlash = .35;
    if (lastJumpCd > 0 && game.player.jumpCd <= 0) jumpFlash = .2;
    lastHp = game.player.hp;
    lastJumpCd = game.player.jumpCd;
    heartFlash = Math.max(0, heartFlash - dt);
    jumpFlash = Math.max(0, jumpFlash - dt);
    return game.mode === mode && game.room === room;
  });
  syncOverlay();
  hud();
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
    for (const k of Object.keys(keys)) keys[k] = false;
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
