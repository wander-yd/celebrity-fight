'use strict';

// Keyboard, pointer, touch and interruption handling.
function release() {
  pointer.down = false;
  touchOrigin = null;
  touchMove = null;
}
function coords(e) {
  const b = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - b.left) * W / b.width,
    y: (e.clientY - b.top) * H / b.height
  };
}
// Register only after bootstrap creates the clock and Debug dialog.
function bindInput() {
  canvas.addEventListener('pointerdown', e => {
    if (!['play', 'tutorial', 'reward'].includes(game.mode)) return;
    canvas.setPointerCapture(e.pointerId);
    const p = coords(e);
    pointer.x = p.x;
    pointer.y = p.y;
    if (e.pointerType === 'touch') {
      touchOrigin = p;
      touchMove = {
        x: 0,
        y: 0
      };
    } else pointer.down = true;
  });
  canvas.addEventListener('pointermove', e => {
    const p = coords(e);
    pointer.x = p.x;
    pointer.y = p.y;
    if (e.pointerType === 'touch' && touchOrigin) touchMove = {
      x: clamp((p.x - touchOrigin.x) / 60, -1, 1),
      y: clamp((p.y - touchOrigin.y) / 60, -1, 1)
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
  document.getElementById('pause').onclick = () => {
    release();
    game.pause();
    syncOverlay();
  };
}
