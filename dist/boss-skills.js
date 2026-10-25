'use strict';

// Boss attack patterns. Arena owns cooldowns, movement, hit resolution and damage.
const VoidBossSkills = Object.freeze({
  // These two chapter-three moves are also exposed separately in Debug's
  // Boss Practice. `fire` composes them in the same order for normal AI play.
  practiceVolley(arena, boss) {
    const enraged = boss.hp < boss.maxhp * .5,
      count = enraged ? 14 : 10;
    for (let i = 0; i < count; i++) arena.bullet(boss, i * Math.PI * 2 / count + boss.age * .5, 155);
  },
  practiceStrike(arena, boss, target) {
    arena.hazard(target.x, target.y, 60, 1.45, 'missile', { ownerId: boss.id });
  },
  fire(arena, boss, chapter, aim, enraged) {
    if (chapter === 1) {
      for (let i = -2; i <= 2; i++) arena.bullet(boss, aim + i * .28, 135, 8, 'urine');
      arena.bullet(boss, aim, 105, 11, 'homingPoop');
      boss.cd = enraged ? 1 : 1.5;
    } else if (chapter === 2) {
      for (let i = 0; i < 12; i++) arena.bullet(boss, i * Math.PI / 6 + boss.age * .42, 150, 6);
      for (let i = -1; i <= 1; i++) arena.bullet(boss, aim + i * .12, 230);
      boss.cd = enraged ? .9 : 1.3;
    } else {
      this.practiceVolley(arena, boss);
      this.practiceStrike(arena, boss, arena.player);
      boss.cd = enraged ? 1 : 1.5;
    }
  }
});
