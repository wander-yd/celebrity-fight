'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), cp = require('node:child_process');
const { harness } = require('./harness.cjs');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
const event = (id, x = 100, y = 200) => ({ pointerType: 'touch', pointerId: id, clientX: x, clientY: y, preventDefault() {} });
function start(options) { const h = harness(undefined, options); h.click('start'); h.click('skip'); h.frame(0); h.run('game.random=()=>.5;game.spawnTimer=999;game.player.inv=999'); return h; }
test('command contract runs without browser state and snapshots mutable device coordinates', () => {
  const context = {}; vm.createContext(context);
  vm.runInContext(fs.readFileSync('dist/controller.js', 'utf8'), context);
  vm.runInContext("var point={x:12,y:34};var command=VoidInput.command({moveX:1,moveY:-1,aim:point,attackPressed:true});point.x=99", context);
  assert.equal(vm.runInContext('command.aim.x', context), 12);
  assert.equal(vm.runInContext('Object.isFrozen(command)&&Object.isFrozen(command.aim)', context), true);
  assert.equal(vm.runInContext('VoidInput.simulation(command).attack', context), true);
  assert.equal(vm.runInContext('VoidInput.command().jumpPressed', context), false);
});
test('keyboard point aim and touch direction aim share actions and initially agree', () => {
  const h = start();
  h.run('keys.d=true;pointer.x=game.player.x+100;pointer.y=game.player.y;pointer.down=true;var keyboard=keyboardController.read()');
  h.run('touchMove={x:1,y:0};attackPointerId=2;attackQueued=false;attackManual=true;attackDirection={x:1,y:0};var touch=touchController.read()');
  assert.equal(h.run('JSON.stringify(VoidInput.command(keyboard))'), h.run('JSON.stringify(VoidInput.command({...touch,aimAngle:undefined}))'));
  assert.equal(h.run('VoidInput.command(touch).aimAngle'), 0);
  assert.equal(h.run('VoidInput.simulation(VoidInput.command(touch)).aimAngle'), 0);
  assert.equal(h.run('VoidInput.command(keyboard).aimAngle'), undefined);
  h.run('game.step(.016,VoidInput.simulation(VoidInput.command(keyboard)))');
  assert.ok(h.run('game.player.attackCd') > 0);
});
test('Jump dispatch is immediate, one-shot, and still respects cooldown and mode', () => {
  const h = start();
  h.run('var dispatched=0;var applyActions=game.applyInputActions.bind(game);game.applyInputActions=input=>{if(input.jumpPressed)dispatched++;return applyActions(input)}');
  h.listeners.keydown({key:' ',code:'Space',preventDefault(){}});
  assert.equal(h.run('game.player.jump'), .58);
  assert.equal(h.run('dispatched'), 1);
  h.listeners.keydown({key:' ',code:'Space',repeat:true,preventDefault(){}});
  h.frame(100); h.frame(200);
  assert.equal(h.run('dispatched'), 1);
  assert.equal(h.run('playerController.read().jumpPressed'), false);
  h.el('jump').onpointerdown(event(3));
  assert.ok(h.run('game.player.jump') < .58);
  h.click('pause');
  assert.equal(h.run('playerController.jump()'), false);
});
test('clearing both adapters removes held keys, fingers and pending taps but preserves an initiated swing', () => {
  const h = start();
  h.run('keys.w=true;keys.d=true;pointer.down=true;game.beginSwing(game.player,{x:600,y:300})');
  h.canvasListeners.pointerdown(event(1));
  h.el('attack').onpointerdown(event(2, 300, 600));
  h.run('keys.w=true;var swings=game.room.melee.length;playerController.clear()');
  assert.equal(h.run('Object.values(keys).some(Boolean)'), false);
  assert.equal(h.run('pointer.down'), false);
  assert.equal(h.run('attackQueued'), false);
  assert.equal(h.run('attackPointerId'), null);
  assert.equal(h.run('touchMove'), null);
  assert.equal(h.run('game.room.melee.length'), h.run('swings'));
});
test('single tap remains pending through cooldown and is acknowledged only when attack starts', () => {
  const h = start();
  h.run('game.player.attackCd=.2');
  h.el('attack').onpointerdown(event(2)); h.el('attack').onpointerup(event(2));
  assert.equal(h.run('playerController.read().attackHeld'), false);
  assert.equal(h.run('playerController.read().attackPressed'), true);
  h.frame(100);
  assert.equal(h.run('playerController.read().attackPressed'), true);
  h.frame(250);
  assert.equal(h.run('playerController.read().attackPressed'), false);
  assert.ok(h.run('game.player.attackCd') > 0);
  const busy = start();
  busy.run('game.beginSwing(game.player,{x:600,y:300});game.player.attackCd=0');
  busy.el('attack').onpointerdown(event(2)); busy.el('attack').onpointerup(event(2));
  busy.frame(17);
  assert.equal(busy.run('playerController.read().attackPressed'), true, 'a rejected overlapping swing cannot consume a tap');
});
test('representative keyboard/touch combat replay matches Build41 before extraction', () => {
  const sha = 'eb9a019c20fcfa2efb0b32f6db139a836ed931a7';
  const prior = file => cp.execFileSync('git', ['show', sha + ':dist/' + file], { encoding: 'utf8' });
  for (const kind of ['keyboard', 'touch']) {
    const before = start({ sources: { 'input.js': prior('input.js'), 'game.js': prior('game.js'), 'ui.js': prior('ui.js') } }), after = start();
    const snapshot = h => h.run('JSON.stringify({mode:game.mode,player:game.player,room:game.room,time:game.time,items:game.items})');
    for (const h of [before, after]) {
      h.run("var enemy=game.spawnMob('shield',game.room,{x:game.player.x+60,y:game.player.y});enemy.hp=100;enemy.stun=999;enemy.broken=999");
      if (kind === 'keyboard') h.canvasListeners.pointerdown({ pointerType: 'mouse', pointerId: 4, clientX: 700, clientY: 300 });
      else { h.canvasListeners.pointerdown(event(1)); h.el('attack').onpointerdown(event(2, 300, 600)); }
    }
    for (let frame = 1; frame <= 60; frame++) {
      if (frame === 6) for (const h of [before, after]) {
        if (kind === 'keyboard') h.canvasListeners.pointermove({pointerType:'mouse',clientX:200,clientY:200});
        else h.el('attack').onpointermove(event(2, 330, 570));
      }
      if (frame === 15) for (const h of [before, after]) {
        if (kind === 'keyboard') h.listeners.keydown({key:' ',code:'Space',preventDefault(){}});
        else h.el('jump').onpointerdown(event(3));
      }
      before.frame(frame * 1000 / 60); after.frame(frame * 1000 / 60);
      assert.equal(snapshot(after), snapshot(before), kind + ' frame ' + frame);
    }
  }
});
console.log(`${passed} controller extraction scenario groups passed.`);
