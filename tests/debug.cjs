'use strict';

const fs = require('fs'),
  vm = require('vm'),
  assert = require('node:assert/strict');
let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('PASS ' + name);
}
const core = fs.readFileSync('dist/core.js', 'utf8');
function engine() {
  const env = {};
  vm.createContext(env);
  vm.runInContext(core, env);
  return env.VoidArena;
}
function fresh() {
  const C = engine();
  const g = new C.Arena(() => .5);
  g.newRun();
  return {
    g,
    C
  };
}
const {
  harness
} = require('./harness.cjs');
test('debug navigation resets all combat state, preserves items and starts each requested wave or Boss', () => {
  const {
    g,
    C
  } = fresh();
  g.items = ['clone', 'bounce'];
  for (let chapter = 1; chapter <= 3; chapter++) for (const bossFight of [false, true]) {
    g.room.mobs.push({
      hp: 1
    });
    g.room.bullets.push({
      life: 9
    });
    g.room.hazards.push({
      t: 9
    });
    g.room.fields.push({
      life: 9
    });
    g.room.clones.push({
      life: 9
    });
    g.room.melee.push({
      elapsed: 0
    });
    g.player.hp = 1;
    g.player.jump = .3;
    g.player.jumpCd = 1;
    g.player.attackCd = .3;
    g.mode = 'dead';
    g.offer = [{
      id: 'settle'
    }];
    assert.equal(g.debugJump(chapter, bossFight), true);
    assert.equal(g.chapter, chapter);
    assert.equal(g.mode, 'play');
    assert.equal(g.player.hp, g.player.maxhp);
    assert.equal(g.player.jump, 0);
    assert.equal(g.player.jumpCd, 0);
    assert.equal(g.player.tariffCd, undefined);
    assert.equal(g.player.attackCd, 0);
    assert.deepEqual(Array.from(g.items), ['clone', 'bounce']);
    assert.equal(g.offer.length, 0);
    for (const key of ['mobs', 'bullets', 'hazards', 'fields', 'clones', 'melee', 'shots', 'puddles']) assert.equal(g.room[key].length, 0, key);
    assert.equal(!!g.boss, bossFight);
    assert.equal(g.spawned, bossFight ? C.WAVES[chapter - 1].count : 0);
    if (bossFight) assert.equal(g.boss.hp, C.THEMES[chapter - 1].hp);else assert.equal(g.spawnTimer, 1);
  }
});
test('invalid debug destinations cannot change the current game', () => {
  const {
    g
  } = fresh();
  for (const chapter of [0, 4, 1.5, NaN, Infinity, '2']) {
    const room = g.room;
    assert.equal(g.debugJump(chapter, true), false);
    assert.equal(g.chapter, 1);
    assert.equal(g.room, room);
  }
});
test('infinite hearts blocks contact, bullets and blasts; disabling and Restart restore normal damage', () => {
  const {
    g
  } = fresh();
  g.spawnTimer = 999;
  g.player.inv = 0;
  g.setDebugInvincible(true);
  g.hurt();
  g.bullet(g.player, 0, 0);
  g.updateProjectiles(.01);
  g.hazard(g.player.x, g.player.y, 70, .01);
  g.updateHazards(.02);
  assert.equal(g.player.hp, 6);
  g.debugJump(3, true);
  assert.equal(g.debugInvincible, true);
  g.setDebugInvincible(false);
  g.player.inv = 0;
  g.hurt();
  assert.equal(g.player.hp, 5);
  g.setDebugInvincible(true);
  g.newRun();
  assert.equal(g.debugInvincible, false);
});
test('complete item collection after repeated debug jumps never creates a progression dead end', () => {
  const {
    g,
    C
  } = fresh();
  g.items = C.ITEMS.map(x => x.id);
  g.debugJump(1, true);
  g.boss.grace = 0;
  g.damage(g.boss, 999);
  g.finishIfClear();
  assert.equal(g.mode, 'reward');
  Object.assign(g.player, {
    x: g.room.pickup.x,
    y: g.room.pickup.y
  });
  g.step(.01);
  assert.equal(g.mode, 'upgrade');
  assert.equal(g.offer.length, 0);
  assert.equal(g.takeOffer(0), true);
  assert.equal(g.chapter, 2);
  assert.equal(g.items.length, 6);
  assert.equal(g.mode, 'play');
});
test('modal freezes full combat and resumes its exact prior mode without stuck input', () => {
  const h = harness();
  h.click('start');
  h.click('skip');
  h.run("game.player.inv=0;game.items=['settle'];game.land();game.jump();keys.w=true;pointer.down=true");
  h.click('debug-open');
  const snapshot = h.run('JSON.stringify({time:game.time,player:game.player,fields:game.room.fields,spawn:game.spawnTimer})');
  h.frame(1000);
  h.frame(2000);
  assert.equal(h.run('game.mode'), 'debug');
  assert.equal(h.run('JSON.stringify({time:game.time,player:game.player,fields:game.room.fields,spawn:game.spawnTimer})'), snapshot);
  assert.equal(h.run('keys.w'), false);
  assert.equal(h.run('pointer.down'), false);
  h.click('debug-close');
  assert.equal(h.run('game.mode'), 'play');
  assert.equal(h.el('debug-window').open, false);
  h.click('pause');
  h.click('debug-open');
  h.click('debug-close');
  assert.equal(h.run('game.mode'), 'paused');
});
test('password rejects mistakes, does not trigger gameplay hotkeys, stays unlocked until reload', () => {
  const h = harness();
  h.click('debug-open');
  assert.ok(h.el('debug-body').innerHTML.includes('debug-unlock-form'));
  h.listeners.keydown({
    key: 'e',
    code: 'KeyE',
    preventDefault() {}
  });
  assert.equal(h.run('keys.e'), undefined);
  h.unlock('wrong');
  assert.equal(h.el('debug-error').textContent, 'Incorrect password. Try again.');
  assert.ok(!h.el('debug-body').innerHTML.includes('debug-boss-0'));
  h.unlock('voiddebug');
  assert.ok(h.el('debug-body').innerHTML.includes('debug-boss-0'));
  h.click('debug-close');
  h.click('debug-open');
  assert.ok(!h.el('debug-body').innerHTML.includes('debug-unlock-form'));
  const reload = harness();
  reload.click('debug-open');
  assert.ok(reload.el('debug-body').innerHTML.includes('debug-unlock-form'));
});
test('UI can start every wave and Boss, retain loadout and toggle the visible invincibility marker', () => {
  const h = harness();
  h.click('debug-open');
  h.unlock('voiddebug');
  for (const removed of ['Ignore damage.', 'Open arena.', 'Conveyors push', 'Missile warnings', 'CHAPTER', ' chapters</span>']) assert.ok(!h.el('debug-body').innerHTML.includes(removed), removed);
  assert.ok(h.el('debug-body').innerHTML.includes('LEVEL 01'));
  assert.match(h.el('debug-body').innerHTML, /id="debug-infinite"[^>]*>OFF<\/button>/);
  h.click('debug-infinite');
  assert.match(h.el('debug-body').innerHTML, /id="debug-infinite"[^>]*>ON<\/button>/);
  assert.equal(h.run('game.debugInvincible'), true);
  assert.equal(h.el('health').textContent, '∞ HEARTS');
  assert.equal(h.el('debug-status').hidden, false);
  for (let i = 0; i < 3; i++) for (const target of ['wave', 'boss']) {
    if (!h.run('debugPanel.isOpen()')) h.click('debug-open');
    h.run("game.items=['clone'];game.player.hp=1;");
    h.click('debug-' + target + '-' + i);
    assert.equal(h.run('game.chapter'), i + 1);
    assert.equal(h.run('!!game.boss'), target === 'boss');
    assert.equal(h.run('game.mode'), 'play');
    assert.equal(h.run('game.player.hp'), 6);
    assert.equal(h.run('game.items[0]'), 'clone');
    assert.equal(h.run('game.debugInvincible'), true);
    assert.equal(h.el('debug-window').open, false);
  }
  h.click('debug-open');
  h.click('debug-infinite');
  assert.equal(h.el('debug-status').hidden, true);
  h.click('debug-close');
});
test('guide shows all enemies, live stats, all six items, every supported synergy and all Boss portraits', () => {
  const h = harness();
  h.click('debug-open');
  h.unlock('voiddebug');
  const initial = h.run('JSON.stringify({time:game.time,player:game.player,chapter:game.chapter,room:game.room,score:game.score,items:game.items,mode:game.mode})');
  for (const tab of ['debug', 'player', 'enemies', 'items', 'bosses']) {
    h.click('debug-tab-' + tab);
    const page = h.el('debug-body').innerHTML;
    assert.ok(!page.includes('codex-intro'), tab);
    assert.ok(!page.includes('codex-note'), tab);
    if (tab === 'enemies' || tab === 'bosses') {
      assert.ok(!page.includes('<b>COUNTER</b>'), tab);
      assert.ok(!page.includes('codex-counter'), tab);
    }
  }
  h.run("for(const entry of [...Object.values(VoidGuide.enemies),...VoidGuide.bosses]) assert.equal(entry.counter,undefined)");
  h.art.length = 0;
  h.click('debug-tab-enemies');
  assert.equal(h.art.length, 7);
  assert.ok(h.el('debug-body').innerHTML.includes('Split Offspring'));
  assert.ok(h.el('debug-body').innerHTML.includes('Follows you continuously and deals contact damage.'));
  h.run("for(const id of Object.keys(VoidArena.TYPES))assert.ok(VoidGuide.enemies[id]);");
  h.click('debug-tab-items');
  const html = h.el('debug-body').innerHTML;
  for (const name of ['Seizure Order', 'Final Settlement', 'Bouncing Checks', 'Crossfire', 'Landing Clause', 'Default Cascade']) assert.ok(html.includes(name));
  assert.ok(html.includes('SUPPORTED SYNERGIES'));
  h.click('debug-tab-bosses');
  assert.equal(h.art.length, 10);
  h.run("for(let chapter=1;chapter<=3;chapter++){const stats=VoidGuide.bossStats(chapter);assert.equal(stats.hp,VoidArena.THEMES[chapter-1].hp);assert.equal(stats.normal.shots,[6,15,10][chapter-1]);assert.equal(stats.enraged.shots,[6,15,14][chapter-1]);}");
  assert.equal(h.run('JSON.stringify({time:game.time,player:game.player,chapter:game.chapter,room:game.room,score:game.score,items:game.items,mode:game.mode})'), initial);
  for (const entry of h.art) assert.ok(entry.calls.some(x => x[0] === 'fill'), 'thumbnail has no drawn shapes');
});
test('Escape and native cancel close the modal; tutorial timing and death screens are preserved', () => {
  const h = harness();
  h.click('start');
  assert.equal(h.run('game.mode'), 'tutorialIntro');
  h.click('debug-open');
  h.listeners.keydown({
    key: 'Escape',
    preventDefault() {}
  });
  assert.equal(h.run('game.mode'), 'tutorialIntro');
  h.click('practice');
  h.click('debug-open');
  h.el('debug-window').listeners.cancel({
    preventDefault() {}
  });
  assert.equal(h.run('game.mode'), 'tutorial');
  h.run("game.mode='dead'");
  h.click('debug-open');
  h.click('debug-close');
  assert.equal(h.run('game.mode'), 'dead');
  h.run("game.debugJump(1,true);game.boss.grace=0;game.damage(game.boss,999);game.finishIfClear()");
  assert.equal(h.run('game.mode'), 'reward');
  h.run("draw();hud();assert.ok(game.prompt().includes('Walk into'))");
  h.click('debug-open');
  h.click('debug-close');
  assert.equal(h.run('game.mode'), 'reward');
});
test('Player tab shows the character, base abilities and live read-only status without mutating play', () => {
  const h = harness();
  h.click('start');
  h.click('skip');
  h.run("game.chapter=2;game.setupChapter();game.player.hp=3;game.player.jumpCd=.75;game.player.inv=.22;");
  const snapshot = h.run('JSON.stringify({time:game.time,chapter:game.chapter,player:game.player,room:game.room,items:game.items})');
  h.click('debug-open');
  h.unlock('voiddebug');
  h.click('debug-tab-player');
  const html = h.el('debug-body').innerHTML;
  for (const removed of ['Airborne immunity is separate', 'Hold left click to swing toward', 'WASD or touch-drag to move.', 'Jump over contact damage', 'Land close to enemies', 'Bosses can only be staggered']) assert.ok(!html.includes(removed), removed);
  for (const value of ['Donald Trump', 'Dollar Stack', 'CURRENT STATUS', '3 / 6', '220 px/s', '94 px', '120°', '0.42s', '0.2s', '0.58s', '1.5s', '65 px', '0.3s', '0.45s', '0.75s', 'No items equipped']) assert.ok(html.includes(value), 'Player info missing ' + value);
  assert.ok(!/<input|<select/.test(html));
  assert.equal(h.art.length, 1);
  assert.equal(h.art[0].canvas.dataset.guideKind, 'player');
  assert.ok(h.art[0].calls.some(x => x[0] === 'fill'));
  h.frame(1000);
  h.frame(2000);
  assert.equal(h.run('JSON.stringify({time:game.time,chapter:game.chapter,player:game.player,room:game.room,items:game.items})'), snapshot);
  h.click('debug-close');
  assert.equal(h.run('game.mode'), 'play');
});
test('Player current build, synergies and debug status refresh on reopen while base health stays separate', () => {
  const h = harness();
  h.click('debug-open');
  h.unlock('voiddebug');
  h.run("game.items=['pull','settle'];game.player.hp=2;game.setDebugInvincible(true)");
  h.click('debug-tab-player');
  let html = h.el('debug-body').innerHTML;
  for (const value of ['Equipped items · 2', 'Seizure Order + Final Settlement', '2 / 6', 'ON']) assert.ok(html.includes(value));
  h.click('debug-close');
  h.run("game.player.hp=5;game.player.jumpCd=0;game.items=[];game.setDebugInvincible(false)");
  h.click('debug-open');
  html = h.el('debug-body').innerHTML;
  assert.ok(html.includes('5 / 6'));
  assert.ok(html.includes('No items equipped'));
  assert.ok(html.includes('<dd>OFF</dd>'));
  assert.ok(!html.includes('Seizure Order + Final Settlement'));
});
test('shared ability changes feed both Player Codex and combat rather than a second stat copy', () => {
  const changed = core.replace(/speed:\s*220\b/, 'speed:280').replace(/damage:\s*4\b/, 'damage:9').replace(/stun:\s*1\.5\b/, 'stun:2.5');
  assert.notEqual(changed, core);
  const h = harness(changed);
  h.run("game.newRun();assert.equal(game.player.speed,280);game.player.x=480;game.player.y=360;const target=game.spawnMob('turret',game.room,{x:550,y:360});target.hp=30;game.attack(game.player,target);assert.equal(target.hp,21);const guard=game.spawnMob('shield',game.room,{x:525,y:360});game.land();assert.equal(guard.stun,2.5);");
  h.click('debug-open');
  h.unlock('voiddebug');
  h.click('debug-tab-player');
  const html = h.el('debug-body').innerHTML;
  for (const value of ['<dd>9</dd>', '<dd>280 px/s</dd>', '<dd>2.5s</dd>']) assert.ok(html.includes(value), 'shared value absent ' + value);
});
test('guide and shipped UI stay English and new script assets are present', () => {
  for (const file of ['dist/index.html', 'dist/core.js', 'dist/game.js', 'dist/debug.js', 'dist/render.js', 'dist/ui.js', 'dist/input.js', 'dist/state.js', 'dist/timing.js']) assert.ok(!/[\u3400-\u9fff]/.test(fs.readFileSync(file, 'utf8')), file);
  const html = fs.readFileSync('dist/index.html', 'utf8');
  assert.ok(html.includes('aria-labelledby="debug-title"'));
  assert.ok(!html.includes('id="interact"'));
  assert.ok(!/E: SUPPLY|<kbd>E<|E to interact/.test(html));
  assert.ok(html.includes('debug.js?v=34'));
  assert.ok(html.indexOf('debug.js?v=34') < html.indexOf('game.js?v=34'));
});
test('in-arena HUD, cooldown ring and touch readiness agree; pause holds details and Q does nothing', () => {
  const h = harness();
  h.click('start');
  h.click('skip');
  h.run("game.items=['pull','chain'];game.spawnTimer=999;game.player.inv=0;game.player.jumpCd=.75;hud();draw();");
  assert.ok(h.el('health').textContent.includes('♥'));
  assert.equal(h.el('equipped').textContent, '◎  ✴');
  assert.equal(h.el('jump').textContent, 'JUMP');
  assert.ok(h.el('jump')['aria-label'].includes('0.8'));
  assert.equal(h.el('jump-caption'), null);
  const before = h.run('JSON.stringify(game.room.fields)');
  h.listeners.keydown({
    key: 'q',
    code: 'KeyQ',
    preventDefault() {}
  });
  assert.equal(h.run('JSON.stringify(game.room.fields)'), before);
  assert.equal(h.run('typeof game.tariff'), 'undefined');
  h.click('pause');
  const paused = h.el('overlay').innerHTML;
  for (const text of ['Score', 'YOUR BUILD', 'Seizure Order', 'Default Cascade', 'sound', 'restart']) assert.ok(paused.includes(text), text);
  h.click('sound');
  h.click('resume');
  assert.equal(h.run('game.mode'), 'play');
  h.frame(0);
  h.run('game.player.jumpCd=.01;lastJumpCd=.01');
  h.frame(16);
  h.frame(32);
  assert.equal(h.el('jump').textContent, 'JUMP');
  assert.ok(h.run('jumpFlash>0'));
  h.run('jumpFlash=0');
  h.drawCalls.length = 0;
  h.run('drawJumpCharge()');
  assert.equal(h.drawCalls.length, 0);
  h.run('game.player.hp=2');
  h.frame(48);
  assert.ok(h.run('heartFlash>0'));
  h.click('pause');
  h.click('restart');
  assert.equal(h.run('game.items.length'), 0);
  assert.equal(h.run('game.player.hp'), 6);
});
test('HTML contains in-stage vitals and menus with no external combat sidebar or Q; guides match landing items', () => {
  const html = fs.readFileSync('dist/index.html', 'utf8'),
    start = html.indexOf('<section id="game-stage"'),
    end = html.indexOf('</section>', start);
  for (const id of ['health', 'jump', 'pause', 'debug-open', 'equipped']) assert.ok(html.slice(start, end).includes('id="' + id + '"'), id);
  assert.ok(!html.includes('<aside'));
  assert.ok(!html.includes('id="tariff"'));
  assert.match(fs.readFileSync('dist/styles.css', 'utf8'), /aspect-ratio:\s*20\s*\/\s*11/);
  for (const file of ['dist/game.js', 'dist/debug.js', 'dist/core.js', 'dist/render.js', 'dist/ui.js', 'dist/input.js', 'dist/state.js', 'dist/timing.js']) assert.ok(!/tariff|TARIFF/.test(fs.readFileSync(file, 'utf8')), file);
  const h = harness();
  h.click('debug-open');
  h.unlock('voiddebug');
  h.click('debug-tab-player');
  assert.ok(!h.el('debug-body').innerHTML.includes('Tariff'));
  h.click('debug-tab-items');
  const guide = h.el('debug-body').innerHTML;
  for (const value of ['Each item works alone', '0.6s', '2 to 10 damage', '40%', '30%', '20%']) assert.ok(guide.includes(value), value);
});
test('Updates shows the loaded release and ordered rollback milestones without changing the run', () => {
  const h = harness();
  h.click('start');
  h.click('skip');
  h.click('debug-open');
  assert.equal(h.el('debug-tab-updates'), null, 'history stays behind the existing lock');
  h.unlock('voiddebug');
  const snapshot = h.run('JSON.stringify({mode:game.mode,time:game.time,player:game.player,room:game.room,items:game.items})');
  h.click('debug-tab-updates');
  const html = h.el('debug-body').innerHTML;
  for (const value of ['LOADED VERSION', '<h3>0.1.2</h3>', 'Build 34', 'CURRENT', 'Player stays visible after boss defeat', 'Landing-driven item builds', 'device playtest pending']) assert.ok(html.includes(value), value);
  assert.ok(html.indexOf('v31 ·') < html.indexOf('v30 ·'));
  assert.ok(!html.includes('appgver_'));
  assert.ok(!html.includes('debug-wave-'));
  assert.equal(h.el('debug-tab-updates').getAttribute('aria-pressed'), 'true');
  h.run("assert.equal(VoidReleases.entries[0].version,VoidReleases.currentVersion);for(let i=1;i<VoidReleases.entries.length;i++){const entry=VoidReleases.entries[i];assert.ok(entry.version<VoidReleases.entries[i-1].version);assert.match(entry.commitSha,/^[a-f0-9]{40}$/);assert.ok(entry.savedVersionId.startsWith(VoidReleases.projectId+'~appgver_'));}");
  assert.equal(h.run('JSON.stringify({mode:game.mode,time:game.time,player:game.player,room:game.room,items:game.items})'), snapshot);
  h.click('debug-tab-debug');
  assert.ok(h.el('debug-wave-0'));
  h.click('debug-close');
  assert.equal(h.run('game.mode'), 'play');
  const changed = fs.readFileSync('dist/releases.js', 'utf8').replace('"currentVersion": 34', '"currentVersion": 99');
  const oldTab = harness(undefined, {sources: {'releases.js': changed}});
  oldTab.click('debug-open');
  oldTab.unlock('voiddebug');
  oldTab.click('debug-tab-updates');
  assert.ok(oldTab.el('debug-body').innerHTML.includes('Build 99</span>'), 'badge reads bundled release data');
});
console.log(`${passed} debug/codex scenario groups passed. DOM and canvas tests use mocks; browser/device QA remains unverified.`);
