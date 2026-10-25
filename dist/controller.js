'use strict';

// Device-independent commands. This module has no DOM, camera or Arena state.
const VoidInput = (() => {
  const number = value => Number.isFinite(value) ? value : 0;
  function command(value = {}) {
    return Object.freeze({
      moveX: Math.max(-1, Math.min(1, number(value.moveX))),
      moveY: Math.max(-1, Math.min(1, number(value.moveY))),
      aim: Object.freeze({ x: number(value.aim?.x), y: number(value.aim?.y) }),
      aimAngle: Number.isFinite(value.aimAngle) ? value.aimAngle : undefined,
      attackHeld: !!value.attackHeld,
      attackPressed: !!value.attackPressed,
      jumpPressed: !!value.jumpPressed
    });
  }
  function simulation(input) {
    return { mx: input.moveX, my: input.moveY, aim: input.aim, aimAngle: input.aimAngle,
      attack: input.attackHeld || input.attackPressed, autoAim: false, jumpPressed: input.jumpPressed };
  }
  return { command, simulation };
})();
