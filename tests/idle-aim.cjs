'use strict';
const assert = require('node:assert/strict');
const { harness } = require('./harness.cjs');
let passed = 0;
const finger = (id, x = 100, y = 200) => ({ pointerType:'touch', pointerId:id, clientX:x, clientY:y, preventDefault(){} });
function fresh(tutorial = false) {
  const h = harness(); h.click('start'); h.click(tutorial ? 'practice' : 'skip'); h.frame(0);
  h.run("setInputMode('touch');game.random=()=>.5;game.spawnTimer=999;game.player.inv=999;game.player.face=0;game.room.mobs=[];var enemy=game.spawnMob('turret',game.room,{x:game.player.x,y:game.player.y-150});enemy.stun=999;enemy.hp=100");
  return h;
}
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
test('movement without Attack preserves facing in combat and tutorial', () => {
  for (const tutorial of [false, true]) {
    const h=fresh(tutorial);
    h.canvasListeners.pointerdown(finger(1)); h.canvasListeners.pointermove(finger(1,100,240));
    for(let i=1;i<=20;i++)h.frame(i*1000/60);
    assert.ok(Math.abs(h.run('game.player.face'))<1e-10);
    assert.equal(h.run('attackQueued'),false);
  }
});
test('released queued tap freezes direction and fires once despite target movement', () => {
  const h=fresh(); h.run('game.player.attackCd=.3;var starts=0;var begin=game.beginSwing.bind(game);game.beginSwing=(...args)=>{var ok=begin(...args);if(ok)starts++;return ok}');
  h.el('attack').onpointerdown(finger(2,300,600)); h.el('attack').onpointerup(finger(2,300,600));
  h.run('enemy.x=game.player.x+150;enemy.y=game.player.y');
  h.frame(100);
  assert.ok(Math.abs(h.run('game.player.face')+Math.PI/2)<1e-10);
  assert.equal(h.run('attackQueued'),true);
  h.frame(350);
  assert.equal(h.run('starts'),1);
  assert.equal(h.run('attackQueued'),false);
  assert.ok(Math.abs(h.run('game.room.melee[0].face')+Math.PI/2)<1e-10);
  h.frame(600);h.frame(850);
  assert.equal(h.run('starts'),1);
});
test('released held attack cannot follow an enemy after recovery', () => {
  const h=fresh();h.el('attack').onpointerdown(finger(2,300,600));h.frame(100);
  h.el('attack').onpointerup(finger(2,300,600));
  h.run('enemy.x=game.player.x+150;enemy.y=game.player.y');
  h.frame(350);h.frame(600);
  assert.ok(Math.abs(h.run('game.player.face')+Math.PI/2)<1e-10);
  h.el('attack').onpointerdown(finger(3,300,600));h.frame(650);
  assert.ok(Math.abs(h.run('game.player.face'))<1e-10);
});
test('held manual direction does not drift while moving', () => {
  const h=fresh();h.canvasListeners.pointerdown(finger(1));h.canvasListeners.pointermove(finger(1,100,240));
  h.el('attack').onpointerdown(finger(2,300,600));h.el('attack').onpointermove(finger(2,340,600));
  for(let i=1;i<=20;i++)h.frame(i*1000/60);
  assert.ok(Math.abs(h.run('game.player.face'))<1e-10);
});
test('idle and released reads never consult soft targets; cancel removes pending attacks', () => {
  const h=fresh();h.el('attack').onpointerdown(finger(2,300,600));h.el('attack').onpointerup(finger(2,300,600));
  h.run("var targets=game.targets;game.targets=()=>{throw Error('unexpected idle targeting')};touchController.read();game.targets=targets");
  h.el('attack').onpointerdown(finger(3,300,600));h.el('attack').onpointercancel(finger(3));
  assert.equal(h.run('attackQueued'),false);
  h.run("game.targets=()=>{throw Error('unexpected cancel targeting')};touchController.read()");
});
console.log(`${passed} frozen touch aim scenario groups passed.`);
