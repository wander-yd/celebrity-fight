'use strict';

const {
  execFileSync
} = require('node:child_process');
for (const suite of ['camera', 'game', 'debug', 'refactor', 'parity', 'styles', 'ux', 'touch', 'control-layout']) {
  execFileSync(process.execPath, ['tests/' + suite + '.cjs'], {
    stdio: 'inherit'
  });
}
