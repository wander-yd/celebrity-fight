'use strict';

// Menus, HUD text and audio; no simulation rules live here.
function tone(f = 250, d = .07, type = 'triangle', v = .025) {
  if (!sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const o = audio.createOscillator(),
      gain = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, f / 2), audio.currentTime + d);
    gain.gain.setValueAtTime(v, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + d);
    o.connect(gain);
    gain.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + d);
  } catch (e) {}
}
function show(html) {
  overlay.dataset.mode = game.mode;
  overlay.innerHTML = html + '<div class="overlay-tools"><button type="button" class="small" id="overlay-view">' + (document.body.classList.contains('play-mode') ? 'PAGE VIEW' : 'PLAY MODE') + '</button><button type="button" class="small" id="menu-codex">DEBUG / CODEX</button></div>';
  document.getElementById('overlay-view').onclick = () => setPlayMode(!document.body.classList.contains('play-mode'));
  document.getElementById('menu-codex').onclick = () => debugPanel.open();
  overlay.classList.remove('hidden');
}
function button(id, fn) {
  document.getElementById(id).onclick = () => {
    release();
    fn();
    canvas.focus();
    syncOverlay();
  };
}
function syncOverlay() {
  if (lastMode === game.mode) return;
  lastMode = game.mode;
  frameClock.reset();
  updateTutorialInstruction();
  fitPlayMode();
  for (const id of ['jump']) document.getElementById(id).style.visibility = ['play', 'tutorial'].includes(game.mode) ? 'visible' : 'hidden';
  if (['play', 'tutorial', 'tutorialSuccess', 'reward', 'debug'].includes(game.mode)) {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    return;
  }
  if (game.mode === 'menu') {
    show('<div class="tag">3 ARENAS · ONE STACK OF DOLLARS</div><h2>The art of<br><em>the cash slap.</em></h2><p>Biden → xijinping → Mojtaba Khamenei<br>Swing your dollar stack. Jump to break shields. Land to activate your equipped items.<br>Clear each arena, then face its boss.<br>Surviving minions keep fighting after the boss falls.</p><button class="primary" id="start">START THE CAMPAIGN ↗</button><div class="hint">WASD MOVE · HOLD CLICK: MELEE · SPACE: JUMP<br>WALK INTO HEALTH KITS<br><br>TOUCH: DRAG + AUTO ATTACK · TAP JUMP</div>');
    button('start', () => {
      setPlayMode(true);
      game.start();
    });
  } else if (game.mode === 'tutorialIntro') {
    show('<div class="tag">A SHORT SAFE LESSON · SKIPPABLE</div><h2>Break shields.<br><em>Then swing.</em></h2><p>Aim with your mouse. Hold left click for overhead cash-stack swings.<br><b>SPACE</b> Jump to avoid damage. Land nearby to stun and break shields.<br>Normal enemies are stunned for ' + PLAYER_ABILITIES.landing.stun + 's; shields break for ' + PLAYER_ABILITIES.landing.shieldBreak + 's.<br>Landing gives ' + PLAYER_ABILITIES.landing.protection + 's of damage protection.<br>Practice: land near the shield dummy, then hit it with your dollar stack.</p><button class="primary" id="practice">PRACTICE JUMP + SWING ↗</button><button class="small tutorials" id="skip">SKIP LESSON</button>');
    button('practice', () => game.practice());
    button('skip', () => game.skipLesson());
  } else if (game.mode === 'tutorialDone') {
    show('<div class="tag">SHIELD BROKEN · CASH SLAP LANDED ✓</div><h2>Use the<br><em>opening.</em></h2><p>Jump close → land to break shields → swing your dollar stack.<br>Bosses stagger briefly and resist repeated stuns.<br>After each Boss, walk into the health kit to heal and continue.<br>In chapter 3, red circles warn you before explosions.</p><button class="primary" id="lessonDone">ENTER THE ARENA ↗</button>');
    button('lessonDone', () => game.newRun());
  } else if (game.mode === 'paused') {
    show('<div class="pause-primary"><div class="tag">ARENA PAUSED</div><button class="primary" id="resume">RESUME ↗</button></div><p class="pause-summary">Chapter ' + game.chapter + ' / 3 · Score ' + game.score + ' · ' + Math.floor(game.time) + ' seconds</p><details class="pause-section" id="pause-controls"><summary>Controls &amp; help</summary><p>WASD / arrows: move<br>Mouse: aim + hold click to swing<br>SPACE: jump · P / ESC: pause<br>Touch: drag to move + auto attack, tap JUMP<br>After a Boss, walk into the health kit to heal and choose an item.</p><p class="landscape-tip">On a phone, landscape gives you a larger arena.</p></details><details class="pause-section" id="pause-build"><summary>Your build · ' + game.items.length + ' items</summary><div class="pause-build"><b>YOUR BUILD · DOLLAR STACK</b>' + buildDetails() + '</div></details><div class="pause-settings"><button class="small" id="sound">' + (sound ? '♪ SOUND ON' : '♪ SOUND OFF') + '</button><button class="small" id="restart">↻ RESTART RUN</button></div>');
    button('resume', () => game.pause());
    button('restart', () => game.newRun());
    document.getElementById('resume').focus();
    document.getElementById('sound').onclick = () => {
      sound = !sound;
      document.getElementById('sound').textContent = sound ? '♪ SOUND ON' : '♪ SOUND OFF';
      tone(500);
    };
  } else if (game.mode === 'upgrade') {
    show('<div class="tag">CHAPTER ' + game.chapter + ' CLEARED · ALL MINIONS CLEARED</div><h2>Build a<br><em>better bad idea.</em></h2><p>Health kit collected. Choose your next item.<br>Next: ' + THEMES[game.chapter].name + '</p><div class="choices">' + game.offer.map((u, i) => {
      const partner = game.items.find(id => synergy(id, u.id));
      return '<button class="choice" id="pick' + i + '"><span>' + u.icon + '</span><b>' + u.name + '</b><small class="choice-action">' + itemAction(u.id) + '</small><small class="choice-detail">' + u.desc + '</small>' + (partner ? '<small class="synergy">SYNERGY WITH ' + ITEMS.find(x => x.id === partner).name + ': ' + synergy(partner, u.id) + '</small>' : '') + '</button>';
    }).join('') + '</div>');
    if (game.offer.length === 0) {
      show('<div class="tag">ALL ITEMS COLLECTED</div><h2>Build complete.</h2><p>Health kit collected. Continue to ' + THEMES[game.chapter].name + '.</p><button class="primary" id="buildContinue">NEXT CHAPTER ↗</button>');
      button('buildContinue', () => game.takeOffer(0));
    } else game.offer.forEach((_, i) => button('pick' + i, () => game.takeOffer(i)));
  } else if (['dead', 'win'].includes(game.mode)) {
    const win = game.mode === 'win';
    show('<div class="tag">' + (win ? 'THREE BOSSES. NO LOOSE ENDS.' : 'CAMPAIGN ENDED') + '</div><h2>' + (win ? 'Victory.<br><em>At what cost?</em>' : 'Dropped<br><em>the cash.</em>') + '</h2><p>' + (win ? 'All three bosses and their surviving minions are defeated.' : 'Keep moving. Mind your melee range. Jump to break shields and trigger your landing items.') + '<br>Score ' + game.score + ' · ' + Math.floor(game.time) + ' seconds</p><button class="primary" id="again">RUN IT BACK ↗</button>');
    button('again', () => game.newRun());
  }
}
function buildDetails() {
  return '<p class="builddesc">Aim with your mouse. Hold click to swing. Jump and land to break shields.</p>' + game.items.map(id => {
    const u = ITEMS.find(u => u.id === id);
    return '<div class="pause-item"><b>' + u.icon + ' ' + u.name + '</b><p>' + u.desc + '</p></div>';
  }).join('') + (game.items.length === 2 && synergy(...game.items) ? '<p class="buildsynergy">SYNERGY: ' + synergy(...game.items) + '</p>' : '') + (game.items.length ? '' : '<p>No items equipped yet.</p>');
}
function setHudText(id, value) {
  const el = document.getElementById(id);
  if (el.textContent !== value) el.textContent = value;
}
function hud() {
  const p = game.player,
    boss = game.boss;
  document.getElementById('debug-status').hidden = !game.debugInvincible;
  document.getElementById('health').style.color = heartFlash > 0 ? '#fff3dd' : '#ff957a';
  const equipped = game.items.map(id => ITEMS.find(u => u.id === id));
  setHudText('equipped', equipped.length ? equipped.map(u => u.icon).join('  ') : 'DOLLAR STACK');
  document.getElementById('equipped').title = equipped.map(u => u.name).join(', ');
  setHudText('health', game.debugInvincible ? '∞ HEARTS' : '♥ '.repeat(Math.max(0, p.hp)) + '♡ '.repeat(Math.max(0, p.maxhp - p.hp)));
  setHudText('chapter-label', '0' + game.chapter + ' / ' + game.theme.name);
  setHudText('wave-label', game.mode === 'reward' ? 'ARENA CLEAR' : boss ? 'MINIONS ' + game.remaining() : 'WAVE ' + game.spawned + ' / ' + game.waveTotal);
  setHudText('boss-label', game.mode === 'reward' ? 'Collect health → choose an item → next arena' : boss ? boss.dead ? 'BOSS DOWN · ENEMIES LEFT: ' + game.remaining() : boss.name + (boss.hp < boss.maxhp * .5 ? ' / ENRAGED' : '') : 'CLEAR THE WAVE TO FACE THE BOSS');
  const meter = document.getElementById('boss-meter'),
    percent = boss ? Math.max(0, boss.hp / boss.maxhp * 100) : 0;
  meter.hidden = !boss || boss.dead;
  meter.setAttribute('aria-valuenow', String(Math.round(percent)));
  document.getElementById('boss-fill').style.width = percent + '%';
  document.getElementById('boss-fill').style.background = game.theme.accent;
  setHudText('jumptext', p.jumpCd > 0 ? 'Jump ready in ' + p.jumpCd.toFixed(1) + ' seconds' : 'Jump ready');
  const jump = document.getElementById('jump');
  if (jump.textContent !== (p.jumpCd > 0 ? 'JUMP ' + p.jumpCd.toFixed(1) + 's' : 'JUMP')) jump.textContent = p.jumpCd > 0 ? 'JUMP ' + p.jumpCd.toFixed(1) + 's' : 'JUMP';
  jump.style.opacity = p.jumpCd > 0 ? '.65' : '1';
  jump.setAttribute('aria-label', p.jumpCd > 0 ? 'Jump ready in ' + p.jumpCd.toFixed(1) + ' seconds' : 'Jump ready');
  updateJumpCaption();
  updateTutorialInstruction();
}
function itemAction(id) {
  return {
    pull: 'Land → pull enemies together',
    settle: 'Land → hit inside → explosion',
    bounce: 'Swing → echo into another enemy',
    clone: 'Jump → leave a fighting clone',
    landing: 'Land → leave a slowing zone',
    chain: 'Land → mark enemies → death shards'
  }[id];
}
function playStageSize(viewWidth, viewHeight, toolbarHeight, footerHeight) {
  const contentWidth = Math.max(0, Math.min(viewWidth - 18, (viewHeight - toolbarHeight - footerHeight - 18) * W / 528));
  return {
    width: contentWidth + 2,
    height: toolbarHeight + footerHeight + contentWidth * 528 / W + 2
  };
}
function fitPlayMode() {
  const stage = document.getElementById('game-stage');
  if (!document.body.classList.contains('play-mode')) {
    stage.style.width = '';
    return;
  }
  const width = window.visualViewport?.width || window.innerWidth || W;
  const height = window.visualViewport?.height || window.innerHeight || H;
  // Measure again after width changes in case the responsive toolbar wrapped.
  for (let pass = 0; pass < 2; pass++) {
    const size = playStageSize(width, height, document.getElementById('arena-toolbar').offsetHeight, document.getElementById('boss-panel').offsetHeight);
    stage.style.width = size.width + 'px';
  }
}
function setPlayMode(enabled) {
  release();
  document.body.classList.toggle('play-mode', !!enabled);
  document.getElementById('play-mode').setAttribute('aria-pressed', String(!!enabled));
  document.getElementById('play-mode').setAttribute('aria-label', enabled ? 'Return to Page view' : 'Enter Play mode');
  const view = document.getElementById('overlay-view');
  if (view) view.textContent = enabled ? 'PAGE VIEW' : 'PLAY MODE';
  frameClock.reset();
  fitPlayMode();
  if (['play', 'tutorial', 'reward'].includes(game.mode)) canvas.focus();
}
function updateJumpCaption() {
  const caption = document.getElementById('jump-caption'),
    p = game.player;
  caption.hidden = !['play', 'tutorial', 'tutorialSuccess'].includes(game.mode) || p.jumpCd <= 0;
  if (caption.hidden) return;
  const bounds = document.getElementById('arena-viewport').getBoundingClientRect(),
    scale = bounds.width / W;
  setHudText('jump-caption', 'JUMP ' + p.jumpCd.toFixed(1) + 's');
  caption.style.left = clamp(p.x * scale, 46, Math.max(46, bounds.width - 46)) + 'px';
  caption.style.top = clamp((p.y - 72) * scale + 28, 12, Math.max(12, bounds.height - 26)) + 'px';
}
function updateTutorialInstruction() {
  const el = document.getElementById('arena-instruction'),
    tutorial = ['tutorial', 'tutorialSuccess'].includes(game.mode);
  const changed = el.hidden === tutorial;
  el.hidden = !tutorial;
  if (tutorial) setHudText('arena-instruction', game.mode === 'tutorialSuccess' ? 'HIT! Jump → break shield → swing.' : game.lessonStage === 'attack' ? 'Shield broken! Aim at the dummy and hold left click.' : 'Press SPACE / JUMP and land close to the shield dummy.');
  if (changed) fitPlayMode();
}
