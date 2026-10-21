'use strict';

// Keyboard, pointer, touch and interruption handling.
function release() {
  pointer.down = false;
  jumpPointerId = null;
  releaseMove();
}
function releaseMove() {
  touchPointerId = null;
  touchOrigin = null;
  touchMove = null;
  const stick = document.getElementById('move-stick');
  stick.classList.remove('active');
}
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
}
function moveStick(e) {
  if (e.pointerId !== touchPointerId || !touchOrigin) return;
  const p = screenCoords(e),
    dx = p.x - touchOrigin.x,
    dy = p.y - touchOrigin.y;
  const distance = Math.hypot(dx, dy),
    throwRadius = 40,
    deadzone = 6;
  const amount = clamp((distance - deadzone) / (throwRadius - deadzone), 0, 1);
  touchMove = {
    x: distance ? dx / distance * amount : 0,
    y: distance ? dy / distance * amount : 0
  };
  const visual = distance ? Math.min(distance, throwRadius) / distance : 0;
  document.getElementById('move-thumb').style.transform = `translate(${dx * visual}px, ${dy * visual}px)`;
}
function endPointer(e) {
  if (e.pointerType === 'touch') {
    if (e.pointerId === touchPointerId) releaseMove();
    if (e.pointerId === jumpPointerId) jumpPointerId = null;
  } else pointer.down = false;
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
  inputMode = window.matchMedia?.('(pointer: coarse)').matches ? 'touch' : 'keyboard';
  syncTouchControls();
  window.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') setInputMode('touch');else if (e.pointerType === 'mouse') setInputMode('keyboard');
  });
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' && touchPointerId === null && jumpPointerId === null && (e.movementX || e.movementY)) setInputMode('keyboard');
  });
  canvas.addEventListener('pointerdown', e => {
    setInputMode(e.pointerType === 'touch' ? 'touch' : 'keyboard');
    if (!['play', 'tutorial', 'reward'].includes(game.mode)) return;
    if (e.pointerType === 'touch') {
      const p = screenCoords(e);
      if (touchPointerId !== null || p.x > camera.width / 2) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      touchPointerId = e.pointerId;
      touchOrigin = p;
      touchMove = {
        x: 0,
        y: 0
      };
      const stick = document.getElementById('move-stick');
      stick.classList.add('active');
      stick.style.left = p.x + 'px';
      stick.style.top = p.y + 'px';
      document.getElementById('move-thumb').style.transform = '';
      moveStick(e);
    } else {
      canvas.setPointerCapture(e.pointerId);
      trackPointer(e);
      pointer.down = true;
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') moveStick(e);else trackPointer(e);
  });
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('lostpointercapture', endPointer);
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);
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
  const jump = document.getElementById('jump');
  jump.onpointerdown = e => {
    e.preventDefault();
    if (e.pointerType !== 'touch' || jumpPointerId !== null) return;
    setInputMode('touch');
    if (!['play', 'tutorial'].includes(game.mode)) return;
    jumpPointerId = e.pointerId;
    jump.setPointerCapture(e.pointerId);
    game.jump();
  };
  jump.onpointerup = endPointer;
  jump.onpointercancel = endPointer;
  jump.onlostpointercapture = endPointer;
  window.addEventListener('resize', fitArena);
  window.visualViewport?.addEventListener('resize', fitArena);
  document.getElementById('pause').onclick = () => {
    release();
    game.pause();
    syncOverlay();
  };
}
