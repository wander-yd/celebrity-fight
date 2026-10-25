'use strict';

// Touch adapter owns gestures, assisted aim and feedback, not hit decisions.
const touchController = (() => {
  let frozenFace = null;
  function releaseMove() {
    touchPointerId = null;
    touchOrigin = null;
    touchMove = null;
    const stick = document.getElementById('move-stick');
    stick.classList.remove('active');
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
  function softTouchAim() {
    const p = game.player;
    const candidates = game.targets().filter(e => {
      const at = camera.worldToScreen(e);
      return at.x >= 0 && at.x <= camera.width && at.y >= 0 && at.y <= camera.height;
    });
    const reachable = e => dist(p, e) < PLAYER_ABILITIES.melee.range + e.r;
    candidates.sort((a, b) => Number(reachable(b)) - Number(reachable(a)) || dist(p, a) - dist(p, b));
    const best = candidates[0], current = candidates.find(e => e.id === touchTargetId);
    const target = current && best && reachable(current) === reachable(best) && dist(p, current) <= dist(p, best) * 1.25 + 8 ? current : best;
    touchTargetId = target?.id ?? null;
    return target || { x: p.x + Math.cos(p.face) * 100, y: p.y + Math.sin(p.face) * 100 };
  }
  function drawTouchAim() {
    const line = document.getElementById('touch-aim');
    line.hidden = !(inputMode === 'touch' && attackPointerId !== null && attackManual && ['play', 'tutorial', 'bossPractice'].includes(game.mode));
    if (line.hidden) return;
    const p = camera.worldToScreen(game.player);
    line.style.left = p.x + 'px';
    line.style.top = p.y + 'px';
    line.style.transform = 'rotate(' + Math.atan2(attackDirection.y, attackDirection.x) + 'rad)';
  }
  function clear() {
    frozenFace = null;
    jumpPointerId = null;
    attackPointerId = null;
    attackOrigin = null;
    attackDirection = null;
    attackManual = false;
    attackQueued = false;
    touchTargetId = null;
    document.getElementById('touch-aim').hidden = true;
    releaseMove();
  }
  function read() {
    const p = game.player;
    const held = attackPointerId !== null;
    const aimAngle = held ? (attackManual && attackDirection
      ? Math.atan2(attackDirection.y, attackDirection.x) : undefined)
      : (frozenFace ?? p.face);
    const aim = Number.isFinite(aimAngle)
      ? { x: p.x + Math.cos(aimAngle) * 100, y: p.y + Math.sin(aimAngle) * 100 }
      : softTouchAim();
    return { moveX: touchMove?.x || 0, moveY: touchMove?.y || 0, aim, aimAngle,
      attackHeld: held, attackPressed: attackQueued, jumpPressed: false };
  }
  function endPointer(e, capture = true) {
    if (e.pointerId === touchPointerId) releaseMove();
    if (e.pointerId === jumpPointerId) jumpPointerId = null;
    if (e.pointerId === attackPointerId) {
      if (capture) {
        const input = read(), p = game.player;
        frozenFace = Number.isFinite(input.aimAngle) ? input.aimAngle
          : Math.atan2(input.aim.y - p.y, input.aim.x - p.x);
      } else {
        frozenFace = game.player.face;
      }
      attackPointerId = null; attackOrigin = null;
      document.getElementById('touch-aim').hidden = true;
    }
  }
  function cancelPointer(e) {
    if (e.pointerId === attackPointerId) { attackQueued = false; attackManual = false; attackDirection = null; }
    endPointer(e, false);
  }
  function start(e) {
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
  }
  function bind() {
    const jump = document.getElementById('jump');
    jump.onpointerdown = e => {
      e.preventDefault();
      if (e.pointerType !== 'touch' || jumpPointerId !== null) return;
      setInputMode('touch');
      if (!['play', 'tutorial', 'bossPractice'].includes(game.mode)) return;
      jumpPointerId = e.pointerId;
      jump.setPointerCapture(e.pointerId);
      playerController.jump();
    };
    jump.onpointerup = endPointer;
    jump.onpointercancel = cancelPointer;
    jump.onlostpointercapture = cancelPointer;
    const attack = document.getElementById('attack');
    attack.onpointerdown = e => {
      if (e.pointerType !== 'touch' || attackPointerId !== null || !['play', 'tutorial', 'bossPractice'].includes(game.mode)) return;
      e.preventDefault();
      setInputMode('touch');
      attackPointerId = e.pointerId;
      attackOrigin = { x: e.clientX, y: e.clientY };
      attackManual = false;
      attackDirection = null;
      frozenFace = null;
      attackQueued = true;
      attack.setPointerCapture(e.pointerId);
    };
    attack.onpointermove = e => {
      if (e.pointerId !== attackPointerId || !attackOrigin) return;
      e.preventDefault();
      const dx = e.clientX - attackOrigin.x, dy = e.clientY - attackOrigin.y, length = Math.hypot(dx, dy);
      if (length >= 12) attackManual = true;
      if (attackManual && length >= 2) attackDirection = { x: dx / length, y: dy / length };
    };
    attack.onpointerup = endPointer;
    attack.onpointercancel = cancelPointer;
    attack.onlostpointercapture = cancelPointer;
  }
  return { read, clear, start, move: moveStick, end: endPointer, cancel: cancelPointer,
    softAim: softTouchAim, drawAim: drawTouchAim, acceptAttack() { attackQueued = false; }, bind };
})();
