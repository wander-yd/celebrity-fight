'use strict';
const assert = require('node:assert/strict');
const { harness } = require('./harness.cjs');
let passed = 0;
function fresh() {
  const h = harness(); h.click('start'); h.click('skip');
  h.run("game.spawnTimer=999;game.player.x=364;game.player.y=364;game.player.inv=999;var east={x:500,y:364},north={x:364,y:200},west={x:200,y:364};var victim=game.spawnMob('turret',game.room,{x:364,y:294});victim.hp=100;victim.stun=999");
  return h;
}
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
test('windup follows the latest direction and locks when downswing starts', () => {
  const h = fresh();
  h.run('game.beginSwing(game.player,east);game.updateMelee(.06,east);game.updateMelee(.06,north)');
  assert.equal(h.run('game.room.melee[0].face'), -Math.PI / 2);
  h.run('game.updateMelee(.08,west)');
  assert.equal(h.run('victim.hp'), 96);
  assert.equal(h.run('game.room.melee[0].face'), -Math.PI / 2);
  assert.equal(h.run('game.player.face'), Math.PI);
  h.run('game.updateMelee(.1,east);game.updateMelee(.1,west)');
  assert.equal(h.run('victim.hp'), 96);
});
test('turning after the lock cannot redirect damage', () => {
  const h = fresh();
  h.run('game.beginSwing(game.player,east);game.updateMelee(.12,east);game.updateMelee(.09,north)');
  assert.equal(h.run('victim.hp'), 100);
  assert.equal(h.run('game.room.melee[0].face'), 0);
  assert.equal(h.run('game.player.face'), -Math.PI / 2);
});
test('recovery starts at impact direction and ends at current aim using the short angle', () => {
  const h = fresh();
  h.run(`game.player.face=-179*Math.PI/180;game.room.melee=[{origin:game.player,face:179*Math.PI/180,elapsed:.20,clone:false}];var initial=weaponPose(game.player);game.room.melee[0].elapsed=.31;var middle=weaponPose(game.player);game.room.melee[0].elapsed=.42;var final=weaponPose(game.player);`);
  assert.ok(h.run('middle.hx-game.player.x') < -18, 'crosses180 degrees, not0');
  assert.ok(Math.abs(h.run('initial.hx-game.player.x') - 24 * Math.cos(179 * Math.PI / 180)) < 1e-8);
  assert.ok(Math.abs(h.run('final.hx-game.player.x') - 14 * Math.cos(-179 * Math.PI / 180)) < 1e-8);
  assert.ok(Math.abs(h.run('final.hy-game.player.y') - (14 * Math.sin(-179 * Math.PI / 180) - 12)) < 1e-8);
});
test('clone swings retain their captured direction', () => {
  const h = fresh();
  h.run('var clone={x:364,y:364,life:3,face:0};game.beginSwing(clone,east,true);game.updateMelee(.10,north);game.updateMelee(.11,north)');
  assert.equal(h.run('game.room.melee[0].face'), 0);
  assert.equal(h.run('victim.hp'), 100);
});
test('combat and tutorial pass current input aim into an active windup', () => {
  for (const tutorial of [false, true]) {
    const h = fresh();
    if (tutorial) h.run('game.practice();game.player.x=364;game.player.y=364');
    h.run('game.beginSwing(game.player,east);game.step(.05,{aim:north});game.step(.05,{aim:north})');
    assert.equal(h.run('game.room.melee[0].face'), -Math.PI / 2);
  }
});
test('touch drag steers an active windup while its impact preserves the new live aim', () => {
  const h = fresh(); h.frame(0);
  const e = (x, y) => ({pointerType:'touch',pointerId:2,clientX:x,clientY:y,preventDefault(){}});
  h.el('attack').onpointerdown(e(300,600));
  h.frame(17);
  h.el('attack').onpointermove(e(340,600));
  h.frame(100);
  assert.equal(h.run('game.room.melee[0].face'), 0);
  h.frame(150);
  h.el('attack').onpointermove(e(300,560));
  h.frame(230);
  assert.equal(h.run('game.room.melee[0].face'), 0);
  assert.equal(h.run('game.player.face'), -Math.PI / 2);
});
console.log(`${passed} swing aiming scenario groups passed.`);
