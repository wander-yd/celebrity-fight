'use strict';

const fs = require('fs'), vm = require('vm'), assert = require('node:assert/strict');
const env = { performance: { now: () => 1000 } };
vm.createContext(env);
for (const file of ['weapon.js', 'pickup.js', 'actor-state.js', 'projectile.js', 'effects.js', 'boss-skills.js', 'core.js', 'controller.js', 'network.js']) {
  vm.runInContext(fs.readFileSync('dist/' + file, 'utf8'), env, { filename: file });
}
const game = new env.VoidArena.Arena(() => .5);
game.newRun();
game.startBossPractice();
game.boss.grace = 0;
game.player.x = game.boss.x - 60;
game.player.y = game.boss.y;
const hp = game.boss.hp;
for (let i = 0; i < 24; i++) game.step(1 / 60, {}, { mx: 0, my: 0, attack: true });
assert.ok(game.boss.hp < hp, 'remote Hunter attack is resolved by the authoritative Boss simulation');
assert.equal(game.player.x, game.boss.x - 60, 'neutral remote movement keeps the Hunter position stable');

env.netGame = game;
const state = vm.runInContext('VoidNetwork.snapshot(netGame)', env);
assert.doesNotThrow(() => JSON.stringify(state), 'melee origins are encoded without circular references');
const replica = new env.VoidArena.Arena(() => .5);
replica.newRun();
env.netReplica = replica;
env.snapshot = state;
assert.equal(vm.runInContext('VoidNetwork.applySnapshot(netReplica, snapshot)', env), true);
assert.equal(replica.boss.hp, game.boss.hp);
assert.equal(replica.player.x, game.player.x);
assert.ok(replica.room.melee.every(swing => swing.origin === replica.player || swing.origin === replica.boss), 'swing origins point to replica actors');
assert.equal(vm.runInContext('VoidNetwork.applySnapshot(netReplica, { v: 2 })', env), false, 'unknown snapshot versions are rejected');
console.log('PASS host-authoritative Hunter attacks and safe actor-linked state snapshots');
