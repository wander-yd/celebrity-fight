'use strict';

const {
  execFileSync
} = require('node:child_process');
for (const suite of ['camera', 'game', 'landing-contact', 'attack', 'swing-aim', 'idle-aim', 'controllers', 'debug', 'practice', 'network', 'refactor', 'parity', 'styles', 'ux', 'touch', 'control-layout']) {
  execFileSync(process.execPath, ['tests/' + suite + '.cjs'], {
    stdio: 'inherit'
  });
}
