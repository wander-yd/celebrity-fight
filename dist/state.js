'use strict';

// Shared browser state. Simulation stays in core.js.
const {
  Arena,
  W,
  H,
  THEMES,
  ITEMS,
  PLAYER_ABILITIES,
  synergy,
  dist,
  clamp
} = VoidArena;
const canvas = document.getElementById('game'),
  ctx = canvas.getContext('2d'),
  overlay = document.getElementById('overlay');
const game = new Arena(),
  keys = {},
  pointer = {
    x: 600,
    y: 330,
    down: false
  };
let lastMode = '',
  touchOrigin = null,
  touchMove = null,
  sound = false,
  audio,
  lastHp = game.player.hp,
  lastJumpCd = 0,
  heartFlash = 0,
  jumpFlash = 0;
