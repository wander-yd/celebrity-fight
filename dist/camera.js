'use strict';

// View state only. Combat never reads camera position, orientation or scale.
(() => {
  const DEFAULTS = Object.freeze({
    area: 270400,
    overscan: 96,
    followRate: 10
  });
  function create(bounds, config = DEFAULTS) {
    const camera = {
      x: bounds.centerX,
      y: bounds.centerY,
      width: 1,
      height: 1,
      viewWidth: 520,
      viewHeight: 520,
      scale: 1
    };
    function targetAxis(value, center, viewSize) {
      const travel = Math.max(0, bounds.size / 2 - viewSize / 2 + config.overscan);
      return travel > 0 ? center + travel * Math.tanh((value - center) / travel) : center;
    }
    function resize(width, height) {
      camera.width = Math.max(1, Number.isFinite(width) ? width : 1);
      camera.height = Math.max(1, Number.isFinite(height) ? height : 1);
      const aspect = camera.width / camera.height;
      camera.viewWidth = Math.sqrt(config.area * aspect);
      camera.viewHeight = Math.sqrt(config.area / aspect);
      camera.scale = camera.width / camera.viewWidth;
    }
    function target(point) {
      return {
        x: targetAxis(point.x, bounds.centerX, camera.viewWidth),
        y: targetAxis(point.y, bounds.centerY, camera.viewHeight)
      };
    }
    function snap(point) {
      Object.assign(camera, target(point));
    }
    function follow(point, dt) {
      const to = target(point),
        amount = 1 - Math.exp(-config.followRate * Math.max(0, Math.min(.25, dt || 0)));
      camera.x += (to.x - camera.x) * amount;
      camera.y += (to.y - camera.y) * amount;
    }
    function keepVisible(point) {
      // Rotation may narrow one axis. Preserve the view center unless it would
      // crop the player; then make only the smallest safe correction.
      const halfX = camera.viewWidth / 2,
        halfY = camera.viewHeight / 2;
      const padX = Math.min(72, halfX / 2),
        padY = Math.min(72, halfY / 2);
      camera.x = Math.max(point.x - halfX + padX, Math.min(point.x + halfX - padX, camera.x));
      camera.y = Math.max(point.y - halfY + padY, Math.min(point.y + halfY - padY, camera.y));
    }
    function worldToScreen(point) {
      return {
        x: (point.x - camera.x) * camera.scale + camera.width / 2,
        y: (point.y - camera.y) * camera.scale + camera.height / 2
      };
    }
    function screenToWorld(point) {
      return {
        x: (point.x - camera.width / 2) / camera.scale + camera.x,
        y: (point.y - camera.height / 2) / camera.scale + camera.y
      };
    }
    return Object.assign(camera, {
      resize,
      target,
      snap,
      follow,
      keepVisible,
      worldToScreen,
      screenToWorld
    });
  }
  globalThis.VoidCamera = {
    DEFAULTS,
    create
  };
})();
