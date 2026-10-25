'use strict';

// Browser-local presentation only. Never feeds positions or timing into combat.
const VoidTouchLayout = (() => {
  const KEY = 'void-arena-touch-layout-v2';
  const LEGACY_KEY = 'void-arena-touch-layout-v1';
  const defaults = Object.freeze({
    portrait: Object.freeze({
      x: .64,
      y: .64,
      size: 84,
      attack: Object.freeze({ x: .83, y: .80, size: 96 })
    }),
    landscape: Object.freeze({
      x: .79,
      y: .43,
      size: 84,
      attack: Object.freeze({ x: .88, y: .73, size: 96 })
    })
  });
  const bound = (value, low, high) => Math.max(low, Math.min(high, value));
  const finite = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  function normalize(value) {
    const result = { version: 2 };
    const button = (p, d) => ({
      x: bound(finite(p?.x, d.x), .55, .95),
      y: bound(finite(p?.y, d.y), .35, .88),
      size: bound(finite(p?.size, d.size), 64, 112)
    });
    for (const key of ['portrait', 'landscape']) {
      const p = [1, 2].includes(value?.version) ? value[key] : null, d = defaults[key];
      result[key] = { ...button(p, d), attack: button(value?.version === 2 ? p?.attack : null, d.attack) };
    }
    return result;
  }
  function position(profile, width, height, safe = {
    left: 0,
    top: 0,
    width,
    height
  }) {
    const w = Math.max(1, safe.width),
      h = Math.max(1, safe.height);
    const size = Math.max(1, Math.min(profile.size, w - 24, h - 108));
    const radius = size / 2;
    const minX = Math.min(w / 2, radius + 12),
      maxX = Math.max(minX, w - radius - 12);
    const minY = Math.min(h / 2, radius + 72),
      maxY = Math.max(minY, h - radius - 36);
    return {
      x: safe.left + bound(w * profile.x, minX, maxX),
      y: safe.top + bound(h * profile.y, minY, maxY),
      size
    };
  }
  // Shared safe placement for the live controls and editor; requested positions
  // stay saved, while actual circles cannot cover each other or the left stick.
  function layout(profile, width, height, safe = { left: 0, top: 0, width, height }) {
    const w = Math.max(1, safe.width), h = Math.max(1, safe.height);
    let jump, attack;
    for (let scale = 1; scale > .01; scale *= .85) {
      jump = position({ ...profile, size: profile.size * scale }, width, height, safe);
      attack = position({ ...profile.attack, size: profile.attack.size * scale }, width, height, safe);
      const gap = (jump.size + attack.size) / 2 + 10;
      if (Math.hypot(jump.x - attack.x, jump.y - attack.y) >= gap) return { jump, attack };
      let best = null, score = Infinity;
      const r = jump.size / 2;
      const minX = safe.left + Math.max(w / 2 + 8, r + 12), maxX = safe.left + w - r - 12;
      const minY = safe.top + r + 72, maxY = safe.top + h - r - 36;
      const consider = (x, y) => {
        if (x < minX || x > maxX || y < minY || y > maxY || Math.hypot(x - attack.x, y - attack.y) < gap) return;
        const d = Math.hypot(x - jump.x, y - jump.y);
        if (d < score) { score = d; best = { ...jump, x, y }; }
      };
      for (let i = 0; i < 64; i++) {
        const a = i * Math.PI / 32;
        consider(attack.x + Math.cos(a) * (gap + .01), attack.y + Math.sin(a) * (gap + .01));
      }
      for (let x = 0; x <= 12; x++) for (let y = 0; y <= 12; y++) consider(minX + (maxX - minX) * x / 12, minY + (maxY - minY) * y / 12);
      if (best) return { jump: best, attack };
    }
    return { jump, attack };
  }
  function create(storage) {
    let value;
    try {
      value = JSON.parse(storage?.getItem(KEY) ?? storage?.getItem(LEGACY_KEY));
    } catch (_) {}
    let config = normalize(value);
    return {
      get: () => normalize(config),
      update(key, patch, control = 'jump') {
        if (!defaults[key]) return false;
        config = normalize({
          ...config,
          [key]: {
            ...config[key],
            ...(control === 'attack' ? { attack: { ...config[key].attack, ...patch } } : patch)
          }
        });
        return this.save();
      },
      reset(key) {
        return this.update(key, defaults[key]);
      },
      save() {
        try {
          if (!storage) return false;
          storage.setItem(KEY, JSON.stringify(config));
          return true;
        } catch (_) {
          return false;
        }
      },
      export: () => JSON.stringify(config, null, 2)
    };
  }
  return {
    KEY,
    defaults,
    normalize,
    position,
    layout,
    create
  };
})();
let touchLayoutStorage;
try {
  touchLayoutStorage = window.localStorage;
} catch (_) {}
const touchLayout = VoidTouchLayout.create(touchLayoutStorage);
function controlSafeBounds() {
  const stage = document.getElementById('game-stage').getBoundingClientRect();
  const rect = document.getElementById('control-safe-area').getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? {
    left: rect.left - stage.left,
    top: rect.top - stage.top,
    width: rect.width,
    height: rect.height
  } : undefined;
}
function applyTouchLayout() {
  const width = camera.width,
    height = camera.height,
    safe = controlSafeBounds();
  const profile = touchLayout.get()[width > height ? 'landscape' : 'portrait'];
  const placed = VoidTouchLayout.layout(profile, width, height, safe);
  for (const id of ['jump', 'attack']) {
    const button = document.getElementById(id), p = placed[id];
    button.style.left = p.x + 'px';
    button.style.top = p.y + 'px';
    button.style.width = p.size + 'px';
    button.style.height = p.size + 'px';
  }
}
