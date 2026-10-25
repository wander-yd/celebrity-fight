'use strict';

// Controller coordinator and view-coordinate bridge; no weapon rules here.
const playerController = {
  read() { return VoidInput.command((inputMode === 'touch' ? touchController : keyboardController).read()); },
  clear() { keyboardController.clear(); touchController.clear(); },
  jump() { return game.applyInputActions(VoidInput.command({ ...this.read(), jumpPressed: true })); },
  afterStep(command, previousSwing) {
    const started = game.room.melee.some(swing => swing.origin === game.player && swing !== previousSwing);
    if (command.attackPressed && started) touchController.acceptAttack();
  }
};
function release() { playerController.clear(); }
function endPointer(e) { if (e.pointerType === 'touch') touchController.end(e); else keyboardController.end(e); }
function cancelPointer(e) { if (e.pointerType === 'touch') touchController.cancel(e); else keyboardController.end(e); }
function setInputMode(mode) {
  if (inputMode === mode) return;
  release();
  inputMode = mode;
  syncTouchControls();
}
function syncTouchControls() {
  const touch = inputMode === 'touch';
  document.getElementById('game-stage').dataset.input = inputMode;
  document.getElementById('move-stick').hidden = !touch || !['play', 'tutorial', 'reward'].includes(game.mode);
  document.getElementById('jump').hidden = !touch || !['play', 'tutorial'].includes(game.mode);
  document.getElementById('attack').hidden = !touch || !['play', 'tutorial'].includes(game.mode);
  updateControlHints();
}
function screenCoords(e) {
  const b = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - b.left) * camera.width / Math.max(1, b.width),
    y: (e.clientY - b.top) * camera.height / Math.max(1, b.height)
  };
}
function coords(e) {
  return camera.screenToWorld(screenCoords(e));
}
// Register only after bootstrap creates the clock and Debug dialog.
function bindInput() {
  inputMode = window.matchMedia?.('(pointer: coarse)').matches ? 'touch' : 'keyboard';
  syncTouchControls();
  window.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') setInputMode('touch');else if (e.pointerType === 'mouse') setInputMode('keyboard');
  });
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' && touchPointerId === null && jumpPointerId === null && attackPointerId === null && (e.movementX || e.movementY)) setInputMode('keyboard');
  });
  canvas.addEventListener('pointerdown', e => {
    setInputMode(e.pointerType === 'touch' ? 'touch' : 'keyboard');
    if (!['play', 'tutorial', 'reward'].includes(game.mode)) return;
    if (e.pointerType === 'touch') touchController.start(e); else keyboardController.start(e);
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') touchController.move(e); else keyboardController.move(e);
  });
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', cancelPointer);
  canvas.addEventListener('lostpointercapture', cancelPointer);
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', cancelPointer);
  keyboardController.bind();
  function blur() {
    frameClock.reset();
    release();
    if (['play', 'reward'].includes(game.mode)) game.pause();
    syncOverlay();
  }
  window.addEventListener('blur', blur);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) blur();else frameClock.reset();
  });
  touchController.bind();
  window.addEventListener('resize', fitArena);
  window.visualViewport?.addEventListener('resize', fitArena);
  document.getElementById('pause').onclick = () => {
    release();
    game.pause();
    syncOverlay();
  };
}
