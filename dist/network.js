'use strict';

// Debug-only two-browser transport. The Boss host runs Arena; the Hunter sends
// commands and receives authoritative snapshots over a PeerJS data channel.
const VoidNetwork = (() => {
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function snapshot(game) {
    const room = copy({ ...game.room, melee: [], swings: [] });
    const swingOrigin = value => value === game.player ? 'player' : value === game.boss ? 'boss' : null;
    room.melee = game.room.melee.map(({ origin, ...s }) => ({ ...s, originKey: swingOrigin(origin) }));
    room.swings = game.room.swings.map(({ origin, ...s }) => origin ? { ...s, originKey: swingOrigin(origin) } : { ...s });
    return {
      v: 1, seq: game.time, mode: game.mode, chapter: game.chapter, score: game.score,
      time: game.time, player: copy(game.player), boss: copy(game.boss), arena: room,
      waveTotal: game.waveTotal, spawned: game.spawned, spawnTimer: game.spawnTimer,
      practiceCooldowns: copy(game.practiceCooldowns), practiceHunterRespawn: game.practiceHunterRespawn,
      practiceHunterAttackQueued: game.practiceHunterAttackQueued,
      practiceResetTimer: game.practiceResetTimer, message: game.message, messageTime: game.messageTime, uid: game.uid
    };
  }
  function applySnapshot(game, state) {
    if (!state || state.v !== 1 || state.mode !== 'bossPractice' || !state.player || !state.boss || !state.arena) return false;
    Object.assign(game, copy({ ...state, arena: undefined }));
    game.arena = copy(state.arena);
    const actors = { player: game.player, boss: game.boss };
    for (const key of ['melee', 'swings']) for (const value of game.arena[key] || []) {
      if (value.originKey) value.origin = actors[value.originKey] || game.player;
      delete value.originKey;
    }
    game.events = [];
    game.landingContacts = new Map();
    return true;
  }
  function create({ game, onStatus = () => {}, onSnapshot = () => {}, onExit = () => {} }) {
    let peer = null, connection = null, role = null, latestInput = null,
      lastInputAt = 0, snapshotElapsed = 0, pendingAttack = false, inputSeq = 0, snapshotSeq = 0,
      receivedInputSeq = -1, receivedSeq = -1, connected = false;
    const status = (text, code = '') => onStatus({ text, code, role, active: !!role, connected });
    function input(value) {
      const c = VoidInput.command(value);
      return { moveX: c.moveX, moveY: c.moveY, attackHeld: c.attackHeld, attackPressed: c.attackPressed, jumpPressed: false };
    }
    function send(value) {
      if (!connection || !connection.open) return false;
      connection.send(value);
      return true;
    }
    function shutdown(message = 'Disconnected') {
      const wasActive = !!role;
      const oldPeer = peer;
      peer = null; connection = null; role = null; latestInput = null; connected = false;
      try { oldPeer?.destroy(); } catch (_) {}
      status(message);
      if (wasActive) onExit();
    }
    function disconnected(message) {
      connection = null; latestInput = null; connected = false; receivedInputSeq = -1;
      status(message, role === 'boss' ? peer?.id || '' : '');
    }
    function attach(conn, hostSide) {
      if (hostSide && connection) { conn.close(); return; }
      connection = conn;
      conn.on('open', () => {
        connected = true;
        if (hostSide) { latestInput = { moveX: 0, moveY: 0, attackHeld: false, attackPressed: false }; lastInputAt = performance.now(); }
        status(hostSide ? 'Hunter connected' : 'Connected as Hunter', hostSide ? peer?.id || '' : '');
        if (!hostSide) send({ t: 'join', v: 1 });
      });
      conn.on('data', packet => {
        if (!packet || typeof packet !== 'object' || packet.v !== 1) return;
        if (hostSide) {
          if (packet.t !== 'input' || !Number.isInteger(packet.seq) || packet.seq <= receivedInputSeq) return;
          receivedInputSeq = packet.seq;
          latestInput = input(packet.input);
          lastInputAt = performance.now();
          return;
        }
        if (packet.t !== 'snapshot' || !Number.isFinite(packet.seq) || packet.seq <= receivedSeq) return;
        if (applySnapshot(game, packet.state)) {
          receivedSeq = packet.seq;
          onSnapshot(packet.state);
        }
      });
      conn.on('close', () => disconnected('Connection closed · leave and restart the test'));
      conn.on('error', () => disconnected('Connection error · leave and restart the test'));
    }
    function host() {
      if (role) return false;
      if (typeof Peer !== 'function') { status('Network library unavailable'); return false; }
      role = 'boss'; status('Connecting to free PeerJS signaling…');
      try {
        peer = new Peer();
        peer.on('open', id => status('Share this room code with the Hunter', id));
        peer.on('connection', conn => attach(conn, true));
        peer.on('error', error => status(error?.type === 'unavailable-id' ? 'Room ID unavailable · restart test' : 'Peer connection error · restart test'));
        peer.on('disconnected', () => status('Signaling disconnected · restart test'));
      } catch (_) { role = null; status('Could not start network test'); return false; }
      return true;
    }
    function join(code) {
      if (role) return false;
      const room = String(code || '').trim();
      if (!room || room.length > 80) { status('Enter the Boss room code'); return false; }
      if (typeof Peer !== 'function') { status('Network library unavailable'); return false; }
      role = 'hunter'; status('Connecting to Boss room…');
      try {
        peer = new Peer();
        peer.on('open', () => attach(peer.connect(room, { reliable: true }), false));
        peer.on('error', () => status('Could not join · check the code and try again'));
        peer.on('disconnected', () => status('Signaling disconnected · restart test'));
      } catch (_) { role = null; status('Could not join network test'); return false; }
      return true;
    }
    function tick(dt) {
      if (!connected || role !== 'boss') return;
      snapshotElapsed += dt;
      if (snapshotElapsed < 1 / 15) return;
      snapshotElapsed = 0;
      send({ t: 'snapshot', v: 1, seq: ++snapshotSeq, state: snapshot(game) });
    }
    function sendHunterInput(command) {
      if (!connected || role !== 'hunter') return;
      if (command.attackPressed) pendingAttack = true;
      const now = performance.now();
      if (now - lastInputAt < 1 / 30 * 1000) return;
      lastInputAt = now;
      const value = input(command);
      value.attackPressed = pendingAttack;
      if (send({ t: 'input', v: 1, seq: ++inputSeq, input: value })) pendingAttack = false;
    }
    function hunterInput() {
      if (!connected || role !== 'boss') return null;
      if (!latestInput || performance.now() - lastInputAt > 350) return { mx: 0, my: 0, attack: false, attackPressed: false };
      const value = { mx: latestInput.moveX, my: latestInput.moveY, attack: latestInput.attackHeld, attackPressed: latestInput.attackPressed };
      latestInput.attackPressed = false;
      return value;
    }
    function leave() { shutdown(''); }
    return Object.freeze({ host, join, tick, sendHunterInput, hunterInput, leave,
      get role() { return role; }, get connected() { return connected; }, get isClient() { return role === 'hunter'; }, get isActive() { return !!role; },
      snapshot: () => snapshot(game), applySnapshot: value => applySnapshot(game, value) });
  }
  return Object.freeze({ create, snapshot, applySnapshot });
})();
