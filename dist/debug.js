'use strict';

// A browser-local convenience lock, not account security. Change this value to set a new password.
const DEBUG_PASSWORD = 'voiddebug';
const VoidGuide = (() => {
  const enemies = {
    chaser: {
      name: 'Chaser',
      behavior: 'Follows you continuously and deals contact damage.'
    },
    charger: {
      name: 'Charger',
      behavior: 'Shows an arrow before rushing in a straight line.'
    },
    shooter: {
      name: 'Shooter',
      behavior: 'Approaches firing range, then sends aimed shots. Level 3 uses a drone variant.'
    },
    turret: {
      name: 'Spread Turret',
      behavior: 'Stays in place and fires a five-shot fan.'
    },
    shield: {
      name: 'Shield Guard',
      behavior: 'Faces you quickly and blocks attacks from the front.'
    },
    splitter: {
      name: 'Splitter',
      behavior: 'Chases you and splits into two fast, fragile offspring on death.'
    },
    mini: {
      name: 'Split Offspring',
      behavior: 'A fast one-HP enemy created by a defeated Splitter.'
    }
  };
  const bosses = [{
    kind: 'biden',
    attacks: 'Five urine droplets in a fan, plus one slow homing poop projectile. Hits leave no slowing pool.'
  }, {
    kind: 'pooh',
    attacks: 'A rotating 12-shot ring followed by three fast aimed shots.'
  }, {
    kind: 'mojtaba',
    attacks: 'Rotating bullet rings and a warned explosion at your position. Additional bombardments escalate at health thresholds. His bombs hurt you and minions, but not him.'
  }];
  function bossStats(chapter) {
    const g = new VoidArena.Arena(() => .5);
    g.chapter = chapter;
    g.setupChapter();
    g.createBoss();
    const b = g.boss;
    g.fireOriginalBoss(b, 0);
    const normal = {
      shots: g.room.bullets.length,
      interval: b.cd
    };
    g.room.bullets = [];
    b.hp = b.maxhp * .49;
    g.fireOriginalBoss(b, 0);
    return {
      hp: b.maxhp,
      speed: b.speed,
      normal,
      enraged: {
        shots: g.room.bullets.length,
        interval: b.cd
      }
    };
  }
  return {
    enemies,
    bosses,
    bossStats
  };
})();
function createDebugCodex({
  game,
  releaseInput,
  syncOverlay,
  hud,
  drawEnemy,
  drawPerson
}) {
  const {
    TYPES,
    THEMES,
    WAVES,
    ITEMS,
    PLAYER_ABILITIES,
    synergy
  } = VoidArena;
  const dialog = document.getElementById('debug-window'),
    body = document.getElementById('debug-body');
  let unlocked = false,
    opened = false,
    returnMode = 'menu',
    tab = 'debug';
  const tabs = [['debug', 'Debug'], ['controls', 'Controls'], ['player', 'Player'], ['enemies', 'Enemies · 7'], ['items', 'Items · 6'], ['bosses', 'Bosses · 3'], ['updates', 'Updates']];
  let controlOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  let cancelControlDrag = () => {};
  let controlButton = 'jump';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
  const bind = (id, fn) => document.getElementById(id).onclick = fn;
  const facts = pairs => '<dl class="codex-facts">' + pairs.map(([key, value]) => '<div><dt>' + escape(key) + '</dt><dd>' + escape(value) + '</dd></div>').join('') + '</dl>';
  const image = (kind, key, name) => '<canvas class="codex-art" width="140" height="120" data-guide-kind="' + kind + '" data-guide-key="' + key + '" role="img" aria-label="' + escape(name) + ' illustration"></canvas>';
  function paintArt() {
    for (const el of body.querySelectorAll('canvas[data-guide-kind]')) {
      const c = el.getContext('2d');
      c.clearRect(0, 0, 140, 120);
      if (el.dataset.guideKind === 'player') {
        drawPerson('trump', c);
      } else if (el.dataset.guideKind === 'boss') {
        drawPerson(VoidGuide.bosses[Number(el.dataset.guideKey)].kind, c);
      } else {
        const type = el.dataset.guideKey,
          cfg = TYPES[type];
        drawEnemy({
          ...cfg,
          type,
          x: 70,
          y: 66,
          maxhp: cfg.hp,
          age: 0,
          flash: 0,
          face: 0,
          t: 1,
          charge: 0,
          broken: 0,
          stun: 0,
          slow: 0
        }, c);
      }
    }
  }
  function debugPage() {
    return '<div class="debug-summary"><span><b>3</b> levels</span><span><b>7</b> enemy types</span><span><b>6</b> build items</span></div><section class="debug-toggle"><div><h3>Infinite hearts</h3></div><button type="button" id="debug-infinite" aria-pressed="' + game.debugInvincible + '" class="debug-switch">' + (game.debugInvincible ? 'ON' : 'OFF') + '</button></section><div class="debug-chapters">' + THEMES.map((theme, i) => '<article class="codex-card"><div class="codex-eyebrow">LEVEL 0' + (i + 1) + '</div><h3>' + theme.name + '</h3>' + facts([['Wave', WAVES[i].count + ' enemies'], ['Boss', theme.hp + ' HP']]) + '<div class="debug-actions"><button type="button" id="debug-wave-' + i + '">Start wave ↗</button><button type="button" id="debug-boss-' + i + '">Start Boss ↗</button></div></article>').join('') + '</div>';
  }
  const number = value => String(Number(value.toFixed(2)));
  const seconds = value => number(value) + 's';
  const ready = value => value <= 0 ? 'READY' : value.toFixed(2) + 's';
  const reduction = multiplier => Math.round((1 - multiplier) * 100) + '%';
  function playerPage() {
    const a = PLAYER_ABILITIES,
      p = game.player,
      equipped = ITEMS.filter(item => game.has(item.id)),
      pairs = [];
    for (let i = 0; i < equipped.length; i++) for (let j = i + 1; j < equipped.length; j++) {
      const link = synergy(equipped[i].id, equipped[j].id);
      if (link) pairs.push('<li><strong>' + equipped[i].name + ' + ' + equipped[j].name + '</strong> — ' + link + '</li>');
    }
    const card = (title, values) => '<article class="codex-card"><div class="codex-eyebrow">BASE ABILITY</div><h3>' + title + '</h3>' + facts(values) + '</article>';
    return '<div class="codex-player-top"><section class="codex-card"><div class="codex-cardhead">' + image('player', 'trump', 'Donald Trump') + '<div><div class="codex-eyebrow">PLAYER CHARACTER</div><h3>Donald Trump</h3><p>💵 Dollar Stack · overhead melee</p></div></div>' + facts([['Level', game.chapter + ' / ' + THEMES.length], ['Opponent', THEMES[game.chapter - 1].name], ['Base max hearts', a.health.max], ['Base ground speed', a.movement.speed + ' px/s']]) + '</section><section class="codex-card codex-current"><div class="codex-eyebrow">CURRENT STATUS · PAUSED SNAPSHOT</div><h3>Right now</h3>' + facts([['Hearts', p.hp + ' / ' + p.maxhp], ['State when opened', returnMode.replace(/([A-Z])/g, ' $1').toUpperCase()], ['Jump cooldown', ready(p.jumpCd)], ['Swing cooldown', ready(p.attackCd)], ['Airborne remaining', seconds(p.jump)], ['Timed protection', seconds(p.inv)], ['Infinite hearts', game.debugInvincible ? 'ON' : 'OFF']]) + '</section></div><div class="codex-grid">' + card('Dollar Stack', [['Damage', a.melee.damage], ['Base reach', a.melee.range + ' px'], ['Forward arc', Math.round(a.melee.arc * 180 / Math.PI) + '°'], ['Swing cycle', seconds(a.melee.cycle)], ['Hit after start', seconds(a.melee.impact)]]) + card('Movement & health', [['Ground speed', a.movement.speed + ' px/s'], ['Maximum hearts', a.health.max], ['Damage per hit', a.health.damagePerHit + ' heart'], ['Protection after hit', seconds(a.health.hurtProtection)], ['Health kit', a.health.supplyHeal + ' hearts']]) + card('Jump · SPACE', [['Airborne duration', seconds(a.jump.duration)], ['Cooldown', seconds(a.jump.cooldown)], ['Air movement', number(a.jump.speedMultiplier) + '× base speed'], ['Airborne damage', 'IMMUNE']]) + card('Landing impact', [['Damage', a.landing.damage], ['Base radius', a.landing.radius + ' px'], ['Normal stun', seconds(a.landing.stun)], ['Shield break', seconds(a.landing.shieldBreak)], ['Landing protection', seconds(a.landing.protection)]]) + card('Landing on a Boss', [['Damage', a.landing.damage], ['Stagger duration', seconds(a.landing.bossStagger)], ['Stagger resistance', seconds(a.landing.bossResistance)]]) + '</div><section class="codex-card codex-player-build"><div class="codex-eyebrow">CURRENT BUILD</div><h3>Equipped items · ' + equipped.length + '</h3>' + (equipped.length ? '<ul class="codex-equipped">' + equipped.map(item => '<li><strong>' + item.icon + ' ' + item.name + '</strong><span>' + item.desc + '</span></li>').join('') + '</ul>' : '<p>No items equipped. Collect a post-Boss health kit to open your next item choice.</p>') + '<div class="codex-counter"><b>YOUR SUPPORTED SYNERGIES</b>' + (pairs.length ? '<ul>' + pairs.join('') + '</ul>' : '<p>No supported pair equipped yet.</p>') + '</div></section>';
  }
  function enemiesPage() {
    return '<div class="codex-grid">' + Object.entries(TYPES).map(([id, type]) => {
      const entry = VoidGuide.enemies[id];
      const chapters = WAVES.flatMap((wave, i) => wave.roster.includes(id) ? [i + 1] : []);
      return '<article class="codex-card"><div class="codex-cardhead">' + image('enemy', id, entry.name) + '<div><div class="codex-eyebrow">' + (id === 'mini' ? 'SPAWNED BY SPLITTERS' : 'LEVELS ' + chapters.join(' / ')) + '</div><h3>' + entry.name + '</h3></div></div>' + facts([['HP', type.hp], ['Move', type.speed + ' px/s']]) + '<p>' + entry.behavior + '</p></article>';
    }).join('') + '</div>';
  }
  function itemsPage() {
    return '<div class="codex-basics"><b>SPACE · JUMP</b><span>Avoid damage in the air. Landing stuns normal enemies, breaks shields, grants ' + PLAYER_ABILITIES.landing.protection + 's protection without pushing the player out of overlapping enemies.</span><b>LANDING ITEMS</b><span>Each item works alone. Seizure Order pulls for ' + PLAYER_ABILITIES.items.pullDuration + 's. Final Settlement detonates after ' + PLAYER_ABILITIES.items.settleDuration + 's for ' + PLAYER_ABILITIES.items.settleBase + ' to ' + (PLAYER_ABILITIES.items.settleBase + PLAYER_ABILITIES.items.settleBonusCap) + ' damage. Default Cascade marks landing targets for ' + PLAYER_ABILITIES.items.markDuration + 's.</span><b>LANDING CLAUSE</b><span>' + PLAYER_ABILITIES.landingZone.duration + 's slowing zone: ' + reduction(PLAYER_ABILITIES.landingZone.normalMoveMultiplier) + ' slower normal movement, ' + Math.round((PLAYER_ABILITIES.landingZone.normalAttackIntervalMultiplier - 1) * 100) + '% longer normal attack intervals, ' + reduction(PLAYER_ABILITIES.landingZone.bossMoveMultiplier) + ' slower Boss movement. Slow lingers ' + PLAYER_ABILITIES.landingZone.linger + 's; Boss firing is unchanged. Overlapping slows and pulls do not stack.</span></div><div class="codex-grid">' + ITEMS.map(item => {
      const partners = ITEMS.filter(other => synergy(item.id, other.id));
      return '<article class="codex-card"><div class="codex-cardhead"><span class="codex-itemart" aria-hidden="true">' + item.icon + '</span><div><div class="codex-eyebrow">' + (game.has(item.id) ? 'IN YOUR BUILD' : 'BUILD ITEM') + '</div><h3>' + item.name + '</h3></div></div><p>' + item.desc + '</p><div class="codex-counter"><b>SUPPORTED SYNERGIES</b><ul>' + partners.map(other => '<li><strong>' + other.name + '</strong> — ' + synergy(item.id, other.id) + '</li>').join('') + '</ul></div></article>';
    }).join('') + '</div>';
  }
  function bossesPage() {
    return '<div class="codex-grid">' + THEMES.map((theme, i) => {
      const entry = VoidGuide.bosses[i],
        stats = VoidGuide.bossStats(i + 1);
      return '<article class="codex-card"><div class="codex-cardhead">' + image('boss', i, theme.name) + '<div><div class="codex-eyebrow">LEVEL 0' + (i + 1) + '</div><h3>' + theme.name + '</h3></div></div>' + facts([['HP', stats.hp], ['Move', stats.speed + ' px/s'], ['Volley', stats.normal.shots + ' → ' + stats.enraged.shots + ' shots'], ['Interval', stats.normal.interval + 's → ' + stats.enraged.interval + 's']]) + '<p>' + entry.attacks + '</p></article>';
    }).join('') + '</div>';
  }
  function updatesPage() {
    return '<section class="codex-card update-current"><div class="codex-eyebrow">LOADED VERSION</div><h3>' + escape(VoidReleases.displayVersion) + '</h3><span>Build ' + VoidReleases.currentVersion + '</span></section><div class="update-history">' + VoidReleases.entries.map(entry => '<article class="codex-card"><div class="codex-eyebrow">' + (entry.displayVersion ? escape(entry.displayVersion) + ' · Build ' + entry.version : 'v' + entry.version) + ' · ' + escape(entry.date) + ' · ' + escape(entry.type) + (entry.version === VoidReleases.currentVersion ? ' · CURRENT' : '') + '</div><h3>' + escape(entry.title) + '</h3><ul>' + entry.changes.map(change => '<li>' + escape(change) + '</li>').join('') + '</ul><p class="update-verification">' + escape(entry.verification) + '</p></article>').join('') + '</div>';
  }
  function controlsPage() {
    return '<section class="control-editor"><p>Drag ATTACK or JUMP. Each orientation saves on this browser.</p><div class="control-profiles"><button type="button" id="controls-portrait">Portrait</button><button type="button" id="controls-landscape">Landscape</button></div><div class="control-profiles"><button type="button" id="controls-edit-jump">Jump</button><button type="button" id="controls-edit-attack">Attack</button></div><div class="control-workspace"><div id="controls-preview" class="controls-preview" aria-label="Touch layout preview"><span>Move: touch anywhere on the left</span><button type="button" id="controls-preview-jump" class="control-jump" aria-label="Drag Jump position">JUMP</button><button type="button" id="controls-preview-attack" class="control-jump" aria-label="Drag Attack position">ATTACK</button></div><div class="control-settings"><div class="control-fields"><label for="controls-x">Horizontal <output id="controls-x-value"></output></label><input type="range" id="controls-x" min="55" max="95" step="1"><label for="controls-height">Height from bottom <output id="controls-height-value"></output></label><input type="range" id="controls-height" min="12" max="65" step="1"><label for="controls-size">Size <output id="controls-size-value"></output></label><input type="range" id="controls-size" min="64" max="112" step="2"></div><div class="debug-actions"><button type="button" id="controls-reset">Reset</button><button type="button" id="controls-copy">Copy config</button></div><p id="controls-status" role="status" aria-live="polite"></p><textarea id="controls-export" aria-label="Touch controls config" readonly hidden rows="8"></textarea></div></div></section>';
  }
  function updateControls(status) {
    if (!opened || !unlocked || tab !== 'controls') return;
    const profile = touchLayout.get()[controlOrientation];
    const selected = controlButton === 'attack' ? profile.attack : profile;
    const w = window.visualViewport?.width || window.innerWidth,
      h = window.visualViewport?.height || window.innerHeight;
    const same = (w > h ? 'landscape' : 'portrait') === controlOrientation;
    const width = same ? w : h,
      height = same ? h : w;
    const preview = document.getElementById('controls-preview');
    preview.style.aspectRatio = width + ' / ' + height;
    preview.style.maxWidth = controlOrientation === 'portrait' ? '220px' : '640px';
    const safe = same ? controlSafeBounds() : undefined;
    const placed = VoidTouchLayout.layout(profile, width, height, safe);
    for (const id of ['jump', 'attack']) {
      const button = document.getElementById('controls-preview-' + id), p = placed[id];
      button.style.left = p.x / width * 100 + '%';
      button.style.top = p.y / height * 100 + '%';
      button.style.width = p.size / width * 100 + '%';
      button.style.height = p.size / height * 100 + '%';
      button.style.fontSize = Math.max(5, Math.min(10, p.size / width * preview.getBoundingClientRect().width / 5)) + 'px';
      document.getElementById('controls-edit-' + id).setAttribute('aria-pressed', String(controlButton === id));
    }
    for (const key of ['portrait', 'landscape']) document.getElementById('controls-' + key).setAttribute('aria-pressed', String(controlOrientation === key));
    for (const [id, value, unit] of [['x', Math.round(selected.x * 100), '%'], ['height', Math.round((1 - selected.y) * 100), '%'], ['size', selected.size, 'px']]) {
      document.getElementById('controls-' + id).value = value;
      document.getElementById('controls-' + id + '-value').textContent = value + unit;
    }
    document.getElementById('controls-export').value = touchLayout.export();
    if (status) document.getElementById('controls-status').textContent = status;
  }
  function bindControls() {
    const edited = patch => {
      const saved = touchLayout.update(controlOrientation, patch, controlButton);
      release();
      applyTouchLayout();
      updateControls(saved ? 'Saved on this browser.' : 'Temporary only: browser storage unavailable.');
    };
    for (const key of ['portrait', 'landscape']) bind('controls-' + key, () => {
      cancelControlDrag();
      controlOrientation = key;
      updateControls();
    });
    for (const id of ['x', 'height', 'size']) document.getElementById('controls-' + id).oninput = e => {
      const value = Number(e.target.value);
      edited(id === 'x' ? {
        x: value / 100
      } : id === 'height' ? {
        y: 1 - value / 100
      } : {
        size: value
      });
    };
    const preview = document.getElementById('controls-preview');
    let drag = null;
    cancelControlDrag = () => { drag = null; };
    for (const id of ['jump', 'attack']) {
      bind('controls-edit-' + id, () => { cancelControlDrag(); controlButton = id; updateControls(); });
      const button = document.getElementById('controls-preview-' + id);
      button.onpointerdown = e => {
        if (drag || e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        controlButton = id;
        updateControls();
        const rect = preview.getBoundingClientRect();
        drag = { id: e.pointerId, control: id,
          x: (e.clientX - rect.left) / rect.width - parseFloat(button.style.left) / 100,
          y: (e.clientY - rect.top) / rect.height - parseFloat(button.style.top) / 100 };
        button.setPointerCapture(e.pointerId);
      };
      button.onpointermove = e => {
        if (!drag || e.pointerId !== drag.id || drag.control !== id) return;
        e.preventDefault();
        const rect = preview.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - drag.x,
          y = (e.clientY - rect.top) / rect.height - drag.y;
        const w = window.visualViewport?.width || window.innerWidth,
          h = window.visualViewport?.height || window.innerHeight;
        const safe = (w > h ? 'landscape' : 'portrait') === controlOrientation ? controlSafeBounds() : undefined;
        edited(safe ? { x: (x * w - safe.left) / safe.width, y: (y * h - safe.top) / safe.height } : { x, y });
      };
      const end = e => { if (drag?.id === e.pointerId) drag = null; };
      button.onpointerup = end;
      button.onpointercancel = end;
      button.onlostpointercapture = end;
    }
    bind('controls-reset', () => {
      cancelControlDrag();
      const saved = touchLayout.reset(controlOrientation);
      applyTouchLayout();
      updateControls(saved ? 'Reset and saved on this browser.' : 'Reset for this session; browser storage unavailable.');
    });
    bind('controls-copy', async () => {
      const text = touchLayout.export(),
        field = document.getElementById('controls-export');
      field.value = text;
      field.hidden = false;
      try {
        await window.navigator.clipboard.writeText(text);
        if (opened && tab === 'controls') document.getElementById('controls-status').textContent = 'Config copied.';
      } catch (_) {
        if (opened && tab === 'controls' && document.getElementById('controls-export') === field) {
          field.focus();
          field.select?.();
          document.getElementById('controls-status').textContent = 'Select and copy the config below.';
        }
      }
    });
    updateControls('Changes apply locally; close this window to playtest.');
  }
  function render(focusId) {
    dialog.dataset.tab = unlocked ? tab : 'locked';
    if (!unlocked) {
      body.innerHTML = '<div class="debug-lock"><div class="codex-eyebrow">LOCAL DEBUG ACCESS</div><h3>Unlock the test bench.</h3><p>Enter the debug password. The window pauses combat while you browse.</p><form id="debug-unlock-form"><label for="debug-password">Password</label><div class="debug-passwordrow"><input id="debug-password" type="password" autocomplete="off" maxlength="64" required><button type="submit">Unlock ↗</button></div><p id="debug-error" role="alert" aria-live="polite"></p></form><p class="codex-note">Browser-local convenience lock. Unlock lasts until this page reloads.</p></div>';
      document.getElementById('debug-unlock-form').onsubmit = e => {
        e.preventDefault();
        const input = document.getElementById('debug-password');
        if (input.value === DEBUG_PASSWORD) {
          input.value = '';
          unlocked = true;
          render();
        } else {
          document.getElementById('debug-error').textContent = 'Incorrect password. Try again.';
          input.value = '';
          input.focus();
        }
      };
      document.getElementById('debug-password').focus();
      return;
    }
    body.innerHTML = '<nav class="codex-nav" aria-label="Debug and guide sections">' + tabs.map(([id, title]) => '<button type="button" id="debug-tab-' + id + '" aria-pressed="' + (tab === id) + '">' + title + '</button>').join('') + '</nav><div class="codex-content">' + {
      debug: debugPage,
      controls: controlsPage,
      player: playerPage,
      enemies: enemiesPage,
      items: itemsPage,
      bosses: bossesPage,
      updates: updatesPage
    }[tab]() + '</div>';
    for (const [id] of tabs) bind('debug-tab-' + id, () => {
      tab = id;
      render();
    });
    if (tab === 'debug') {
      bind('debug-infinite', () => {
        game.setDebugInvincible(!game.debugInvincible);
        hud();
        render('debug-infinite');
      });
      for (let i = 0; i < THEMES.length; i++) {
        bind('debug-wave-' + i, () => jump(i + 1, false));
        bind('debug-boss-' + i, () => jump(i + 1, true));
      }
    }
    if (tab === 'controls') bindControls();
    paintArt();
    document.getElementById(focusId || 'debug-tab-' + tab).focus();
  }
  function open() {
    if (opened) return;
    returnMode = game.mode;
    releaseInput();
    game.mode = 'debug';
    opened = true;
    syncOverlay();
    dialog.showModal();
    render();
  }
  function close() {
    if (!opened) return;
    opened = false;
    cancelControlDrag();
    releaseInput();
    game.mode = returnMode;
    dialog.close();
    syncOverlay();
    hud();
    document.getElementById('debug-open').focus();
  }
  function jump(chapter, bossFight) {
    if (!opened || !unlocked) return false;
    if (!game.debugJump(chapter, bossFight)) return false;
    returnMode = 'play';
    close();
    return true;
  }
  bind('debug-open', open);
  bind('debug-close', close);
  dialog.addEventListener('cancel', e => {
    e.preventDefault();
    close();
  });
  dialog.addEventListener('close', () => {
    if (opened) close();
  });
  window.addEventListener('resize', () => {
    cancelControlDrag();
    updateControls();
  });
  return {
    open,
    close,
    isOpen: () => opened
  };
}
