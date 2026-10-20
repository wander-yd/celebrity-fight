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
  overlay.innerHTML = html;
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
  for (const id of ['jump']) document.getElementById(id).style.visibility = ['play', 'tutorial'].includes(game.mode) ? 'visible' : 'hidden';
  if (['play', 'tutorial', 'tutorialSuccess', 'reward', 'debug'].includes(game.mode)) {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    return;
  }
  if (game.mode === 'menu') {
    show('<div class="tag">3 ARENAS · ONE STACK OF DOLLARS</div><h2>The art of<br><em>the cash slap.</em></h2><p>Biden → xijinping → Mojtaba Khamenei<br>Swing your dollar stack. Jump to break shields. Land to activate your equipped items.<br>Clear each arena, then face its boss.<br>Surviving minions keep fighting after the boss falls.</p><button class="primary" id="start">START THE CAMPAIGN ↗</button><div class="hint">WASD MOVE · HOLD CLICK: MELEE · SPACE: JUMP<br>WALK INTO HEALTH KITS<br><br>TOUCH: DRAG + AUTO ATTACK · TAP JUMP</div>');
    button('start', () => game.start());
  } else if (game.mode === 'tutorialIntro') {
    show('<div class="tag">A SHORT SAFE LESSON · SKIPPABLE</div><h2>Break shields.<br><em>Then swing.</em></h2><p>Aim with your mouse. Hold left click for overhead cash-stack swings.<br><b>SPACE</b> Jump to avoid damage. Land nearby to stun and break shields.<br>Normal enemies are stunned for ' + PLAYER_ABILITIES.landing.stun + 's; shields break for ' + PLAYER_ABILITIES.landing.shieldBreak + 's.<br>Landing gives ' + PLAYER_ABILITIES.landing.protection + 's of damage protection.<br>Practice: land near the shield dummy, then hit it with your dollar stack.</p><button class="primary" id="practice">PRACTICE JUMP + SWING ↗</button><button class="small tutorials" id="skip">SKIP LESSON</button>');
    button('practice', () => game.practice());
    button('skip', () => game.skipLesson());
  } else if (game.mode === 'tutorialDone') {
    show('<div class="tag">SHIELD BROKEN · CASH SLAP LANDED ✓</div><h2>Use the<br><em>opening.</em></h2><p>Jump close → land to break shields → swing your dollar stack.<br>Bosses stagger briefly and resist repeated stuns.<br>After each Boss, walk into the health kit to heal and continue.<br>In chapter 3, red circles warn you before explosions.</p><button class="primary" id="lessonDone">ENTER THE ARENA ↗</button>');
    button('lessonDone', () => game.newRun());
  } else if (game.mode === 'paused') {
    show('<div class="tag">ARENA PAUSED</div><h2>Hold your <em>cash.</em></h2><p>Chapter ' + game.chapter + ' / 3 · Score ' + game.score + ' · ' + Math.floor(game.time) + ' seconds<br>WASD / arrows: move · Mouse: aim + hold click to swing<br>SPACE: jump · P / ESC: pause<br>Touch: drag to move + auto attack, tap JUMP<br>After a Boss, walk into the health kit to heal and choose an item.</p><div class="pause-build"><b>YOUR BUILD · DOLLAR STACK</b>' + buildDetails() + '</div><button class="primary" id="resume">RESUME ↗</button><div class="pause-settings"><button class="small" id="sound">' + (sound ? '♪ SOUND ON' : '♪ SOUND OFF') + '</button><button class="small" id="restart">↻ RESTART RUN</button></div>');
    button('resume', () => game.pause());
    button('restart', () => game.newRun());
    document.getElementById('sound').onclick = () => {
      sound = !sound;
      document.getElementById('sound').textContent = sound ? '♪ SOUND ON' : '♪ SOUND OFF';
      tone(500);
    };
  } else if (game.mode === 'upgrade') {
    show('<div class="tag">CHAPTER ' + game.chapter + ' CLEARED · ALL MINIONS CLEARED</div><h2>Build a<br><em>better bad idea.</em></h2><p>Health kit collected. Choose your next item.<br>Next: ' + THEMES[game.chapter].name + '</p><div class="choices">' + game.offer.map((u, i) => {
      const partner = game.items.find(id => synergy(id, u.id));
      return '<button class="choice" id="pick' + i + '"><span>' + u.icon + '</span><b>' + u.name + '</b><small>' + u.desc + '</small>' + (partner ? '<small class="synergy">SYNERGY WITH ' + ITEMS.find(x => x.id === partner).name + ': ' + synergy(partner, u.id) + '</small>' : '') + '</button>';
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
function hud() {
  const p = game.player;
  document.getElementById('debug-status').hidden = !game.debugInvincible;
  document.getElementById('health').style.color = heartFlash > 0 ? '#fff3dd' : '#ff957a';
  const equipped = game.items.map(id => ITEMS.find(u => u.id === id));
  document.getElementById('equipped').textContent = equipped.length ? equipped.map(u => u.icon).join('  ') : 'DOLLAR STACK';
  document.getElementById('equipped').title = equipped.map(u => u.name).join(', ');
  document.getElementById('health').textContent = game.debugInvincible ? '∞ HEARTS' : '♥ '.repeat(Math.max(0, p.hp)) + '♡ '.repeat(Math.max(0, p.maxhp - p.hp));
  document.getElementById('jumptext').textContent = p.jumpCd > 0 ? 'Jump ready in ' + p.jumpCd.toFixed(1) + ' seconds' : 'Jump ready';
  const jump = document.getElementById('jump');
  jump.textContent = p.jumpCd > 0 ? 'JUMP ' + p.jumpCd.toFixed(1) + 's' : 'JUMP';
  jump.style.opacity = p.jumpCd > 0 ? '.65' : '1';
  jump.setAttribute('aria-label', p.jumpCd > 0 ? 'Jump ready in ' + p.jumpCd.toFixed(1) + ' seconds' : 'Jump ready');
}
