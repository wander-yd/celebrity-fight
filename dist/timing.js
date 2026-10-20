'use strict';

// Render callbacks may be irregular. Combat always advances in the same 60Hz steps.
(() => {
  const STEP = 1 / 60;
  const MAX_FRAME = 0.25;
  const MAX_STEPS = 15;
  function createClock() {
    let previous = null,
      accumulated = 0,
      scene = null;
    function reset() {
      previous = null;
      accumulated = 0;
      scene = null;
    }
    function advance(timestamp, context, active, update) {
      if (!Number.isFinite(timestamp)) {
        reset();
        return 0;
      }
      if (previous === null || scene !== context) {
        previous = timestamp;
        scene = context;
        accumulated = 0;
        return 0;
      }
      const elapsed = Math.min(MAX_FRAME, Math.max(0, (timestamp - previous) / 1000));
      previous = timestamp;
      if (!active) {
        accumulated = 0;
        return 0;
      }
      accumulated += elapsed;
      let steps = 0;
      while (accumulated + 1e-9 >= STEP && steps < MAX_STEPS) {
        accumulated = Math.max(0, accumulated - STEP);
        steps++;
        // A run/chapter/menu transition must not spend leftover time in its new state.
        if (update(STEP) === false) {
          reset();
          break;
        }
      }
      return steps;
    }
    return {
      advance,
      reset
    };
  }
  globalThis.VoidTiming = {
    STEP,
    MAX_FRAME,
    createClock
  };
})();
