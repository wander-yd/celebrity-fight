'use strict';

const assert = require('node:assert/strict');
const {
  harness
} = require('./harness.cjs');
let passed = 0,
  failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('PASS ' + name);
  } catch (error) {
    failed++;
    console.error('FAIL ' + name + ': ' + error.message);
  }
}
function start() {
  const h = harness();
  h.click('start');
  h.click('skip');
  h.run('game.random=()=>.5;game.player.inv=999;game.spawnTimer=999');
  return h;
}
test('render rates 15 through 144 FPS advance the same two seconds of simulation', () => {
  let baseline;
  for (const fps of [60, 15, 20, 30, 144]) {
    const h = start();
    h.frame(0);
    h.run('game.player.x=200;game.player.y=300;keys.d=true;game.jump()');
    for (let i = 1; i <= fps * 2; i++) h.frame(i * 1000 / fps);
    assert.ok(Math.abs(h.run('game.time') - 2) < 1e-8, fps + ' FPS lost elapsed time: ' + h.run('game.time'));
    const state = h.run('JSON.stringify({time:game.time,player:game.player,spawnTimer:game.spawnTimer})');
    baseline ??= state;
    assert.equal(state, baseline, fps + ' FPS changed simulation');
  }
});
test('first callback establishes time without a startup simulation jump', () => {
  const h = start();
  h.frame(100000);
  assert.equal(h.run('game.time'), 0);
});
test('long stalls advance at most 250ms instead of unbounded catch-up', () => {
  const h = start();
  h.frame(0);
  h.frame(10000);
  assert.ok(Math.abs(h.run('game.time') - .25) < 1e-8);
});
test('missing and unmounted IDs return null instead of invented nodes', () => {
  const h = start();
  assert.equal(h.el('does-not-exist'), null);
  assert.equal(h.el('start'), null);
  h.click('pause');
  assert.ok(h.el('resume'));
  h.click('resume');
  assert.equal(h.el('resume'), null);
});
test('pause, debug, blur and visibility transitions never catch up inactive time', () => {
  for (const kind of ['pause', 'debug', 'blur', 'hidden']) {
    const h = start();
    h.frame(0);
    h.frame(100);
    const before = h.run('game.time');
    if (kind === 'pause') h.click('pause');
    if (kind === 'debug') h.click('debug-open');
    if (kind === 'blur') h.listeners.blur();
    if (kind === 'hidden') {
      h.env.document.hidden = true;
      h.documentListeners.visibilitychange();
    }
    h.frame(10000);
    assert.equal(h.run('game.time'), before, kind + ' advanced while inactive');
    if (kind === 'debug') h.click('debug-close');else {
      h.env.document.hidden = false;
      if (kind === 'hidden') h.documentListeners.visibilitychange();
      h.click('resume');
    }
    h.frame(20000);
    assert.equal(h.run('game.time'), before, kind + ' caught up inactive time');
    h.frame(20000 + 1000 / 60);
    assert.ok(Math.abs(h.run('game.time') - before - 1 / 60) < 1e-8);
  }
});
test('chapter and run changes discard old accumulated time', () => {
  const h = start();
  h.frame(0);
  h.frame(100);
  h.run('game.newRun()');
  h.frame(10000);
  assert.equal(h.run('game.time'), 0);
  h.frame(10000 + 1000 / 60);
  assert.ok(h.run('game.time') > 0);
  h.run('game.debugJump(1,true);game.boss.grace=0;game.damage(game.boss,999);game.player.x=game.boss.x;game.player.y=game.boss.y;game.spawned=game.waveTotal;game.spawnTimer=999');
  h.frame(11000);
  h.frame(11250);
  assert.equal(h.run('game.mode'), 'reward');
  // Catch-up must stop on the clear transition instead of walking straight into the reward.
  assert.equal(h.run('game.room.pickup.used'), false);
});
test('hidden tutorial does not advance or catch up on visibility return', () => {
  const h = harness();
  h.click('start');
  h.click('practice');
  h.frame(0);
  h.run('game.jump()');
  h.frame(100);
  const before = h.run('game.player.jump');
  h.env.document.hidden = true;
  h.documentListeners.visibilitychange();
  h.frame(10000);
  h.frame(10100);
  assert.equal(h.run('game.player.jump'), before);
  h.env.document.hidden = false;
  h.documentListeners.visibilitychange();
  h.frame(20000);
  assert.equal(h.run('game.player.jump'), before);
});
test('shared item values reach combat, pause, choices and Codex descriptions', () => {
  const fs = require('fs');
  const changed = fs.readFileSync('dist/core.js', 'utf8').replace(/settleDuration:\s*2\b/, 'settleDuration:4').replace(/settleBase:\s*2\b/, 'settleBase:3').replace(/settleBonusCap:\s*8\b/, 'settleBonusCap:9').replace(/cloneDuration:\s*3\b/, 'cloneDuration:5').replace(/markDuration:\s*2\b/, 'markDuration:7').replace(/(landingZone:\s*Object\.freeze\(\{[\s\S]*?duration:)\s*2\b/, '$1 6');
  const h = harness(changed);
  h.click('start');
  h.click('skip');
  h.run("game.items=VoidArena.ITEMS.map(x=>x.id);game.player.x=480;game.player.y=360;const target=game.spawnMob('shield',game.room,{x:530,y:360});target.hp=100;game.jump();assert.equal(game.room.clones[0].life,5);game.land();assert.equal(target.mark,7);assert.equal(game.room.fields.find(z=>z.kind==='settle').life,4);assert.equal(game.room.fields.find(z=>z.kind==='slow').life,6);for(let i=0;i<30;i++)game.record(target,'melee');game.updateFields(4.1);assert.equal(target.hp,84);");
  h.click('pause');
  const pause = h.el('overlay').innerHTML;
  for (const value of ['4-second settlement', '3 to 12 damage', '5 seconds', '6-second slowing', '7 seconds']) assert.ok(pause.includes(value), value);
  h.click('debug-open');
  h.unlock('voiddebug');
  h.click('debug-tab-items');
  const guide = h.el('debug-body').innerHTML;
  for (const value of ['4-second settlement', '3 to 12 damage', '5 seconds', '6-second slowing', '7 seconds']) assert.ok(guide.includes(value), value);
  h.click('debug-close');
  h.run("game.offer=VoidArena.ITEMS.filter(x=>['settle','clone','chain'].includes(x.id));game.mode='upgrade';syncOverlay()");
  const choices = h.el('overlay').innerHTML;
  for (const value of ['4-second settlement', '5 seconds', '7 seconds']) assert.ok(choices.includes(value), value);
});
test('test fixture catches broken HTML wiring and removes old dialog inputs', () => {
  const fs = require('fs');
  const html = fs.readFileSync('dist/index.html', 'utf8').replace('id="health"', 'id="broken-health"');
  assert.throws(() => harness(undefined, {
    html
  }), /null/);
  const h = harness();
  h.click('debug-open');
  assert.ok(h.el('debug-password'));
  h.unlock('voiddebug');
  assert.equal(h.el('debug-password'), null);
});
test('input handlers wait until the clock and Debug dialog are initialized', () => {
  let checked = false;
  harness(undefined, {
    afterScript(file, {
      listeners
    }) {
      if (file === 'input.js') {
        checked = true;
        assert.equal(listeners.keydown, undefined);
        assert.equal(listeners.blur, undefined);
      }
    }
  });
  assert.ok(checked);
});
console.log(`${passed} refactor regression groups passed; ${failed} failed.`);
if (failed) process.exitCode = 1;
