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
function uiIcon(name) {
  const paths = {
    "play": "<path d=\"M8 5v14l11-7z\" fill=\"currentColor\" stroke=\"none\"/>",
    "pause": "<path d=\"M8 5v14M16 5v14\" stroke-width=\"4\"/>",
    "volume": "<path d=\"M11 5 6 9H3v6h3l5 4z\"/><path d=\"M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14\"/>",
    "mute": "<path d=\"M11 5 6 9H3v6h3l5 4z\"/><path d=\"m16 9 6 6m0-6-6 6\"/>",
    "close": "<path d=\"m6 6 12 12M18 6 6 18\"/>",
    "restart": "<path d=\"M3 10a9 9 0 1 1 1 8M3 4v6h6\"/>"
  };
  return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths[name] + '</svg>';
}
function updateSoundButton() {
  const control = document.getElementById('sound');
  control.innerHTML = uiIcon(sound ? 'volume' : 'mute');
  control.setAttribute('aria-label', sound ? 'Mute sound' : 'Unmute sound');
  control.setAttribute('title', sound ? 'Mute sound' : 'Unmute sound');
  control.setAttribute('aria-pressed', String(sound));
}
function show(html) {
  overlay.dataset.mode = game.mode;
  overlay.innerHTML = html + '<div class="overlay-tools"><button type="button" class="small" id="menu-codex">DEBUG / CODEX</button></div>';
  document.getElementById('menu-codex').onclick = () => debugPanel.open();
  overlay.classList.remove('hidden');
  updateControlHints();
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
  fitArena();
  release();
  syncTouchControls();
  if (['play', 'bossPractice', 'tutorial', 'tutorialSuccess', 'reward', 'debug'].includes(game.mode)) {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    return;
  }
  if (game.mode === 'menu') {
    show('<h2>THE DONALD</h2><button class="primary" id="start" aria-label="Start game" title="Start game">START</button><div class="hint" id="control-hint"></div>');
    button('start', () => {
      game.start();
    });
  } else if (game.mode === 'tutorialIntro') {
    show('<h2>Jump. Land. Swing.</h2><p>Jump near the shield → land → swing.</p><button class="primary" id="practice">PRACTICE</button><button class="small tutorials" id="skip">SKIP</button>');
    button('practice', () => game.practice());
    button('skip', () => game.skipLesson());
  } else if (game.mode === 'tutorialDone') {
    show('<h2>Practice complete</h2><button class="primary icon-button" id="lessonDone" aria-label="Play" title="Play">' + uiIcon('play') + '</button>');
    button('lessonDone', () => game.newRun());
  } else if (game.mode === 'paused') {
    show('<div class="pause-primary"><div class="tag">ARENA PAUSED</div><button class="primary" id="resume" aria-label="Resume" title="Resume">RESUME</button></div><p class="pause-summary">Level ' + game.chapter + ' / 3 · Score ' + game.score + ' · ' + Math.floor(game.time) + ' seconds</p><details class="pause-section" id="pause-controls"><summary>Controls &amp; help</summary><p id="controls-help-text"></p></details><details class="pause-section" id="pause-build"><summary>Your build · ' + game.items.length + ' items</summary><div class="pause-build"><b>YOUR BUILD · DOLLAR STACK</b>' + buildDetails() + '</div></details><div class="pause-settings"><button class="small icon-button" id="sound" aria-label="Mute sound" title="Mute sound"></button><button class="small restart-button" id="restart" aria-label="Restart run" title="Restart run">' + uiIcon('restart') + ' RESTART</button></div>');
    button('resume', () => game.pause());
    button('restart', () => game.newRun());
    document.getElementById('resume').focus();
    updateSoundButton();
    document.getElementById('sound').onclick = () => {
      sound = !sound;
      updateSoundButton();
      tone(500);
    };
  } else if (game.mode === 'upgrade') {
    show('<div class="tag">LEVEL ' + game.chapter + ' CLEARED · ALL MINIONS CLEARED</div><h2>Build a<br><em>better bad idea.</em></h2><p>Health kit collected. Choose your next upgrade.<br>Next: ' + THEMES[game.chapter].name + '</p><div class="choices">' + game.offer.map((u, i) => {
      const partner = game.items.find(id => synergy(id, u.id));
      return '<button class="choice" id="pick' + i + '"><span>' + u.icon + '</span><b>' + u.name + '</b><small class="choice-action">' + itemAction(u.id) + '</small><small class="choice-detail">' + u.desc + '</small>' + (partner ? '<small class="synergy">SYNERGY WITH ' + UPGRADES.find(x => x.id === partner).name + ': ' + synergy(partner, u.id) + '</small>' : '') + '</button>';
    }).join('') + '</div>');
    if (game.offer.length === 0) {
      show('<div class="tag">ALL UPGRADES COLLECTED</div><h2>Build complete.</h2><p>Health kit collected. Continue to ' + THEMES[game.chapter].name + '.</p><button class="primary" id="buildContinue">NEXT LEVEL ↗</button>');
      button('buildContinue', () => game.takeOffer(0));
    } else game.offer.forEach((_, i) => button('pick' + i, () => game.takeOffer(i)));
  } else if (['dead', 'win'].includes(game.mode)) {
    const win = game.mode === 'win';
    show('<div class="tag">' + (win ? 'THREE BOSSES. NO LOOSE ENDS.' : 'CAMPAIGN ENDED') + '</div><h2>' + (win ? 'Victory.<br><em>At what cost?</em>' : 'Dropped<br><em>the cash.</em>') + '</h2><p>' + (win ? 'All three bosses and their surviving minions are defeated.<br>' : '') + 'Score ' + game.score + ' · ' + Math.floor(game.time) + ' seconds</p><button class="primary restart-button" id="again" aria-label="Restart run" title="Restart run">' + uiIcon('restart') + ' RESTART</button>');
    button('again', () => game.newRun());
  }
}
function buildDetails() {
  return '<p class="builddesc">' + controlDescription() + '</p>' + game.items.map(id => {
    const u = UPGRADES.find(u => u.id === id);
    return '<div class="pause-item"><b>' + u.icon + ' ' + u.name + '</b><p>' + u.desc + '</p></div>';
  }).join('') + (game.items.length === 2 && synergy(...game.items) ? '<p class="buildsynergy">SYNERGY: ' + synergy(...game.items) + '</p>' : '') + (game.items.length ? '' : '<p>No upgrades selected yet.</p>');
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
  const equipped = game.items.map(id => UPGRADES.find(u => u.id === id));
  setHudText('equipped', equipped.length ? equipped.map(u => u.icon).join('  ') : 'DOLLAR STACK');
  document.getElementById('equipped').title = equipped.map(u => u.name).join(', ');
  setHudText('health', game.debugInvincible ? '∞ HEARTS' : '♥ '.repeat(Math.max(0, p.hp)) + '♡ '.repeat(Math.max(0, p.maxhp - p.hp)));
  setHudText('chapter-label', game.mode === 'bossPractice' ? 'BOSS PRACTICE' : '0' + game.chapter + ' / ' + game.theme.name);
  setHudText('wave-label', game.mode === 'bossPractice' ? 'TRAINING HUNTER' : game.mode === 'reward' ? 'ARENA CLEAR' : boss ? 'MINIONS ' + game.remaining() : 'WAVE ' + game.spawned + ' / ' + game.waveTotal);
  setHudText('boss-label', game.mode === 'bossPractice' ? 'Khamenei · Volley: click / Strike: SPACE' : game.mode === 'reward' ? 'Collect health → choose an upgrade → next arena' : boss ? boss.dead ? 'BOSS DOWN · ENEMIES LEFT: ' + game.remaining() : boss.name + (boss.hp < boss.maxhp * .5 ? ' / ENRAGED' : '') : 'CLEAR THE WAVE TO FACE THE BOSS');
  const meter = document.getElementById('boss-meter'),
    percent = boss ? Math.max(0, boss.hp / boss.maxhp * 100) : 0;
  meter.hidden = !boss || boss.dead;
  meter.setAttribute('aria-valuenow', String(Math.round(percent)));
  document.getElementById('boss-fill').style.width = percent + '%';
  document.getElementById('boss-fill').style.background = game.theme.accent;
  setHudText('jumptext', p.jumpCd > 0 ? 'Jump ready in ' + p.jumpCd.toFixed(1) + ' seconds' : 'Jump ready');
  const jump = document.getElementById('jump');
  const practice = game.mode === 'bossPractice',
    jumpCd = practice ? game.practiceCooldowns?.strike || 0 : p.jumpCd,
    jumpReady = practice ? 3.8 : PLAYER_ABILITIES.jump.cooldown,
    attackCd = practice ? game.practiceCooldowns?.volley || 0 : 0;
  if (jump.textContent !== (practice ? 'STRIKE' : 'JUMP')) jump.textContent = practice ? 'STRIKE' : 'JUMP';
  jump.style.opacity = jumpCd > 0 ? '.65' : '1';
  const charge = Math.round((1 - clamp(jumpCd / jumpReady, 0, 1)) * 100);
  jump.style.background = `linear-gradient(#213529,#213529) padding-box, conic-gradient(#d9fb76 ${charge}%,#45513d 0) border-box`;
  jump.setAttribute('aria-label', practice ? jumpCd > 0 ? 'Missile strike ready in ' + jumpCd.toFixed(1) + ' seconds' : 'Missile strike ready' : p.jumpCd > 0 ? 'Jump ready in ' + p.jumpCd.toFixed(1) + ' seconds' : 'Jump ready');
  const attack = document.getElementById('attack');
  if (attack.textContent !== (practice ? 'VOLLEY' : 'ATTACK')) attack.textContent = practice ? 'VOLLEY' : 'ATTACK';
  attack.style.opacity = practice && attackCd > 0 ? '.65' : '1';
  attack.style.background = practice ? `linear-gradient(#213529,#213529) padding-box, conic-gradient(#d9fb76 ${Math.round((1 - clamp(attackCd / 1.5, 0, 1)) * 100)}%,#45513d 0) border-box` : '';
  attack.setAttribute('aria-label', practice ? attackCd > 0 ? 'Volley ready in ' + attackCd.toFixed(1) + ' seconds' : 'Fire radial volley' : 'Hold Attack; drag to aim');
  updateTutorialInstruction();
  const message = document.getElementById('arena-message');
  message.hidden = !(game.messageTime > 0 && ['play', 'bossPractice'].includes(game.mode));
  if (!message.hidden) setHudText('arena-message', game.message);
  const prompt = document.getElementById('arena-prompt');
  prompt.hidden = game.mode !== 'reward';
  if (!prompt.hidden) setHudText('arena-prompt', game.prompt());
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
function arenaStageSize(viewWidth, viewHeight) {
  return {
    width: Math.max(1, viewWidth),
    height: Math.max(1, viewHeight)
  };
}
function syncCameraRoom() {
  if (cameraRoom === game.room) return;
  cameraRoom = game.room;
  camera.snap(game.player);
  cameraStamp = null;
  release();
  keyboardController.refreshAim();
}
function fitArena() {
  const size = arenaStageSize(window.visualViewport?.width || window.innerWidth || W, window.visualViewport?.height || window.innerHeight || H);
  const stage = document.getElementById('game-stage');
  stage.style.width = size.width + 'px';
  stage.style.height = size.height + 'px';
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const changed = camera.width !== size.width || camera.height !== size.height || viewDpr !== dpr;
  if (!changed) {
    applyTouchLayout();
    return;
  }
  viewDpr = dpr;
  camera.resize(size.width, size.height);
  camera.keepVisible(game.player);
  applyTouchLayout();
  canvas.width = Math.round(size.width * dpr);
  canvas.height = Math.round(size.height * dpr);
  release();
  frameClock.reset();
  cameraStamp = null;
  keyboardController.refreshAim();
}
function updateTutorialInstruction() {
  const el = document.getElementById('arena-instruction'),
    tutorial = ['tutorial', 'tutorialSuccess'].includes(game.mode),
    practice = game.mode === 'bossPractice',
    visible = tutorial || practice;
  const changed = el.hidden === visible;
  el.hidden = !visible;
  if (practice) setHudText('arena-instruction', controlDescription());
  else if (tutorial) setHudText('arena-instruction', game.mode === 'tutorialSuccess' ? 'HIT! Jump → break shield → swing.' : game.lessonStage === 'attack' ? inputMode === 'touch' ? 'Shield broken! Hold ATTACK near the dummy.' : 'Shield broken! Aim at the dummy and hold left click.' : inputMode === 'touch' ? 'Tap JUMP and land close to the shield dummy.' : 'Press SPACE and land close to the shield dummy.');
  if (changed) fitArena();
}

function controlDescription() {
  if (game.mode === 'bossPractice' && networkTest.isActive && networkTest.isClient) return inputMode === 'touch' ? 'Left stick: move Hunter · Hold ATTACK: melee' : 'WASD / arrows: move Hunter · Hold click: melee';
  if (game.mode === 'bossPractice' && networkTest.isActive) return inputMode === 'touch' ? 'Left stick: move Boss · ATTACK: radial volley · JUMP: warned missile' : 'WASD / arrows: move Boss · Hold click: radial volley · SPACE: warned missile strike';
  if (game.mode === 'bossPractice') return inputMode === 'touch' ? 'Left stick: move Boss · VOLLEY: radial shots · STRIKE: warned missile' : 'WASD / arrows: move Boss · Hold click: radial volley · SPACE: warned missile strike · P / ESC: pause';
  return inputMode === 'touch' ? 'Left stick: move · Hold ATTACK: auto aim · Drag ATTACK: manual aim · JUMP: jump' : 'WASD / arrows: move · Mouse: aim + hold click to attack · SPACE: jump · P / ESC: pause';
}
function updateControlHints() {
  for (const id of ['control-hint', 'controls-help-text']) {
    const el = document.getElementById(id);
    if (el) el.textContent = controlDescription() + (id === 'controls-help-text' ? '. After a Boss, walk into the health kit to heal and choose an upgrade.' : '');
  }
  canvas.setAttribute('aria-label', controlDescription());
  updateTutorialInstruction();
}
