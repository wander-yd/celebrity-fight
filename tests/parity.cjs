'use strict';

// Geometry intentionally changed in Build36. Compare protected config and controlled
// interior encounters; full-arena trajectories and camera draw commands cannot match.
const fs = require('node:fs'),
  vm = require('node:vm'),
  cp = require('node:child_process'),
  assert = require('node:assert/strict');
const {
  harness
} = require('./harness.cjs');
const baseline = '03345c66fd408a426f715f2216c6b58c3ad21016';
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
  g.player.x = 480;
  g.player.y = 360;
  g.player.inv = 999;
  g.spawnTimer = 999;
  g.applyConveyor = () => {};
  for (const [i, type] of ['shield', 'turret', 'charger', 'shooter'].entries()) {
    const e = g.spawnMob(type, g.room, {
      x: 400 + i * 40,
      y: 340
    });
    e.hp = e.maxhp = 9999;
  }
  if (boss) {
    g.createBoss();
    g.boss.x = 550;
    g.boss.y = 360;
    g.boss.hp = g.boss.maxhp = 9999;
  }
  return {
    g,
    api: env.VoidArena
  };
}
const builds = [[], ['pull'], ['settle'], ['bounce'], ['clone'], ['landing'], ['chain'], ['pull', 'settle', 'bounce', 'clone', 'landing', 'chain']];
const serialize = g => JSON.stringify({
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
});
const a0 = make(old, 1, false, []),
  b0 = make(current, 1, false, []);
for (const key of ['PLAYER_ABILITIES', 'TYPES', 'THEMES', 'WAVES', 'ITEMS']) assert.equal(JSON.stringify(a0.api[key]), JSON.stringify(b0.api[key]), key + ' config changed');
let count = 0;
for (const chapter of [1, 2, 3]) for (const boss of [false, true]) for (const items of builds) {
  const a = make(old, chapter, boss, items).g,
    b = make(current, chapter, boss, items).g;
  for (let frame = 0; frame < 900; frame++) {
    if (frame % 95 === 0) {
      for (const g of [a, b]) {
        g.player.x = 480;
        g.player.y = 360;
        for (const [i, e] of g.room.mobs.entries()) {
          e.x = 400 + i * 40;
          e.y = 340;
        }
        if (g.boss) {
          g.boss.x = 550;
          g.boss.y = 360;
        }
        g.jump();
      }
    }
    // Isolate interior combat from intentionally different boundary lifetimes/spawns.
    for (const g of [a, b]) {
      g.room.bullets = [];
      g.room.shots = [];
    }
    const input = {
      mx: 0,
      my: 0,
      attack: true,
      autoAim: true
    };
    a.step(1 / 60, input);
    b.step(1 / 60, input);
    assert.equal(serialize(a), serialize(b), `interior parity chapter${chapter} boss${boss} items${items} frame${frame}`);
  }
  count++;
}
console.log(`PASS unchanged combat config and ${count} seeded 900-step interior encounters vs Build35 (boundaries/conveyors/long projectile travel excluded)`);
function art(h) {
  h.drawCalls.length = 0;
  h.run(`for(const kind of ['trump','biden','pooh','mojtaba'])person(200,200,kind,1.3);for(const type of Object.keys(VoidArena.TYPES)){const e={...VoidArena.TYPES[type],type,x:300,y:300,hp:2,maxhp:7,face:.3,age:.5,broken:1,stun:1,slow:1,mark:1,flash:0};drawMob(e,ctx,3);}for(const face of [0,1,2,3]){game.player.face=face;downwardCash(game.player,0);}`);
  return JSON.stringify(h.drawCalls);
}
assert.equal(art(harness(undefined, {
  sources: {
    'render.js': prior('render.js')
  }
})), art(harness()));
console.log('PASS existing character/enemy/weapon art commands remain unchanged; world/HUD projection intentionally differs');
