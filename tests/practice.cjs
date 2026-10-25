'use strict';

const fs = require('fs'),
  vm = require('vm'),
  assert = require('node:assert/strict');
const env = {};
vm.createContext(env);
for (const file of ['weapon.js', 'pickup.js', 'actor-state.js', 'projectile.js', 'effects.js', 'boss-skills.js', 'core.js']) {
  vm.runInContext(fs.readFileSync('dist/' + file, 'utf8'), env, { filename: file });
}
const { Arena } = env.VoidArena;
function fresh() {
  const game = new Arena(() => .5);
  game.newRun();
  game.startBossPractice();
  return game;
}
function ticks(game, count, input = {}) {
  for (let i = 0; i < count; i++) game.step(1 / 60, input);
}

{
  const game = fresh();
  assert.equal(game.mode, 'bossPractice');
  assert.equal(game.chapter, 3);
  assert.equal(game.boss.name, 'MOJTABA KHAMENEI');
  assert.equal(game.room.mobs.length, 0);
  assert.equal(game.practiceBossVolley(), true);
  assert.equal(game.room.bullets.length, 10);
  assert.equal(game.room.hazards.length, 0);
  assert.equal(game.practiceBossVolley(), false, 'volley cooldown blocks repeat activation');
  assert.equal(game.applyInputActions({ jumpPressed: true }), true);
  assert.equal(game.room.hazards.length, 1);
  assert.equal(game.room.hazards[0].t, 1.45);
  assert.equal(game.applyInputActions({ jumpPressed: true }), false, 'strike cooldown blocks repeat activation');
  console.log('PASS Debug practice starts the selected Boss and exposes two independently cooling-down attacks');
}

{
  const game = fresh(),
    warning = { x: game.player.x, y: game.player.y, r: 60, t: .9, max: .9, kind: 'missile', ownerId: game.boss.id, done: false, life: .4 };
  game.room.hazards.push(warning);
  const start = Math.hypot(game.player.x - warning.x, game.player.y - warning.y);
  ticks(game, 20);
  assert.ok(Math.hypot(game.player.x - warning.x, game.player.y - warning.y) > start + 20, 'training Hunter moves away from a live warning');
  ticks(game, 100);
  assert.equal(game.player.hp, game.player.maxhp, 'Hunter clears the delayed blast instead of standing in its telegraph');
  console.log('PASS training Hunter dodges the existing missile warning before it resolves');
}

{
  const game = fresh();
  game.boss.x = game.player.x + 80;
  game.boss.y = game.player.y;
  game.player.attackCd = 0;
  const before = game.boss.hp;
  ticks(game, 180);
  assert.ok(game.boss.hp < before, 'training Hunter swings at the controlled Boss');
  game.boss.hp = 2;
  game.boss.grace = 0;
  game.damage(game.boss, 9);
  assert.equal(game.boss.dead, true);
  ticks(game, 70);
  assert.equal(game.mode, 'bossPractice');
  assert.equal(game.boss.dead, false, 'defeated practice Boss resets without ending the mode');
  assert.equal(game.boss.hp, game.boss.maxhp);
  game.player.hp = 1;
  game.player.inv = 0;
  game.hurt();
  assert.equal(game.mode, 'bossPractice', 'Hunter defeat does not end the training session');
  ticks(game, 70);
  assert.equal(game.player.hp, game.player.maxhp, 'defeated Hunter respawns');
  console.log('PASS training Hunter attacks and both combatants can continue after a reset');
}

{
  const game = fresh();
  game.pause();
  assert.equal(game.mode, 'paused');
  game.pause();
  assert.equal(game.mode, 'bossPractice', 'resume returns to the exact Practice mode');
  game.newRun();
  assert.equal(game.mode, 'play');
  assert.equal(game.practiceCooldowns, null, 'practice state does not leak into a normal run');
  console.log('PASS Practice pause/resume and normal-run reset are isolated');
}
