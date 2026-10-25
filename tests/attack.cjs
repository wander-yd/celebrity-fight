'use strict';
const assert = require('node:assert/strict');
const { harness } = require('./harness.cjs');
let passed = 0;
const event = (id = 2, x = 320, y = 650) => ({ pointerType: 'touch', pointerId: id, clientX: x, clientY: y, preventDefault() {} });
function start(width = 390, height = 844) {
  const h = harness(undefined, { width, height, coarse: true, rects: { game: { left: 0, top: 0, width, height } } });
  h.click('start'); h.click('skip'); h.frame(0);
  h.run('game.spawnTimer=999;game.player.inv=999');
  return h;
}
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
test('movement, held attack and Jump own separate fingers in both orientations', () => {
  for (const [w, height] of [[390, 844], [844, 390]]) {
    const h = start(w, height);
    h.canvasListeners.pointerdown(event(1, 70, 180));
    h.canvasListeners.pointermove(event(1, 110, 180));
    h.el('attack').onpointerdown(event());
    h.el('jump').onpointerdown(event(3));
    h.frame(17);
    assert.ok(h.run('game.player.attackCd') > 0);
    assert.ok(h.run('game.player.jump') > 0);
    assert.equal(h.run('touchMove.x'), 1);
    h.el('jump').onpointerup(event(3));
    assert.equal(h.run('attackPointerId'), 2);
    h.el('attack').onpointerup(event());
    assert.equal(h.run('attackPointerId'), null);
    assert.equal(h.run('touchMove.x'), 1);
    assert.equal(h.run('attackQueued'), false);
  }
});
test('tap between frames fires once, waits for cooldown, and never accumulates taps', () => {
  const h = start();
  h.run('game.player.attackCd=.10');
  for (let i = 0; i < 5; i++) { h.el('attack').onpointerdown(event()); h.el('attack').onpointerup(event()); }
  h.frame(50);
  assert.equal(h.run('game.room.swings.length'), 0);
  assert.equal(h.run('attackQueued'), true);
  h.frame(150);
  assert.ok(h.run('game.player.attackCd') > .3);
  assert.equal(h.run('attackQueued'), false);
  h.frame(400); h.frame(650); h.frame(900);
  assert.equal(h.run('game.player.attackCd'), 0);
});
test('hold repeats at normal cadence; releasing completes an initiated downswing without repeating', () => {
  const h = start();
  h.run("var victim=game.spawnMob('shield',game.room,{x:game.player.x+50,y:game.player.y});victim.hp=100;victim.stun=999;victim.broken=999");
  h.el('attack').onpointerdown(event()); h.frame(17);
  h.el('attack').onpointerup(event());
  h.frame(230);
  assert.equal(h.run('victim.hp'), 96);
  h.frame(480); h.frame(730);
  assert.equal(h.run('victim.hp'), 96);
  h.el('attack').onpointerdown(event());
  h.frame(980); h.frame(1230); h.frame(1480);
  assert.equal(h.run('victim.hp'), 88);
});
test('drag has a jitter threshold, stays manual until release, and ignores other fingers', () => {
  const h = start();
  h.el('attack').onpointerdown(event());
  h.el('attack').onpointermove(event(9, 350, 650));
  assert.equal(h.run('attackManual'), false);
  h.el('attack').onpointermove(event(2, 325, 654));
  assert.equal(h.run('attackManual'), false);
  h.el('attack').onpointermove(event(2, 290, 650));
  assert.equal(h.run('attackManual'), true);
  assert.equal(h.run('VoidInput.simulation(playerController.read()).aim.x-game.player.x'), -100);
  h.el('attack').onpointermove(event(2, 317, 650));
  assert.equal(h.run('attackManual'), true);
  h.frame(17);
  assert.equal(h.el('touch-aim').hidden, false);
  h.el('attack').onpointerup(event());
  assert.equal(h.el('touch-aim').hidden, true);
  h.el('attack').onpointerdown(event(4));
  assert.equal(h.run('attackManual'), false);
});
test('soft aim keeps nearby targets stable, prefers reachable bodies, and drops hidden/dead targets', () => {
  const h = start();
  h.run("game.player.x=364;game.player.y=364;camera.x=364;camera.y=364;var near=game.spawnMob('shield',game.room,{x:430,y:364});var other=game.spawnMob('shield',game.room,{x:432,y:364});");
  assert.equal(h.run('touchController.softAim().id'), h.run('near.id'));
  h.run('other.x=425');
  assert.equal(h.run('touchController.softAim().id'), h.run('near.id'));
  h.run('other.x=380');
  assert.equal(h.run('touchController.softAim().id'), h.run('other.id'));
  h.run('other.hp=0;near.x=camera.x+camera.viewWidth');
  assert.equal(h.run('touchController.softAim().id'), undefined);
  h.run('game.player.face=Math.PI/2');
  assert.ok(Math.abs(h.run('touchController.softAim().y-game.player.y') - 100) < 1e-8);
  h.run('near.x=game.player.x+112;near.r=27;other.hp=100;other.x=game.player.x+110;other.r=10;touchTargetId=other.id');
  assert.equal(h.run('touchController.softAim().id'), h.run('near.id'));
});
test('assisted aim cannot extend melee range', () => {
  const h = start();
  h.run("var far=game.spawnMob('shield',game.room,{x:game.player.x+150,y:game.player.y});far.hp=100;far.stun=999;far.broken=999");
  h.el('attack').onpointerdown(event()); h.frame(230);
  assert.equal(h.run('far.hp'), 100);
});
test('interruptions clear held and queued attacks; unrelated and stale releases do not', () => {
  for (const kind of ['pause', 'debug', 'blur', 'rotation', 'cancel', 'capture', 'visibility', 'room']) {
    const h = start();
    h.run('game.player.attackCd=.4');
    h.el('attack').onpointerdown(event());
    if (kind === 'pause') h.click('pause');
    if (kind === 'debug') h.click('debug-open');
    if (kind === 'blur') h.listeners.blur();
    if (kind === 'rotation') { h.env.window.innerWidth = 844; h.env.window.innerHeight = 390; h.listeners.resize(); }
    if (kind === 'cancel') h.el('attack').onpointercancel(event());
    if (kind === 'capture') h.el('attack').onlostpointercapture(event());
    if (kind === 'visibility') { h.env.document.hidden = true; h.documentListeners.visibilitychange(); }
    if (kind === 'room') h.run('game.setupChapter();syncCameraRoom()');
    assert.equal(h.run('attackPointerId'), null, kind);
    assert.equal(h.run('attackQueued'), false, kind);
  }
  const h = start();
  h.el('attack').onpointerdown(event()); h.el('attack').onpointerup(event());
  h.el('attack').onpointerdown(event(4));
  h.el('attack').onlostpointercapture(event());
  assert.equal(h.run('attackPointerId'), 4);
  h.listeners.pointermove({ pointerType: 'mouse', movementX: 1, movementY: 1 });
  assert.equal(h.run('inputMode'), 'touch');
});
test('keyboard and mouse retain manual attack input and device-specific help', () => {
  const h = start();
  h.click('pause');
  assert.ok(h.el('controls-help-text').textContent.includes('Drag ATTACK'));
  assert.ok(!h.el('controls-help-text').textContent.includes('WASD'));
  h.listeners.keydown({ key: 'p', code: 'KeyP', preventDefault() {} });
  h.canvasListeners.pointerdown({ pointerType: 'mouse', pointerId: 7, clientX: 100, clientY: 100 });
  assert.equal(h.run('VoidInput.simulation(playerController.read()).attack'), true);
  assert.equal(h.run('VoidInput.simulation(playerController.read()).aim.x'), h.run('pointer.x'));
  assert.equal(h.el('attack').hidden, true);
  h.click('pause');
  assert.ok(h.el('controls-help-text').textContent.includes('WASD'));
  assert.ok(!h.el('controls-help-text').textContent.includes('Drag ATTACK'));
});
console.log(`${passed} independent attack scenario groups passed.`);
