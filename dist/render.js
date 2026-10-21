'use strict';

// Canvas layers: ground, actors/effects, jump indicator, hostile bullets, HUD.
function ellipseOn(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function ellipse(...args) {
  ellipseOn(ctx, ...args);
}
function textOn(ctx, s, x, y, size = 12, color = '#eee9db', align = 'left', bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
}
function text(...args) {
  textOn(ctx, ...args);
}
function person(x, y, kind = 'trump', scale = 1, paint = ctx) {
  const ctx = paint,
    ellipse = (...args) => ellipseOn(ctx, ...args);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ellipse(0, 9, 19, 7, '#0005');
  if (kind === 'pooh') {
    ellipse(-11, 19, 10, 6, '#e5ae2d');
    ellipse(11, 19, 10, 6, '#e5ae2d');
    ellipse(-22, -8, 8, 17, '#eebc3c');
    ellipse(22, -8, 8, 17, '#eebc3c');
    ellipse(0, -2, 22, 25, '#efbe43');
    ellipse(-4, 3, 15, 17, '#f5c74f');
    ctx.fillStyle = '#cd252a';
    ctx.beginPath();
    ctx.moveTo(-14, -29);
    ctx.lineTo(-26, -21);
    ctx.lineTo(-23, -9);
    ctx.lineTo(-17, -11);
    ctx.lineTo(-18, -1);
    ctx.quadraticCurveTo(0, 4, 18, -1);
    ctx.lineTo(17, -11);
    ctx.lineTo(23, -9);
    ctx.lineTo(26, -21);
    ctx.lineTo(14, -29);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#a51f22';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-16, -4);
    ctx.quadraticCurveTo(0, 0, 16, -4);
    ctx.stroke();
    ellipse(-14, -56, 8, 8, '#eebc3c');
    ellipse(14, -56, 8, 8, '#eebc3c');
    ellipse(-14, -56, 4, 4, '#dca329');
    ellipse(14, -56, 4, 4, '#dca329');
    ellipse(0, -39, 20, 21, '#efbd3e');
    ellipse(0, -29, 13, 10, '#f6cb58');
    ellipse(-8, -40, 2, 2.7, '#302a20');
    ellipse(8, -40, 2, 2.7, '#302a20');
    ellipse(0, -34, 4.5, 3.2, '#302a20');
    ctx.strokeStyle = '#61431d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-11, -29);
    ctx.quadraticCurveTo(0, -18, 11, -29);
    ctx.moveTo(-11, -47);
    ctx.quadraticCurveTo(-7, -50, -4, -47);
    ctx.moveTo(4, -47);
    ctx.quadraticCurveTo(7, -50, 11, -47);
    ctx.stroke();
  } else if (kind === 'mojtaba') {
    ctx.fillStyle = '#242227';
    ctx.beginPath();
    ctx.moveTo(-13, -18);
    ctx.lineTo(-22, 15);
    ctx.lineTo(22, 15);
    ctx.lineTo(13, -18);
    ctx.fill();
    ellipse(0, -28, 15, 18, '#d6a47e');
    ctx.fillStyle = '#343036';
    ctx.beginPath();
    ctx.moveTo(-13, -26);
    ctx.lineTo(-10, -7);
    ctx.lineTo(0, 1);
    ctx.lineTo(10, -7);
    ctx.lineTo(13, -26);
    ctx.fill();
    ellipse(0, -45, 19, 10, '#17171c');
    ellipse(0, -50, 14, 8, '#25232b');
    ctx.fillStyle = '#10151c';
    ctx.fillRect(-9, -31, 6, 3);
    ctx.fillRect(4, -31, 6, 3);
    ctx.strokeStyle = '#c5ae8c';
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -33, 11, 7);
    ctx.strokeRect(2, -33, 11, 7);
  } else {
    ctx.fillStyle = '#131927';
    ctx.fillRect(-12, 4, 9, 12);
    ctx.fillRect(4, 4, 9, 12);
    ctx.fillStyle = '#eae7dc';
    ctx.fillRect(-14, -18, 28, 25);
    ctx.fillStyle = kind === 'xi' ? '#283b50' : '#294264';
    ctx.fillRect(-17, -18, 12, 25);
    ctx.fillRect(5, -18, 12, 25);
    ctx.fillStyle = kind === 'biden' ? '#80b4ef' : '#e55f60';
    ctx.fillRect(-3, -16, 6, 20);
    ctx.fillStyle = kind === 'trump' ? '#ffa45f' : kind === 'xi' ? '#e9bd99' : '#ecc7aa';
    ctx.fillRect(-14, -39, 28, 25);
    ctx.fillRect(-17, -32, 5, 11);
    ctx.fillStyle = kind === 'trump' ? '#ffd671' : kind === 'biden' ? '#edf0ef' : '#262d32';
    ctx.fillRect(-15, -43, 30, 10);
    ctx.fillRect(-18, -39, 24, 7);
    ctx.fillRect(8, -35, 7, 6);
    ctx.fillStyle = '#453d38';
    ctx.fillRect(-9, -29, 4, 3);
    ctx.fillRect(6, -29, 4, 3);
    if (kind === 'biden') {
      ctx.fillStyle = '#273747';
      ctx.fillRect(-11, -30, 11, 6);
      ctx.fillRect(3, -30, 11, 6);
      ctx.fillRect(-1, -28, 5, 2);
      ctx.fillStyle = '#ecc7aa';
      ctx.fillRect(-12, 10, 9, 11);
      ctx.fillRect(4, 10, 9, 11);
      ctx.fillStyle = '#f8faf4';
      ctx.beginPath();
      ctx.moveTo(-19, -2);
      ctx.lineTo(19, -2);
      ctx.lineTo(16, 9);
      ctx.quadraticCurveTo(9, 18, 0, 15);
      ctx.quadraticCurveTo(-9, 18, -16, 9);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b7cedd';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#d6e8ef';
      ctx.fillRect(-19, -3, 38, 5);
      ctx.fillStyle = '#8fbed7';
      ctx.fillRect(-19, 1, 7, 5);
      ctx.fillRect(12, 1, 7, 5);
      ctx.strokeStyle = '#c5dce7';
      ctx.beginPath();
      ctx.moveTo(-10, 7);
      ctx.quadraticCurveTo(0, 13, 10, 7);
      ctx.stroke();
    }
    ctx.fillStyle = '#fff1d1';
    ctx.fillRect(-2, -20, 9, 3);
  }
  ctx.restore();
}
function weaponPose(origin) {
  const swing = game.room.melee.find(s => s.origin === origin);
  const face = swing ? swing.face : origin.face || 0,
    c = Math.cos(face),
    d = Math.sin(face),
    idle = {
      hx: origin.x + c * 14,
      hy: origin.y + d * 14 - 12,
      tx: origin.x + c * 38,
      ty: origin.y + d * 38 - 12
    },
    raised = {
      hx: origin.x + c * 10,
      hy: origin.y + d * 10 - 48,
      tx: origin.x + c * 12,
      ty: origin.y + d * 12 - 100
    },
    impact = {
      hx: origin.x + c * 24,
      hy: origin.y + d * 24 - 10,
      tx: origin.x + c * 76,
      ty: origin.y + d * 76 + 4
    };
  if (!swing) return idle;
  let a, b, t;
  if (swing.elapsed < PLAYER_ABILITIES.melee.windup) {
    a = idle;
    b = raised;
    t = swing.elapsed / PLAYER_ABILITIES.melee.windup;
  } else if (swing.elapsed < PLAYER_ABILITIES.melee.impact) {
    a = raised;
    b = impact;
    t = (swing.elapsed - PLAYER_ABILITIES.melee.windup) / (PLAYER_ABILITIES.melee.impact - PLAYER_ABILITIES.melee.windup);
  } else {
    a = impact;
    b = idle;
    t = (swing.elapsed - PLAYER_ABILITIES.melee.impact) / (PLAYER_ABILITIES.melee.cycle - PLAYER_ABILITIES.melee.impact);
  }
  t = clamp(t, 0, 1);
  return {
    hx: a.hx + (b.hx - a.hx) * t,
    hy: a.hy + (b.hy - a.hy) * t,
    tx: a.tx + (b.tx - a.tx) * t,
    ty: a.ty + (b.ty - a.ty) * t
  };
}
function downwardCash(origin, height = 0) {
  const p = weaponPose(origin),
    angle = Math.atan2(p.ty - p.hy, p.tx - p.hx),
    length = Math.hypot(p.tx - p.hx, p.ty - p.hy);
  ctx.save();
  ctx.translate(p.hx, p.hy - height);
  ctx.rotate(angle);
  const left = length - 30,
    width = 46;
  ctx.strokeStyle = '#e59b61';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(Math.max(0, left + 4), 2);
  ctx.stroke();
  ctx.lineCap = 'butt';
  for (let layer = 4; layer >= 1; layer--) {
    const y = -13 + layer * 2;
    ctx.fillStyle = layer % 2 ? '#dee9c3' : '#a7c080';
    ctx.fillRect(left, y, width, 26);
    ctx.strokeStyle = '#55724e';
    ctx.lineWidth = 1;
    ctx.strokeRect(left, y, width, 26);
  }
  ctx.fillStyle = '#c8dea4';
  ctx.fillRect(left, -13, width, 26);
  ctx.strokeStyle = '#3e6544';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(left, -13, width, 26);
  ctx.strokeRect(left + 3, -10, width - 6, 20);
  ellipse(left + 34, 0, 6, 8, '#99b77e');
  ctx.fillStyle = '#2e5b3d';
  ctx.font = 'bold 17px Georgia,serif';
  ctx.textAlign = 'center';
  ctx.fillText('$', left + 11, 6);
  ctx.fillStyle = '#ece0b3';
  ctx.fillRect(left + 20, -14, 8, 29);
  ctx.strokeStyle = '#b3a579';
  ctx.lineWidth = 1;
  ctx.strokeRect(left + 20, -14, 8, 29);
  ellipse(left + 3, 9, 6, 4, '#ffa45f');
  ctx.restore();
}
function drawMob(e, paint = ctx, chapter = game.chapter) {
  const ctx = paint,
    ellipse = (...args) => ellipseOn(ctx, ...args),
    text = (...args) => textOn(ctx, ...args);
  ctx.save();
  ctx.translate(e.x, e.y);
  ellipse(0, e.r * .65, e.r * .9, e.r * .35, '#0005');
  ctx.translate(0, Math.sin(e.age * 7) * 2);
  const color = e.flash > 0 ? '#fffbe2' : e.color;
  if (e.type === 'charger') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(24, 15);
    ctx.lineTo(-24, 15);
    ctx.fill();
    if (e.t < .5 && e.charge <= 0) {
      ctx.save();
      ctx.rotate(e.face);
      ctx.strokeStyle = '#ffc19e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(28, 0);
      ctx.lineTo(65, 0);
      ctx.moveTo(55, -8);
      ctx.lineTo(65, 0);
      ctx.lineTo(55, 8);
      ctx.stroke();
      ctx.restore();
    }
  } else if (e.type === 'turret') {
    ctx.fillStyle = '#685779';
    ctx.fillRect(-23, 5, 46, 13);
    ellipse(0, -4, 19, 19, color);
    ctx.save();
    ctx.rotate(e.face);
    ctx.fillStyle = '#e5cbfa';
    ctx.fillRect(0, -5, 29, 10);
    ctx.restore();
  } else {
    ellipse(0, -3, e.r, e.r, color);
    ctx.fillStyle = color;
    ctx.fillRect(-e.r, -21, 7, 16);
    ctx.fillRect(e.r - 7, -21, 7, 16);
    if (e.type === 'splitter') {
      ctx.strokeStyle = '#ad626d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-2, -20);
      ctx.lineTo(4, -7);
      ctx.lineTo(-5, 4);
      ctx.lineTo(2, 15);
      ctx.stroke();
    }
  }
  ellipse(-e.r * .36, -7, 4, 5, '#30253a');
  ellipse(e.r * .36, -7, 4, 5, '#30253a');
  if (chapter === 3 && e.type === 'shooter') {
    ctx.strokeStyle = '#dbc2e0';
    ctx.lineWidth = 3;
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(k * 12, -8);
      ctx.lineTo(k * 30, -18);
      ctx.stroke();
      ellipse(k * 30, -18, 12, 3, '#dbc2e0');
    }
  }
  if (e.type === 'shield' && e.broken <= 0) {
    ctx.strokeStyle = '#b1eef5';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, e.r + 5, e.face - 1.25, e.face + 1.25);
    ctx.stroke();
  }
  if (e.stun > 0) text('✧', 0, -e.r - 14, 21, '#fff0a3', 'center');
  if (e.slow > 0) text('↓ SLOWED', 0, -e.r - 24, 10, '#ffdf8d', 'center', true);
  if (e.mark > 0) text('✴ MARKED', 0, -e.r - 48, 10, '#ffb9ca', 'center', true);
  ctx.restore();
  if (e.hp < e.maxhp) {
    ctx.fillStyle = '#171725';
    ctx.fillRect(e.x - 18, e.y + e.r + 9, 36, 4);
    ctx.fillStyle = '#d9fb76';
    ctx.fillRect(e.x - 18, e.y + e.r + 9, 36 * Math.max(0, e.hp / e.maxhp), 4);
  }
}
function drawBoss() {
  const b = game.boss;
  if (!b || b.dead) return;
  ctx.save();
  if (b.flash > 0) {
    ctx.shadowColor = '#fff1bb';
    ctx.shadowBlur = 18;
  }
  person(b.x, b.y, ['biden', 'pooh', 'mojtaba'][game.chapter - 1], game.chapter === 2 ? 1.3 : 1.65);
  ctx.restore();
  if (b.grace > 0) text('GET READY', b.x, b.y - 90, 12, '#ffcc9f', 'center', true);
  if (b.slow > 0) text('↓ SLOWED', b.x, b.y + 55, 12, '#ffde8b', 'center');
  if (b.mark > 0) text('✴ MARKED', b.x, b.y - 82, 11, '#ffb9ca', 'center', true);
}
function draw() {
  const g = game,
    r = g.room,
    p = g.player,
    theme = g.theme;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = theme.floor;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let x = 32; x < W; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 78);
    ctx.lineTo(x, H - 28);
    ctx.stroke();
  }
  for (let y = 80; y < H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(28, y);
    ctx.lineTo(W - 28, y);
    ctx.stroke();
  }
  ctx.strokeStyle = '#a8ac8366';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 78, W - 56, H - 106);
  if (g.chapter === 2) for (const y of [152, 456]) {
    ctx.fillStyle = '#17231e';
    ctx.fillRect(45, y, 870, 48);
    ctx.strokeStyle = '#7d9578';
    ctx.lineWidth = 2;
    for (let x = 60; x < 900; x += 45) {
      const xx = x + g.time * 30 % 45 * (y < 300 ? 1 : -1);
      ctx.beginPath();
      ctx.moveTo(xx, y + 12);
      ctx.lineTo(xx + (y < 300 ? 12 : -12), y + 24);
      ctx.lineTo(xx, y + 36);
      ctx.stroke();
    }
  }
  for (const pool of r.puddles) {
    ellipse(pool.x, pool.y, pool.r, pool.r * .62, '#9c805075');
    text('SLOW', pool.x, pool.y + 4, 9, '#d8c69a', 'center');
  }
  const pickup = r.pickup;
  if (pickup && !pickup.used) {
    ctx.fillStyle = '#e5eddf';
    ctx.fillRect(pickup.x - 22, pickup.y - 22, 44, 36);
    ctx.fillStyle = '#699476';
    ctx.fillRect(pickup.x - 10, pickup.y - 27, 20, 5);
    ctx.fillStyle = '#d75f63';
    ctx.fillRect(pickup.x - 4, pickup.y - 15, 8, 22);
    ctx.fillRect(pickup.x - 11, pickup.y - 8, 22, 8);
    text('HEAL +' + PLAYER_ABILITIES.health.supplyHeal + ' / CONTINUE', pickup.x, pickup.y + 32, 12, '#e8f5db', 'center', true);
  }
  for (const z of r.fields) {
    ellipse(z.x, z.y, z.r, z.r, '#f7d77d17');
    ctx.strokeStyle = z.kind === 'settle' ? '#f7d782' : z.kind === 'pull' ? '#a6e5f0' : '#d9fb76';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    text((z.kind === 'settle' ? 'SETTLEMENT' : z.kind === 'pull' ? 'PULL' : 'SLOW ZONE') + ' ' + z.life.toFixed(1) + 's', z.x, z.y - z.r + 20, 11, '#ffe9ab', 'center', true);
  }
  for (const h of r.hazards) {
    ellipse(h.x, h.y, h.r, h.r, h.done ? '#ffb97566' : '#ff725020');
    ctx.strokeStyle = '#ffa07d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.r * (h.done ? 1 : clamp(1 - h.t / h.max, .05, 1)), 0, Math.PI * 2);
    ctx.stroke();
    if (!h.done) {
      text('!', h.x, h.y + 4, 11, '#ffe1a4', 'center', true);
    }
  }
  for (const s of r.shots) {
    const a = Math.atan2(s.vy, s.vx);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(a);
    ctx.strokeStyle = s.kind === 'shard' ? '#ffafc5' : s.kind === 'echo' ? '#9ff7d1' : s.kind === 'clone' ? '#d4b1ff' : '#fff0a5';
    ctx.lineWidth = 3;
    if (s.kind === 'shard') {
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
    } else for (const radius of [10, 17]) {
      ctx.beginPath();
      ctx.arc(-5, 0, radius, -.9, .9);
      ctx.stroke();
    }
    ctx.restore();
  }
  for (const c of r.clones) {
    ctx.save();
    ctx.globalAlpha = .4;
    person(c.x, c.y);
    downwardCash(c, 0);
    ctx.restore();
    text('CROSSFIRE ' + c.life.toFixed(1) + 's', c.x, c.y + 30, 10, '#d5bbff', 'center');
  }
  for (const e of r.mobs) if (e.hp > 0) drawMob(e);
  drawBoss();
  if (p.jump > 0) {
    ellipse(p.x, p.y, PLAYER_ABILITIES.landing.radius, PLAYER_ABILITIES.landing.radius, '#d9fb7615');
    ctx.strokeStyle = '#d9fb76aa';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, PLAYER_ABILITIES.landing.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  const jumpHeight = Math.sin(p.jump / PLAYER_ABILITIES.jump.duration * Math.PI) * 34;
  if (g.mode === 'reward' || p.inv <= 0 || Math.floor(p.inv * 14) % 2 === 0 || g.mode.startsWith('tutorial')) {
    person(p.x, p.y - jumpHeight);
    downwardCash(p, jumpHeight);
  }
  for (const s of r.swings) {
    ctx.save();
    ctx.globalAlpha = s.life / s.max;
    const x = s.x + Math.cos(s.face) * 70,
      y = s.y + Math.sin(s.face) * 70;
    ellipse(x, y, 27, 12, s.clone ? '#c9aaff35' : '#ffe79935');
    ctx.strokeStyle = s.clone ? '#d3b3ff' : '#ffefb5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 6);
    ctx.lineTo(x + 12, y + 6);
    ctx.moveTo(x - 12, y + 6);
    ctx.lineTo(x + 12, y - 6);
    ctx.stroke();
    ctx.restore();
  }
  for (const e of r.effects) {
    ctx.save();
    ctx.globalAlpha = e.life / e.max;
    if (e.splash) {
      for (let i = 0; i < 7; i++) {
        const a = i * Math.PI * 2 / 7,
          d = e.r * (1 - e.life / e.max);
        ellipse(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d, 2.5, 2, e.color);
      }
      ctx.restore();
      continue;
    }
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r * (1 - e.life / e.max), 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  for (const l of r.labels) {
    ctx.save();
    ctx.globalAlpha = clamp(l.life * 2, 0, 1);
    text(l.text, l.x, l.y, 12, l.color, 'center', true);
    ctx.restore();
  }
  drawJumpCharge();
  // Hostile projectiles stay visible above actors and combat effects, below the HUD.
  for (const b of r.bullets) {
    if (b.kind === 'urine') {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx));
      ellipse(0, 0, b.r, b.r * .7, '#f7d84d');
      ellipse(2, -2, b.r * .35, b.r * .22, '#fff4b0');
      ellipse(-b.r - 3, 0, 2, 2, '#e7c446');
      ctx.restore();
    } else if (b.kind === 'homingPoop') {
      ellipse(b.x, b.y + 5, b.r, b.r * .5, '#795039');
      ellipse(b.x - 2, b.y, b.r * .78, b.r * .6, '#966441');
      ellipse(b.x + 1, b.y - 6, b.r * .5, b.r * .45, '#ad7c50');
      ellipse(b.x + 2, b.y - 10, b.r * .22, b.r * .25, '#c29464');
    } else {
      ellipse(b.x, b.y, b.r + 3, b.r + 3, '#ff7e9725');
      ellipse(b.x, b.y, b.r, b.r, '#ff97b0');
      ellipse(b.x - 1, b.y - 1, 2, 2, '#ffe8dc');
    }
  }
  if (g.messageTime > 0 && g.mode === 'play') {
    ctx.fillStyle = '#14202ade';
    ctx.fillRect(180, 103, 600, 40);
    text(g.message, 480, 129, 15, theme.accent, 'center', true);
  }
  const prompt = g.prompt();
  if (prompt && ['play', 'reward'].includes(g.mode)) {
    ctx.fillStyle = '#142019ed';
    ctx.fillRect(215, 520, 530, 31);
    text(prompt, 480, 541, 14, '#e9ffc0', 'center', true);
  }
  if (g.mode === 'play' && !touchMove) {
    ctx.strokeStyle = '#f8e8baa0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 7, 0, Math.PI * 2);
    ctx.moveTo(pointer.x - 12, pointer.y);
    ctx.lineTo(pointer.x + 12, pointer.y);
    ctx.moveTo(pointer.x, pointer.y - 12);
    ctx.lineTo(pointer.x, pointer.y + 12);
    ctx.stroke();
  }
}
function drawJumpCharge() {
  if (!['play', 'tutorial', 'tutorialSuccess'].includes(game.mode)) return;
  const p = game.player;
  if (p.jumpCd <= 0 && jumpFlash <= 0) return;
  const x = p.x,
    y = p.y + 8,
    r = 23,
    progress = 1 - clamp(p.jumpCd / PLAYER_ABILITIES.jump.cooldown, 0, 1);
  ctx.save();
  ctx.strokeStyle = '#101b24dd';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = p.jumpCd > 0 ? '#e9edc5' : '#d9fb76';
  ctx.lineWidth = p.jumpCd > 0 ? 3 : 5;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  ctx.stroke();
  ctx.restore();
}
