'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');
const {
  harness
} = require('./harness.cjs');
let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('PASS ' + name);
}
function start(width = 390, height = 844, coarse = false) {
  const h = harness(undefined, {
    width,
    height,
    coarse,
    rects: {
      game: {
        left: 0,
        top: 0,
        width,
        height
      }
    }
  });
  h.click('start');
  h.click('skip');
  h.frame(0);
  h.run('game.spawnTimer=999;game.player.inv=999');
  return h;
}
function finger(id, x = 90, y = 650) {
  return {
    pointerType: 'touch',
    pointerId: id,
    clientX: x,
    clientY: y,
    preventDefault() {}
  };
}
function down(h, id = 1, x = 90, y = 650) {
  h.canvasListeners.pointerdown(finger(id, x, y));
}
function move(h, id = 1, x = 130, y = 650) {
  h.canvasListeners.pointermove(finger(id, x, y));
}
test('narrow desktop stays keyboard-only; coarse devices show touch controls initially', () => {
  for (const coarse of [false, true]) {
    const h = start(390, 844, coarse);
    assert.equal(h.el('move-stick').hidden, !coarse);
    assert.equal(h.el('jump').hidden, !coarse);
  }
  const h = start(320, 568);
  h.env.window.innerWidth = 280;
  h.listeners.resize();
  assert.equal(h.el('jump').hidden, true);
});
test('actual touch, keyboard and mouse change controls without changing combat', () => {
  const h = start();
  const snapshot = h.run('JSON.stringify({player:game.player,room:game.room,time:game.time})');
  h.listeners.pointerdown(finger(4));
  assert.equal(h.el('jump').hidden, false);
  h.listeners.keydown({
    key: 'w',
    code: 'KeyW',
    target: h.el('game'),
    preventDefault() {}
  });
  assert.equal(h.el('jump').hidden, true);
  h.listeners.keyup({
    key: 'w'
  });
  h.listeners.pointerdown(finger(5));
  h.listeners.pointermove({
    pointerType: 'mouse',
    movementX: 1,
    movementY: 0
  });
  assert.equal(h.el('move-stick').hidden, true);
  assert.equal(h.run('JSON.stringify({player:game.player,room:game.room,time:game.time})'), snapshot);
});
test('visible floating stick starts neutral, filters small jitters and gives full radial movement', () => {
  for (const [w, height] of [[390, 844], [844, 390]]) {
    const h = start(w, height);
    down(h, 1, 100, 200);
    assert.equal(h.el('move-stick').classList.contains('active'), true);
    assert.equal(h.el('move-stick').style.left, '100px');
    assert.equal(h.run('Math.hypot(touchMove.x,touchMove.y)'), 0);
    move(h, 1, 103, 202);
    assert.equal(h.run('Math.hypot(touchMove.x,touchMove.y)'), 0);
    move(h, 1, 120, 200);
    const partial = h.run('touchMove.x');
    assert.ok(partial > 0 && partial < 1);
    move(h, 1, 300, 200);
    assert.equal(h.run('touchMove.x'), 1);
    move(h, 1, 300, 400);
    assert.ok(Math.abs(h.run('Math.hypot(touchMove.x,touchMove.y)') - 1) < 1e-9);
    assert.equal(h.run('touchMove.x'), h.run('touchMove.y'));
    h.canvasListeners.pointerup(finger(1));
    assert.equal(h.run('touchMove'), null);
    assert.equal(h.el('move-stick').classList.contains('active'), false);
    assert.equal(h.el('move-stick').style.left, '100px');
    assert.equal(h.el('move-stick').style.top, '200px');
  }
});
test('only left-side touch starts movement; extra fingers cannot steal its origin', () => {
  const h = start();
  down(h, 9, 300, 600);
  assert.equal(h.run('touchMove'), null);
  down(h, 1);
  move(h, 1);
  const origin = h.run('JSON.stringify(touchOrigin)');
  down(h, 2, 150, 400);
  move(h, 2, 50, 500);
  assert.equal(h.run('touchPointerId'), 1);
  assert.equal(h.run('JSON.stringify(touchOrigin)'), origin);
  assert.equal(h.run('touchMove.x'), 1);
});
test('released stick stays in place; a new higher touch survives stale release events', () => {
  const h = start();
  down(h, 1, 90, 650);
  move(h, 1, 130, 650);
  h.canvasListeners.pointerup(finger(1));
  assert.equal(h.el('move-stick').style.top, '650px');
  down(h, 2, 100, 400);
  move(h, 2, 140, 400);
  h.canvasListeners.lostpointercapture(finger(1));
  assert.equal(h.run('touchPointerId'), 2);
  assert.equal(h.run('touchMove.x'), 1);
  assert.equal(h.el('move-stick').style.top, '400px');
});
test('right Jump and its release leave left movement and auto attack running', () => {
  const h = start();
  down(h);
  move(h);
  const x = h.run('game.player.x');
  h.el('jump').onpointerdown(finger(2, 300, 750));
  assert.ok(h.run('game.player.jump') > 0);
  assert.equal(h.run('touchPointerId'), 1);
  h.el('jump').onpointerup(finger(2));
  h.listeners.pointerup(finger(2));
  assert.equal(h.run('touchMove.x'), 1);
  h.frame(100);
  assert.ok(h.run('game.player.x') > x);
  assert.equal(h.run('jumpPointerId'), null);
});
test('cancel and capture loss only release the owning finger', () => {
  const h = start();
  down(h);
  move(h);
  h.el('jump').onpointerdown(finger(2));
  h.canvasListeners.pointercancel(finger(8));
  assert.equal(h.run('touchMove.x'), 1);
  h.canvasListeners.lostpointercapture(finger(1));
  assert.equal(h.run('touchMove'), null);
  assert.equal(h.run('jumpPointerId'), 2);
  h.el('jump').onlostpointercapture(finger(2));
  assert.equal(h.run('jumpPointerId'), null);
});
test('mouse activity during held touch does not hide controls or cancel movement', () => {
  const h = start();
  down(h);
  move(h);
  h.listeners.pointermove({
    pointerType: 'mouse',
    movementX: 2,
    movementY: 2
  });
  assert.equal(h.el('jump').hidden, false);
  assert.equal(h.run('touchMove.x'), 1);
  h.listeners.pointerdown({
    pointerType: 'mouse'
  });
  assert.equal(h.el('jump').hidden, true);
  assert.equal(h.run('touchMove'), null);
});
test('pause, Debug, blur and rotation clear held touch without stale movement on resume', () => {
  for (const kind of ['pause', 'debug', 'blur', 'rotation']) {
    const h = start();
    down(h);
    move(h);
    h.el('jump').onpointerdown(finger(2));
    const snapshot = h.run('JSON.stringify({player:game.player,room:game.room,time:game.time})');
    if (kind === 'pause') h.click('pause');
    if (kind === 'debug') h.click('debug-open');
    if (kind === 'blur') h.listeners.blur();
    if (kind === 'rotation') {
      h.env.window.innerWidth = 844;
      h.env.window.innerHeight = 390;
      h.listeners.resize();
    }
    assert.equal(h.run('touchMove'), null, kind);
    assert.equal(h.run('jumpPointerId'), null, kind);
    if (kind !== 'rotation') assert.equal(h.el('move-stick').hidden, true, kind);
    assert.equal(h.run('JSON.stringify({player:game.player,room:game.room,time:game.time})'), snapshot, kind);
  }
});
test('reward retains movement stick, hides Jump and clears controls at item selection', () => {
  const h = start(390, 844, true);
  h.run('game.debugJump(1,true);game.boss.grace=0;game.damage(game.boss,999);game.finishIfClear();syncOverlay()');
  assert.equal(h.run('game.mode'), 'reward');
  assert.equal(h.el('move-stick').hidden, false);
  assert.equal(h.el('jump').hidden, true);
  down(h);
  move(h);
  h.run('game.player.x=game.room.pickup.x;game.player.y=game.room.pickup.y;game.step(.01);syncOverlay()');
  assert.equal(h.run('game.mode'), 'upgrade');
  assert.equal(h.el('move-stick').hidden, true);
  assert.equal(h.run('touchMove'), null);
});
test('touch holds original auto aim/attack behavior; original simulation is unchanged', () => {
  const h = start();
  down(h);
  h.run('var received;game.step=(dt,input)=>{received=input}');
  h.frame(17);
  assert.equal(h.run('received.autoAim'), true);
  assert.equal(h.run('received.attack'), true);
  assert.equal(h.run('received.mx'), 0);
  h.canvasListeners.pointerup(finger(1));
  h.frame(34);
  assert.equal(h.run('received.attack'), false);
  assert.equal(h.run('received.autoAim'), false);
  assert.equal(fs.readFileSync('dist/core.js', 'utf8'), cp.execFileSync('git', ['show', '700c4fabf8867b04a05e4de829d90ab73872ba53:dist/core.js'], {
    encoding: 'utf8'
  }));
});
console.log(`${passed} touch input scenario groups passed; physical-device comfort still needs playtest.`);
