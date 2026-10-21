'use strict';

const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm');
const env = {};
vm.createContext(env);
for (const file of ['core', 'camera']) vm.runInContext(fs.readFileSync('dist/' + file + '.js', 'utf8'), env);
const {
  ARENA,
  CONVEYORS,
  Arena,
  free
} = env.VoidArena;
const {
  create,
  DEFAULTS
} = env.VoidCamera;
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
assert.equal(ARENA.right - ARENA.left, ARENA.bottom - ARENA.top);
assert.ok(Math.abs(ARENA.size ** 2 / (904 * 494) - 1) < .01);
near(CONVEYORS[0].y + 24 + CONVEYORS[1].y + 24, 2 * ARENA.centerY);
let checks = 0;
for (const [width, height] of [[390, 844], [844, 390], [320, 568], [1366, 768], [768, 1024], [1800, 300], [0, 0]]) {
  const c = create(ARENA);
  c.resize(width, height);
  near(c.viewWidth * c.viewHeight, DEFAULTS.area);
  for (const x of [ARENA.left + 14, ARENA.centerX, ARENA.right - 14]) for (const y of [ARENA.top + 14, ARENA.centerY, ARENA.bottom - 14]) {
    c.snap({
      x,
      y
    });
    const screen = c.worldToScreen({
        x,
        y
      }),
      back = c.screenToWorld(screen);
    near(back.x, x);
    near(back.y, y);
    assert.ok(screen.x >= 0 && screen.x <= c.width && screen.y >= 0 && screen.y <= c.height);
    const before = {
        x: c.x,
        y: c.y
      },
      goal = c.target({
        x: ARENA.centerX,
        y: ARENA.centerY
      });
    c.follow({
      x: ARENA.centerX,
      y: ARENA.centerY
    }, 1 / 60);
    assert.ok(Math.abs(c.x - goal.x) <= Math.abs(before.x - goal.x));
    assert.ok(Math.abs(c.y - goal.y) <= Math.abs(before.y - goal.y));
    checks++;
  }
  c.snap({
    x: ARENA.centerX,
    y: ARENA.centerY
  });
  const inner = c.target({
    x: ARENA.centerX + 10,
    y: ARENA.centerY
  });
  const edge = c.target({
    x: ARENA.right - 14,
    y: ARENA.centerY
  });
  const next = c.target({
    x: ARENA.right - 24,
    y: ARENA.centerY
  });
  assert.ok(edge.x - next.x <= inner.x - ARENA.centerX + 1e-8, 'following diminishes near edges');
}
const wide = create(ARENA);
wide.resize(5000, 100);
wide.snap({
  x: ARENA.right,
  y: ARENA.top
});
assert.ok(Number.isFinite(wide.x) && Number.isFinite(wide.y), 'zero-travel guard');
const g = new Arena(() => .5);
g.newRun();
for (let i = 0; i < 80; i++) {
  g.random = () => (i * 7919 + 17) % 997 / 997;
  const e = g.spawnMob('chaser');
  assert.ok(free(g.room, e.x, e.y, e.r));
}
console.log(`PASS square area, conveyors and ${checks} camera corner/orientation/inverse cases`);
