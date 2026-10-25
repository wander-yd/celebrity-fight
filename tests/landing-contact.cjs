'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const env = {};
vm.createContext(env);
vm.runInContext(fs.readFileSync('dist/core.js', 'utf8'), env);
const { Arena } = env.VoidArena;
let passed = 0;
function fresh(boss = false) {
  const g = new Arena(() => .5);
  g.newRun();
  g.spawnTimer = 999;
  g.player.x = g.player.y = 364;
  let e;
  if (boss) {
    g.createBoss();
    e = g.boss;
    Object.assign(e, { x: 364, y: 364, grace: 0, cd: 999 });
  } else e = g.spawnMob('shield', g.room, { x: 364, y: 364 });
  e.hp = e.maxhp = 100;
  e.speed = 0;
  e.t = 999;
  g.player.inv = 0;
  g.land();
  return { g, e };
}
const ticks = (g, n, input = {}) => { for (let i = 0; i < n; i++) g.step(1 / 60, input); };
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
test('Boss and mob wake-up grant a bounded contact-only exit window, then hurt idle players', () => {
  for (const boss of [false, true]) {
    const { g, e } = fresh(boss);
    ticks(g, Math.round(e.stun * 60) + 12);
    assert.equal(e.stun, 0);
    assert.equal(g.player.hp, 6);
    assert.ok(g.landingContacts.has(e.id));
    ticks(g, 8);
    assert.equal(g.player.hp, 5);
    assert.equal(g.landingContacts.size, 0);
    assert.equal(g.player.x, 364);
    assert.equal(g.player.y, 364);
  }
});
test('walking out clears protection immediately and returning is ordinary contact', () => {
  for (const boss of [false, true]) {
    const { g, e } = fresh(boss);
    ticks(g, 20, { mx: 1 });
    assert.equal(g.landingContacts.size, 0);
    Object.assign(g.player, { x: e.x, y: e.y, inv: 0 });
    e.stun = 0;
    g.hurtByContact(e);
    assert.equal(g.player.hp, 5);
  }
});
test('exit windows belong only to bodies overlapping the landing, independently', () => {
  const { g, e } = fresh();
  const other = g.spawnMob('shield', g.room, { x: 390, y: 364 });
  other.hp = 100;
  g.land();
  assert.equal(g.landingContacts.size, 2);
  other.x = 500;
  g.updateLandingContacts(0);
  assert.equal(g.landingContacts.size, 1);
  assert.ok(g.landingContacts.has(e.id));
  const newcomer = g.spawnMob('chaser', g.room, { x: 364, y: 364 });
  g.player.inv = 0;
  g.hurtByContact(newcomer);
  assert.equal(g.player.hp, 5);
});
test('a stagger-resistant Boss gets only the finite immediate exit window', () => {
  const { g, e } = fresh(true);
  e.stun = 0;
  e.staggerCd = 2;
  ticks(g, 12);
  assert.equal(g.player.hp, 6);
  const remaining = g.landingContacts.get(e.id).remaining;
  g.land();
  assert.equal(e.stun, 0);
  assert.equal(g.landingContacts.get(e.id).remaining, remaining);
  g.player.inv = 0;
  ticks(g, 8);
  assert.equal(g.player.hp, 5);
});
test('bullets and blasts still hurt during a recorded contact exit window', () => {
  for (const source of ['bullet', 'blast']) {
    const { g, e } = fresh(true);
    ticks(g, 30);
    assert.equal(g.player.inv, 0);
    assert.ok(g.landingContacts.has(e.id));
    if (source === 'bullet') {
      g.bullet(g.player, 0, 0, 6);
      g.updateProjectiles(.01);
    } else {
      g.hazard(g.player.x, g.player.y, 65, .001, 'missile', { ownerId: e.id });
      g.updateHazards(.01);
    }
    assert.equal(g.player.hp, 5, source);
  }
});
test('pause freezes contact timers and chapter, debug, practice, reward, death and restart clear them', () => {
  const { g, e } = fresh(true);
  ticks(g, 30);
  const remaining = g.landingContacts.get(e.id).remaining;
  g.pause(); ticks(g, 120);
  assert.equal(g.landingContacts.get(e.id).remaining, remaining);
  g.pause(); ticks(g, 17);
  assert.equal(g.player.hp, 5);
  for (const reset of [g => g.setupChapter(), g => g.debugJump(2, true), g => g.practice(), g => g.beginReward(), g => g.newRun(), g => { g.player.hp = 1; g.player.inv = 0; g.hurt(); }]) {
    const { g } = fresh(true);
    assert.equal(g.landingContacts.size, 1);
    reset(g);
    assert.equal(g.landingContacts.size, 0);
  }
});
test('dead enemies and defeated Bosses cannot retain contact protection', () => {
  for (const boss of [false, true]) {
    const { g, e } = fresh(boss);
    g.damage(e, 999);
    g.reap();
    assert.equal(g.landingContacts.size, 0);
  }
});
console.log(`${passed} landing contact scenario groups passed.`);
