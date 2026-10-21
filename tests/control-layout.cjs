'use strict';

const assert = require('node:assert/strict');
const {
  harness
} = require('./harness.cjs');
const tests = [];
const test = (name, run) => tests.push({
  name,
  run
});
function memory(initial) {
  const data = new Map(initial ? [['void-arena-touch-layout-v1', initial]] : []);
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value)
  };
}
function open(options = {}) {
  const h = harness(undefined, {
    width: 390,
    height: 844,
    ...options
  });
  h.click('start');
  h.click('skip');
  h.frame(0);
  h.click('debug-open');
  assert.equal(h.el('debug-tab-controls'), null);
  h.unlock('voiddebug');
  h.click('debug-tab-controls');
  return h;
}
function slider(h, id, value) {
  h.el('controls-' + id).value = value;
  h.el('controls-' + id).oninput({
    target: h.el('controls-' + id)
  });
}
test('Controls stays locked; editing remains paused and never alters the run', () => {
  const h = open({
    storage: memory()
  });
  const snapshot = h.run('JSON.stringify({player:game.player,room:game.room,time:game.time,items:game.items})');
  slider(h, 'height', 35);
  slider(h, 'size', 96);
  assert.equal(h.run('game.mode'), 'debug');
  h.frame(5000);
  assert.equal(h.run('JSON.stringify({player:game.player,room:game.room,time:game.time,items:game.items})'), snapshot);
  assert.ok(h.el('controls-status').textContent.includes('Saved'));
  h.click('debug-close');
  assert.equal(h.run('game.mode'), 'play');
  assert.equal(h.el('jump').style.width, '96px');
});
test('portrait and landscape edits persist independently across reload, reset only selected profile', () => {
  const storage = memory();
  const h = open({
    storage
  });
  slider(h, 'height', 40);
  slider(h, 'size', 100);
  h.click('controls-landscape');
  slider(h, 'height', 25);
  slider(h, 'x', 90);
  const again = harness(undefined, {
    width: 390,
    height: 844,
    storage
  });
  assert.equal(again.run('touchLayout.get().portrait.y'), .6);
  assert.equal(again.run('touchLayout.get().portrait.size'), 100);
  assert.equal(again.run('touchLayout.get().landscape.y'), .75);
  assert.equal(again.run('touchLayout.get().landscape.x'), .9);
  h.click('controls-reset');
  assert.equal(h.run('touchLayout.get().landscape.y'), .7);
  assert.equal(h.run('touchLayout.get().portrait.y'), .6);
});
test('relative layout remains inside safe bounds across devices and extreme edits', () => {
  const h = harness();
  for (const [w, height] of [[320, 568], [390, 844], [844, 390], [1024, 768], [280, 240]]) {
    for (const x of [.55, .95]) for (const y of [.35, .88]) {
      const p = JSON.parse(h.run(`JSON.stringify(VoidTouchLayout.position({x:${x},y:${y},size:112},${w},${height},{left:20,top:16,width:${w - 40},height:${height - 32}}))`));
      assert.ok(p.x - p.size / 2 >= 20 && p.x + p.size / 2 <= w - 20);
      assert.ok(p.y - p.size / 2 >= 16 && p.y + p.size / 2 <= height - 16);
    }
  }
});
test('corrupt, future, invalid and unavailable storage all leave usable defaults', () => {
  for (const initial of ['bad json', 'null', '{"version":99,"portrait":{"size":9999}}', '{"version":1,"portrait":{"x":"bad","y":-3,"size":9999}}']) {
    const h = harness(undefined, {
      storage: memory(initial)
    });
    const c = JSON.parse(h.run('touchLayout.export()'));
    assert.equal(c.version, 1);
    assert.ok(c.portrait.x >= .55 && c.portrait.x <= .95);
    assert.ok(c.portrait.y >= .35 && c.portrait.y <= .88);
    assert.ok(c.portrait.size >= 64 && c.portrait.size <= 112);
  }
  const h = open({
    storage: {
      getItem() {
        throw Error('blocked');
      },
      setItem() {
        throw Error('full');
      }
    }
  });
  slider(h, 'size', 104);
  assert.ok(h.el('controls-status').textContent.includes('Temporary'));
  assert.equal(h.run('touchLayout.get().portrait.size'), 104);
  const blocked = harness(undefined, {
    afterScript(file, {
      env
    }) {
      if (file === 'state.js') Object.defineProperty(env.window, 'localStorage', {
        get() {
          throw Error('denied');
        }
      });
    }
  });
  assert.equal(blocked.run('touchLayout.get().portrait.size'), 84);
});
test('drag owns one pointer, updates configuration, cancellation stops edits', () => {
  const h = open({
    storage: memory(),
    rects: {
      'controls-preview': {
        left: 0,
        top: 0,
        width: 240,
        height: 520
      }
    }
  });
  const button = h.el('controls-preview-jump');
  const e = (id, x, y) => ({
    pointerId: id,
    clientX: x,
    clientY: y,
    button: 0,
    preventDefault() {}
  });
  button.onpointerdown(e(1, 197, 406));
  button.onpointermove(e(2, 100, 200));
  assert.equal(h.run('touchLayout.get().portrait.y'), .78);
  button.onpointermove(e(1, 170, 300));
  assert.ok(h.run('touchLayout.get().portrait.y') < .6);
  const saved = h.run('touchLayout.export()');
  button.onpointercancel(e(1));
  button.onpointermove(e(1, 200, 450));
  assert.equal(h.run('touchLayout.export()'), saved);
});
test('rotation applies matching orientation without overwriting either saved profile or combat', () => {
  const h = open({
    storage: memory()
  });
  slider(h, 'height', 40);
  h.click('controls-landscape');
  slider(h, 'size', 100);
  h.click('debug-close');
  const c = h.run('touchLayout.export()'),
    snapshot = h.run('JSON.stringify({player:game.player,room:game.room,time:game.time})');
  h.env.window.innerWidth = 844;
  h.env.window.innerHeight = 390;
  h.listeners.resize();
  assert.equal(h.el('jump').style.width, '100px');
  h.env.window.innerWidth = 390;
  h.env.window.innerHeight = 844;
  h.listeners.resize();
  assert.equal(h.el('jump').style.width, '84px');
  assert.equal(h.run('touchLayout.export()'), c);
  assert.equal(h.run('JSON.stringify({player:game.player,room:game.room,time:game.time})'), snapshot);
});
test('preview and live Jump use the same current-device safe area', () => {
  const h = open({
    storage: memory(),
    rects: {
      'control-safe-area': {
        left: 20,
        top: 24,
        width: 350,
        height: 780
      }
    }
  });
  slider(h, 'height', 35);
  const x = parseFloat(h.el('jump').style.left),
    y = parseFloat(h.el('jump').style.top);
  assert.ok(Math.abs(parseFloat(h.el('controls-preview-jump').style.left) / 100 * 390 - x) < 1e-7);
  assert.ok(Math.abs(parseFloat(h.el('controls-preview-jump').style.top) / 100 * 844 - y) < 1e-7);
  assert.ok(x - 42 >= 20 && x + 42 <= 370 && y - 42 >= 24 && y + 42 <= 804);
});
test('copy exports exactly both local profiles; denied clipboard exposes selectable text', async () => {
  let copied;
  const h = open({
    storage: memory(),
    clipboard: {
      async writeText(text) {
        copied = text;
      }
    }
  });
  slider(h, 'size', 92);
  await h.el('controls-copy').onclick();
  assert.equal(copied, h.run('touchLayout.export()'));
  assert.equal(h.el('controls-status').textContent, 'Config copied.');
  const fallback = open({
    clipboard: {
      async writeText() {
        throw Error('denied');
      }
    }
  });
  await fallback.el('controls-copy').onclick();
  assert.equal(fallback.el('controls-export').hidden, false);
  assert.equal(fallback.el('controls-export').value, fallback.run('touchLayout.export()'));
  assert.ok(fallback.el('controls-status').textContent.includes('Select and copy'));
});
(async () => {
  for (const {
    name,
    run
  } of tests) {
    await run();
    console.log('PASS ' + name);
  }
  console.log(`${tests.length} control layout scenario groups passed.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
