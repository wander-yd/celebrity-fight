'use strict';

const fs = require('fs'),
  assert = require('node:assert/strict'),
  cp = require('node:child_process');
const {
  harness
} = require('./harness.cjs');
let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('PASS ' + name);
}
function start(options) {
  const h = harness(undefined, options);
  h.click('start');
  h.click('skip');
  return h;
}
test('Arena fits width and height across phone portrait/landscape, tablet and laptop', () => {
  const h = harness();
  for (const [width, height, toolbar, footer] of [[390, 844, 82, 66], [844, 390, 76, 66], [768, 1024, 82, 66], [1366, 768, 82, 48], [320, 568, 82, 66]]) {
    const size = h.run(`arenaStageSize(${width},${height},${toolbar},${footer})`);
    assert.ok(size.width <= width - 16 + 1e-8);
    assert.ok(size.height <= height - 16 + 1e-8);
    assert.ok(size.width > 250);
    assert.ok(Math.abs((size.width - 2) / (size.height - toolbar - footer - 2) - 960 / 528) < 1e-8);
  }
});
test('opening uses the fitted arena; resize and pause preserve the run without view switches', () => {
  const h = harness(undefined, {width:390,height:844,footerHeight:66});
  assert.ok(parseFloat(h.el('game-stage').style.width) <= 374);
  for (const id of ['play-mode', 'overlay-view']) assert.equal(h.el(id), null);
  assert.equal(h.run('typeof setPlayMode'), 'undefined');
  h.click('start');
  assert.equal(h.el('overlay-view'), null);
  h.click('skip');
  const snapshot = h.run('JSON.stringify({time:game.time,player:game.player,room:game.room})');
  h.env.window.innerWidth = 844;
  h.env.window.innerHeight = 390;
  h.listeners.resize();
  assert.ok(parseFloat(h.el('game-stage').style.width) < 844);
  assert.equal(h.run('JSON.stringify({time:game.time,player:game.player,room:game.room})'), snapshot);
  h.click('pause');
  assert.equal(h.el('overlay-view'), null);
  h.frame(0);
  h.frame(50000);
  assert.equal(h.run('game.time'), 0);
  h.click('resume');
  h.frame(60000);
  assert.equal(h.run('game.time'), 0);
});
test('Pause puts Resume before collapsed Controls and Build, with keyboard focus', () => {
  const h = start();
  h.run("game.items=VoidArena.ITEMS.map(x=>x.id)");
  h.click('pause');
  const html = h.el('overlay').innerHTML;
  assert.ok(html.indexOf('id="resume"') < html.indexOf('id="pause-controls"'));
  assert.ok(html.indexOf('id="resume"') < html.indexOf('id="pause-build"'));
  for (const id of ['pause-controls', 'pause-build']) {
    assert.equal(h.el(id).tagName, 'details');
    assert.equal(h.el(id).getAttribute('open'), null);
  }
  assert.equal(h.env.document.activeElement.id, 'resume');
  h.click('resume');
  assert.equal(h.run('game.mode'), 'play');
});
test('HUD keeps readable health and Boss health without a following jump caption', () => {
  const h = start();
  h.run('game.debugJump(2,true);game.boss.hp=77.5;game.player.hp=3;game.player.jumpCd=.75;hud()');
  assert.equal(h.el('chapter-label').textContent, '02 / xijinping');
  assert.equal(h.el('health').textContent, '♥ ♥ ♥ ♡ ♡ ♡ ');
  assert.equal(h.el('boss-meter').hidden, false);
  assert.equal(h.el('boss-meter').getAttribute('aria-valuenow'), '50');
  assert.equal(h.el('boss-fill').style.width, '50%');
  assert.equal(h.el('jump-caption'), null);
  h.run('game.player.jumpCd=0;hud()');
  assert.equal(h.el('jump-caption'), null);
});
test('bomb warnings animate without countdown numbers; jump ring and ready flash remain', () => {
  const h = start();
  h.run('game.room.hazards=[{x:321,y:234,r:80,t:1,max:2,done:false}]');
  for (const [time, radius] of [[1, 40], [.5, 60]]) {
    h.run(`game.room.hazards[0].t=${time}`);
    h.drawCalls.length = 0;
    h.run('draw()');
    assert.ok(h.drawCalls.some(c => c[0] === 'arc' && c[1] === 321 && c[2] === 234 && c[3] === radius));
    const labels = h.drawCalls.filter(c => c[0] === 'fillText' && c[2] === 321 && c[3] === 238);
    assert.deepEqual(labels.map(c => c[1]), ['!']);
  }
  for (const [cooldown, flash, color] of [[.75, 0, '#e9edc5'], [0, .2, '#d9fb76']]) {
    h.run(`game.player.jumpCd=${cooldown};jumpFlash=${flash}`);
    h.drawCalls.length = 0;
    h.run('drawJumpCharge()');
    assert.equal(h.drawCalls.filter(c => c[0] === 'arc').length, 2);
    assert.ok(h.drawCalls.some(c => c[0] === 'set' && c[1] === 'strokeStyle' && c[2] === color));
    assert.ok(!h.drawCalls.some(c => c[0] === 'fillText'));
  }
});
test('clipping the covered top margin preserves pointer-to-world mapping', () => {
  const h = start({
    rects: {
      game: {
        left: 20,
        top: 64,
        width: 480,
        height: 300
      },
      'arena-viewport': {
        left: 20,
        top: 100,
        width: 480,
        height: 264
      }
    }
  });
  h.canvasListeners.pointermove({
    pointerType: 'mouse',
    clientX: 260,
    clientY: 214
  });
  assert.equal(h.run('pointer.x'), 480);
  assert.equal(h.run('pointer.y'), 300);
});
test('tutorial instructions remain readable and the safe lesson still completes', () => {
  const h = harness();
  assert.equal(h.el('start').getAttribute('aria-label'), 'Start game');
  assert.ok(h.el('start').children.some(c => c.tagName === 'svg'));
  assert.ok(!h.el('overlay').innerHTML.includes('Biden →'));
  h.click('start');
  assert.ok(h.el('overlay').innerHTML.includes('Jump near the shield → land → swing.'));
  assert.ok(!h.el('overlay').innerHTML.includes('damage protection'));
  h.click('practice');
  assert.equal(h.el('arena-instruction').hidden, false);
  assert.ok(h.el('arena-instruction').textContent.includes('Press SPACE'));
  h.run('game.jump();for(let i=0;i<40;i++)game.step(1/60,{aim:{x:480,y:370}});hud()');
  assert.ok(h.el('arena-instruction').textContent.includes('Shield broken'));
  h.run('for(let i=0;i<20;i++)game.step(1/60,{attack:true,aim:{x:480,y:370}});hud()');
  assert.ok(h.el('arena-instruction').textContent.includes('HIT!'));
  h.run('for(let i=0;i<80;i++)game.step(1/60,{});syncOverlay();hud()');
  assert.ok(h.el('overlay').innerHTML.includes('Practice complete'));
  assert.equal(h.el('lessonDone').getAttribute('aria-label'), 'Play');
  h.click('lessonDone');
  assert.equal(h.run('game.mode'), 'play');
  assert.equal(h.el('arena-instruction').hidden, true);
});
test('upgrade cards lead with action summaries, choose once, and preserve health-kit progression', () => {
  const h = start();
  h.run('game.debugJump(1,true);game.boss.grace=0;game.damage(game.boss,999);game.finishIfClear();game.player.x=game.room.pickup.x;game.player.y=game.room.pickup.y;game.step(.01);syncOverlay();hud()');
  assert.equal(h.run('game.mode'), 'upgrade');
  const html = h.el('overlay').innerHTML;
  assert.ok(html.includes('choice-action'));
  assert.ok(html.indexOf('choice-action') < html.indexOf('choice-detail'));
  h.click('pick0');
  assert.equal(h.run('game.chapter'), 2);
  assert.equal(h.run('game.items.length'), 1);
  assert.equal(h.run('game.mode'), 'play');
  h.run("game.items=VoidArena.ITEMS.map(x=>x.id);game.debugJump(1,true);game.boss.grace=0;game.damage(game.boss,999);game.finishIfClear();game.player.x=game.room.pickup.x;game.player.y=game.room.pickup.y;game.step(.01);syncOverlay()");
  h.click('buildContinue');
  assert.equal(h.run('game.chapter'), 2);
});
test('Codex remains reachable and password locked from menus and paused Play mode', () => {
  const h = harness();
  h.click('menu-codex');
  assert.ok(h.el('debug-password'));
  h.unlock('voiddebug');
  h.click('debug-close');
  assert.equal(h.run('game.mode'), 'menu');
  h.click('start');
  h.click('skip');
  h.click('pause');
  h.click('menu-codex');
  h.click('debug-close');
  assert.equal(h.run('game.mode'), 'paused');
  assert.equal(h.el('play-mode'), null);
});
test('simulation and ability defaults match v23 apart from the Debug level label', () => {
  assert.equal(fs.readFileSync('dist/core.js', 'utf8').replace('DEBUG / LEVEL ${chapter}', 'DEBUG / CHAPTER ${chapter}'), cp.execFileSync('git', ['show', '3f1b5c37e77bd4b56fe2e28626db08a6e5027721:dist/core.js'], {
    encoding: 'utf8',
    maxBuffer: 2 ** 20
  }));
});
test('menu controls keep native Space/Enter activation while canvas Space still jumps', () => {
  const h = start();
  h.click('pause');
  let prevented = false;
  h.listeners.keydown({
    key: ' ',
    code: 'Space',
    target: h.el('resume'),
    preventDefault() {
      prevented = true;
    }
  });
  assert.equal(prevented, false);
  assert.equal(h.run('game.player.jump'), 0);
  h.listeners.keydown({
    key: 'Enter',
    code: 'Enter',
    target: h.el('pause-controls'),
    preventDefault() {
      prevented = true;
    }
  });
  assert.equal(prevented, false);
  h.click('resume');
  h.listeners.keydown({
    key: ' ',
    code: 'Space',
    target: h.el('game'),
    preventDefault() {
      prevented = true;
    }
  });
  assert.equal(prevented, true);
  assert.ok(h.run('game.player.jump') > 0);
});
test('touch Jump stays in the footer instead of covering the playfield', () => {
  const h = start();
  assert.equal(h.el('jump').parent.id, 'boss-panel');
  assert.equal(h.el('game').parent.id, 'arena-viewport');
  const hp = h.run('game.player.hp');
  h.el('jump').onpointerdown({
    preventDefault() {}
  });
  assert.ok(h.run('game.player.jump') > 0);
  assert.equal(h.run('game.player.hp'), hp);
});
test('reward phase always draws the player and full hearts can reach the kit and next level', () => {
  for (const level of [1, 2]) for (const protection of [.1, .22, .3]) {
    const h = start();
    h.run(`game.debugJump(${level},true);game.boss.grace=0;game.player.hp=game.player.maxhp;game.player.x=180;game.player.y=500;game.player.inv=${protection};
      var playerDraws=0;var originalPerson=person;person=function(...args){if(args[0]===game.player.x&&args[1]===game.player.y)playerDraws++;return originalPerson(...args)};`);
    h.run('draw()');
    assert.equal(h.run('playerDraws'), protection === .3 ? 1 : 0, 'combat flashing must stay unchanged');
    h.run('game.damage(game.boss,999);game.finishIfClear();syncOverlay();playerDraws=0;draw()');
    assert.equal(h.run('game.mode'), 'reward');
    assert.equal(h.run('playerDraws'), 1, 'player must be visible on entering reward');
    h.run('for(let i=0;i<120;i++)game.step(1/60,{});playerDraws=0;draw()');
    assert.equal(h.run('playerDraws'), 1, 'player must remain visible');
    assert.equal(h.run('game.player.inv'), protection, 'render fix must not change protection');
    h.run(`for(let i=0;i<600&&game.mode==='reward';i++){const kit=game.room.pickup;const dx=kit.x-game.player.x,dy=kit.y-game.player.y;const d=Math.max(1,Math.hypot(dx,dy));game.step(1/60,{mx:dx/d,my:dy/d});}syncOverlay()`);
    assert.equal(h.run('game.mode'), 'upgrade');
    assert.equal(h.run('game.player.hp'), 6);
    h.click('pick0');
    assert.equal(h.run('game.mode'), 'play');
    assert.equal(h.run('game.chapter'), level + 1);
  }
});
test('shield-break labels are absent in combat and tutorial; shield recovery and Jump feedback remain', () => {
  for (const tutorial of [false, true]) {
    const h = harness();
    h.click('start');
    h.click(tutorial ? 'practice' : 'skip');
    h.run(`var guard=${tutorial ? 'game.room.mobs[0]' : "game.spawnMob('shield',game.room,{x:300,y:300})"};guard.broken=2.3;guard.stun=1;`);
    h.drawCalls.length = 0;
    h.run('drawMob(guard)');
    assert.ok(!h.drawCalls.some(c => c[0] === 'fillText' && String(c[1]).includes('SHIELD BROKEN')));
    assert.ok(h.drawCalls.some(c => c[0] === 'fillText' && c[1] === '✧'));
    if (!tutorial) {
      h.run('guard.broken=.05;guard.stun=0;game.updateMobs(.05)');
      assert.equal(h.run('guard.broken'), 0);
      h.drawCalls.length = 0;
      h.run('drawMob(guard)');
      assert.ok(h.drawCalls.some(c => c[0] === 'set' && c[1] === 'lineWidth' && c[2] === 7), 'shield visual returns');
    }
    for (const cd of [.75, 0]) {
      h.run(`game.player.jumpCd=${cd};hud()`);
      assert.equal(h.el('jump').textContent, 'JUMP');
      assert.equal(h.el('jump').style.opacity, cd > 0 ? '.65' : '1');
    }
  }
});
test('icon controls retain accessible names, sound state and restart behavior without the death tip', () => {
  const h = start();
  for (const id of ['pause', 'debug-close']) {
    assert.ok(h.el(id).getAttribute('aria-label'));
    assert.ok(h.el(id).getAttribute('title'));
    assert.ok(h.el(id).children.some(c => c.tagName === 'svg'));
  }
  h.click('pause');
  assert.equal(h.el('resume').getAttribute('aria-label'), 'Resume');
  assert.ok(h.el('resume').children.some(c => c.tagName === 'svg'));
  assert.equal(h.el('sound').getAttribute('aria-pressed'), 'false');
  assert.equal(h.el('sound').getAttribute('aria-label'), 'Unmute sound');
  h.click('sound');
  const soundOn = h.el('sound').innerHTML;
  assert.equal(h.el('sound').getAttribute('aria-pressed'), 'true');
  h.click('sound');
  assert.equal(h.run('sound'), false);
  assert.equal(h.el('sound').getAttribute('aria-pressed'), 'false');
  assert.equal(h.el('sound').getAttribute('aria-label'), 'Unmute sound');
  assert.equal(h.el('sound').getAttribute('title'), 'Unmute sound');
  assert.notEqual(h.el('sound').innerHTML, soundOn);
  h.click('resume');
  h.click('pause');
  assert.equal(h.el('sound').getAttribute('aria-pressed'), 'false');
  h.click('sound');
  assert.equal(h.el('sound').innerHTML, soundOn);
  assert.equal(h.el('sound').getAttribute('aria-label'), 'Mute sound');
  h.click('resume');
  h.run("game.mode='dead';game.score=123;syncOverlay()");
  assert.ok(!h.el('overlay').innerHTML.includes('Keep moving. Mind your melee range.'));
  assert.ok(h.el('overlay').innerHTML.includes('Score 123'));
  assert.equal(h.el('again').getAttribute('aria-label'), 'Restart run');
  h.click('again');
  assert.equal(h.run('game.mode'), 'play');
  assert.equal(h.run('game.player.hp'), 6);
});
console.log(`${passed} UI/UX scenario groups passed. Geometry/DOM checks are fixtures, not browser layout/device verification.`);
