'use strict';

// Historical Git source is the rollback reference; no network or duplicate source fixture.
const fs = require('fs'),
  vm = require('vm'),
  cp = require('node:child_process'),
  assert = require('node:assert/strict'),
  crypto = require('node:crypto');
const {
  harness
} = require('./harness.cjs');
const baseline = 'a27a9bf599f4b9401eeb0e5b0467a135e8d2258b';
const prior = file => cp.execFileSync('git', ['show', baseline + ':dist/' + file], {
  encoding: 'utf8',
  maxBuffer: 2 ** 20
});
const old = prior('core.js'),
  current = fs.readFileSync('dist/core.js', 'utf8');
function make(source, chapter, boss, items) {
  const env = {};
  vm.createContext(env);
  vm.runInContext(source, env);
  let seed = 811;
  const g = new env.VoidArena.Arena(() => {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    return seed / 4294967296;
  });
  g.newRun();
  g.chapter = chapter;
  g.setupChapter();
  g.items = items;
  g.player.inv = 999;
  if (boss) g.createBoss();
  return g;
}
const removed = new Set(['walls', 'props', 'rev', 'nav', 'cast', 'dash', 'attackId', 'lessonAttack']);
function normalize(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(normalize);
  const entries = Object.entries(value).filter(([key]) => !removed.has(key)).map(([key, value]) => [key === 'slow' ? 'tax' : key, normalize(value)]).sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}
const snapshot = g => JSON.stringify(normalize({
  mode: g.mode,
  chapter: g.chapter,
  time: g.time,
  score: g.score,
  uid: g.uid,
  player: g.player,
  room: g.room,
  boss: g.boss,
  spawned: g.spawned,
  spawnTimer: g.spawnTimer,
  events: g.events,
  message: g.message,
  messageTime: g.messageTime
}));
const builds = [[], ['pull'], ['settle'], ['bounce'], ['clone'], ['landing'], ['chain'], ['pull', 'settle', 'bounce', 'clone', 'landing', 'chain']];
let count = 0;
for (let chapter = 1; chapter <= 3; chapter++) for (const boss of [false, true]) for (const items of builds) {
  const a = make(old, chapter, boss, items),
    b = make(current, chapter, boss, items);
  for (let frame = 0; frame < 900; frame++) {
    if (frame % 95 === 0) {
      a.jump();
      b.jump();
    }
    const input = {
      mx: Math.sin(frame / 70) * .45,
      my: Math.cos(frame / 70) * .45,
      attack: true,
      autoAim: true
    };
    a.step(1 / 60, input);
    b.step(1 / 60, input);
    assert.ok(snapshot(a) === snapshot(b), `core parity: chapter${chapter} boss${boss} items${items} frame${frame}`);
  }
  count++;
}
console.log(`PASS ${count} seeded 900-step simulations preserve v22 active behavior`);
const html = prior('index.html'),
  sources = Object.fromEntries(['core.js', 'debug.js', 'game.js'].map(file => [file, prior(file)]));
// Only exclude explicit v24 HUD relocations. All world/art/effect/threat commands remain compared.
let priorBrowser = sources['game.js'];
const bossStart = priorBrowser.indexOf('drawCombatHud();'),
  bossEnd = priorBrowser.indexOf('if(g.messageTime', bossStart);
assert.ok(bossStart >= 0 && bossEnd > bossStart);
priorBrowser = priorBrowser.slice(0, bossStart) + priorBrowser.slice(bossEnd);
const captionStart = priorBrowser.indexOf('if(p.jumpCd>0){', priorBrowser.indexOf('function drawJumpCharge'));
const captionEnd = priorBrowser.indexOf('ctx.restore();', captionStart);
assert.ok(captionStart >= 0 && captionEnd > captionStart);
priorBrowser = priorBrowser.slice(0, captionStart) + priorBrowser.slice(captionEnd);
sources['game.js'] = priorBrowser;
function scene(h, chapter) {
  h.run(`game.newRun();game.chapter=${chapter};game.setupChapter();game.items=VoidArena.ITEMS.map(x=>x.id);game.createBoss();game.boss.mark=1;game.boss.tax=1;game.boss.slow=1;game.boss.grace=0;game.player.inv=0;game.player.jumpCd=.75;for(const [i,type] of Object.keys(VoidArena.TYPES).entries()){const e=game.spawnMob(type,game.room,{x:120+i*90,y:300});e.age=.4;e.face=.5;e.tax=e.slow=1;e.mark=1;}game.room.fields=[{kind:'pull',x:200,y:300,r:90,life:.4,max:.6},{kind:'settle',x:400,y:300,r:90,life:1,max:2},{kind:'slow',x:600,y:300,r:90,life:1,max:2}];game.room.bullets=[{x:480,y:180,r:8,kind:'urine',vx:100,vy:20},{x:500,y:180,r:11,kind:'homingPoop',vx:100,vy:20},{x:520,y:180,r:6,kind:'bullet',vx:100,vy:20}];game.room.effects=[{x:300,y:300,r:65,life:.2,max:.5,color:'#d9fb76'}];syncOverlay();`);
  h.drawCalls.length = 0;
  h.run('draw();hud()');
  return crypto.createHash('sha256').update(JSON.stringify(h.drawCalls)).digest('hex');
}
for (let chapter = 1; chapter <= 3; chapter++) {
  const a = harness(undefined, {
      html,
      sources
    }),
    b = harness();
  assert.equal(scene(a, chapter), scene(b, chapter), 'canvas draw/style commands changed in chapter ' + chapter);
}
console.log('PASS all three Boss scenes preserve v22 world/art/effect/projectile commands and styles (relocated HUD excluded)');
