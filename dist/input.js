'use strict';

// Keyboard, pointer, touch and interruption handling.
function release() {
  pointer.down = false;
  touchOrigin = null;
  touchMove = null;
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
function refreshAim() {
  if (!screenPointer.active) return;
  Object.assign(pointer, camera.screenToWorld(screenPointer));
}
function trackPointer(e) {
  Object.assign(screenPointer, screenCoords(e), {
    active: true
  });
  refreshAim();
}
// Register only after bootstrap creates the clock and Debug dialog.
function bindInput() {
  canvas.addEventListener('pointerdown', e => {
    if (!['play', 'tutorial', 'reward'].includes(game.mode)) return;
    canvas.setPointerCapture(e.pointerId);
    trackPointer(e);
    if (e.pointerType === 'touch') {
      touchOrigin = {
        x: e.clientX,
        y: e.clientY
      };
      touchMove = {
        x: 0,
        y: 0
      };
    } else pointer.down = true;
  });
  canvas.addEventListener('pointermove', e => {
    trackPointer(e);
    if (e.pointerType === 'touch' && touchOrigin) touchMove = {
      x: clamp((e.clientX - touchOrigin.x) / 60, -1, 1),
      y: clamp((e.clientY - touchOrigin.y) / 60, -1, 1)
    };
  });
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('pointerup', e => {
    if (e.target === canvas || e.pointerType !== 'touch') release();
  });
  window.addEventListener('keydown', e => {
    if (debugPanel.isOpen()) {
      if (e.key === 'Escape') {
        e.preventDefault();
        debugPanel.close();
      }
      return;
    }
    // Let focused menu controls keep their native Enter/Space activation.
    const tag = e.target?.tagName?.toLowerCase();
    if (['Space', 'Enter'].includes(e.code) && ['button', 'summary', 'input', 'select', 'textarea', 'a'].includes(tag)) return;
    if (!['play', 'tutorial', 'reward'].includes(game.mode) && e.key.toLowerCase() !== 'p' && e.key !== 'Escape') return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    keys[e.key.toLowerCase()] = true;
    if (e.repeat) return;
    if (e.code === 'Space') game.jump();
    if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
      release();
      game.pause();
      syncOverlay();
    }
  });
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
  function blur() {
    frameClock.reset();
    for (const k of Object.keys(keys)) keys[k] = false;
    release();
    if (['play', 'reward'].includes(game.mode)) game.pause();
    syncOverlay();
  }
  window.addEventListener('blur', blur);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) blur();else frameClock.reset();
  });
  for (const [id, fn] of [['jump', () => game.jump()]]) document.getElementById(id).onpointerdown = e => {
    e.preventDefault();
    fn();
  };
  window.addEventListener('resize', fitArena);
  window.visualViewport?.addEventListener('resize', fitArena);
  document.getElementById('pause').onclick = () => {
    release();
    game.pause();
    syncOverlay();
  };
}
