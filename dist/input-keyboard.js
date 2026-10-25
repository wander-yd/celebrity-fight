'use strict';

// Keyboard/mouse adapter. Device input only; combat rules remain in Arena.
const keyboardController = (() => {
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
  function read() {
    return { moveX: (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0),
      moveY: (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0),
      aim: pointer, attackHeld: pointer.down, attackPressed: false, jumpPressed: false };
  }
  function clear() {
    pointer.down = false;
    for (const key of Object.keys(keys)) keys[key] = false;
  }
  function start(e) { canvas.setPointerCapture(e.pointerId); trackPointer(e); pointer.down = true; }
  function bind() {
    window.addEventListener('keydown', e => {
      setInputMode('keyboard');
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
      if (!['play', 'tutorial', 'reward', 'bossPractice'].includes(game.mode) && e.key.toLowerCase() !== 'p' && e.key !== 'Escape') return;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      keys[e.key.toLowerCase()] = true;
      if (e.repeat) return;
      if (e.code === 'Space') playerController.jump();
      if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
        release();
        game.pause();
        syncOverlay();
      }
    });
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
  }
  return { read, clear, start, move: trackPointer, end() { pointer.down = false; }, refreshAim, bind };
})();
