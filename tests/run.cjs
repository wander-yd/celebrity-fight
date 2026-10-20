'use strict';

const {
  execFileSync
} = require('node:child_process');
for (const suite of ['game', 'debug', 'refactor', 'parity', 'styles', 'ux']) {
  execFileSync(process.execPath, ['tests/' + suite + '.cjs'], {
    stdio: 'inherit'
  });
}
