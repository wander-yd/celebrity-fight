'use strict';

// Verify CSS cleanup structurally; this is not browser layout/computed-style QA.
const fs = require('fs'),
  cp = require('node:child_process'),
  assert = require('node:assert/strict');
const prior = cp.execFileSync('git', ['show', 'a27a9bf599f4b9401eeb0e5b0467a135e8d2258b:dist/index.html'], {
  encoding: 'utf8',
  maxBuffer: 2 ** 20
});
const old = prior.match(/<style>([\s\S]*?)<\/style>/)[1],
  current = fs.readFileSync('dist/styles.css', 'utf8');
const markup = fs.readFileSync('dist/index.html', 'utf8') + fs.readdirSync('dist').filter(f => f.endsWith('.js')).map(f => fs.readFileSync('dist/' + f, 'utf8')).join('\n');
const classes = new Set(['hidden', ...[...markup.matchAll(/class=["']([^"']*)["']/g)].flatMap(m => m[1].split(/\s+/))]);
function flatten(source, context = []) {
  source = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const declarations = [];
  let pos = 0;
  while (pos < source.length) {
    const start = source.indexOf('{', pos);
    if (start < 0) {
      assert.equal(source.slice(pos).trim(), '');
      break;
    }
    const header = source.slice(pos, start).trim();
    let end = start + 1,
      depth = 1,
      quote = null;
    while (depth) {
      const c = source[end];
      if (quote) {
        if (c === quote && source[end - 1] !== '\\') quote = null;
      } else if (c === '"' || c === "'") quote = c;else if (c === '{') depth++;else if (c === '}') depth--;
      end++;
      assert.ok(end <= source.length + 1, 'unbalanced CSS');
    }
    const body = source.slice(start + 1, end - 1);
    pos = end;
    if (header.startsWith('@')) {
      declarations.push(...flatten(body, [...context, header]));
      continue;
    }
    for (const declaration of body.split(';').filter(x => x.trim())) {
      const colon = declaration.indexOf(':');
      assert.ok(colon > 0);
      const property = declaration.slice(0, colon).trim(),
        value = declaration.slice(colon + 1).trim();
      for (const selector of header.split(',').map(x => x.trim())) declarations.push({
        context: context.join('|'),
        selector,
        property,
        value
      });
    }
  }
  return declarations;
}
const before = flatten(old),
  after = flatten(current),
  kept = new Set();
let cursor = before.length - 1;
for (let i = after.length - 1; i >= 0; i--) {
  while (cursor >= 0 && JSON.stringify(before[cursor]) !== JSON.stringify(after[i])) cursor--;
  assert.ok(cursor >= 0, 'CSS introduced or moved a declaration: ' + JSON.stringify(after[i]));
  kept.add(cursor--);
}
let removed = 0;
for (let i = 0; i < before.length; i++) if (!kept.has(i)) {
  removed++;
  const d = before[i];
  const unused = [...d.selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)].some(m => !classes.has(m[1]));
  if (unused) continue;
  assert.ok(before.slice(i + 1).some(later => later.context === d.context && later.selector === d.selector && later.property === d.property && (!d.value.includes('!important') || later.value.includes('!important'))), 'removed live, unshadowed declaration ' + JSON.stringify(d));
}
assert.ok(removed > 0);
console.log(`PASS CSS retains declaration order; ${removed} removed declarations are unused or provably overridden`);
const html = fs.readFileSync('dist/index.html', 'utf8');
assert.ok(!html.includes('<style>'));
assert.ok(html.includes('styles.css?v=23'));
console.log('PASS external stylesheet is linked from the shipped page');
