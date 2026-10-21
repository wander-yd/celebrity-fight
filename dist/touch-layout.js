'use strict';

// Browser-local presentation only. Never feeds positions or timing into combat.
const VoidTouchLayout = (() => {
  const KEY = 'void-arena-touch-layout-v1';
  const defaults = Object.freeze({
    portrait: Object.freeze({
      x: .82,
      y: .78,
      size: 84
    }),
    landscape: Object.freeze({
      x: .86,
      y: .70,
      size: 84
    })
  });
  const bound = (value, low, high) => Math.max(low, Math.min(high, value));
  const finite = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  function normalize(value) {
    const result = {
      version: 1
    };
    for (const key of ['portrait', 'landscape']) {
      const p = value?.version === 1 ? value[key] : null,
        d = defaults[key];
      result[key] = {
        x: bound(finite(p?.x, d.x), .55, .95),
        y: bound(finite(p?.y, d.y), .35, .88),
        size: bound(finite(p?.size, d.size), 64, 112)
      };
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
  function create(storage) {
    let value;
    try {
      value = JSON.parse(storage?.getItem(KEY));
    } catch (_) {}
    let config = normalize(value);
    return {
      get: () => normalize(config),
      update(key, patch) {
        if (!defaults[key]) return false;
        config = normalize({
          ...config,
          [key]: {
            ...config[key],
            ...patch
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
  const placed = VoidTouchLayout.position(profile, width, height, safe);
  const jump = document.getElementById('jump');
  jump.style.left = placed.x + 'px';
  jump.style.top = placed.y + 'px';
  jump.style.width = placed.size + 'px';
  jump.style.height = placed.size + 'px';
}
