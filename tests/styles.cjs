'use strict';

// Structural checks complement, but do not replace, browser/device layout verification.
const fs = require('fs'),
  assert = require('node:assert/strict');
const current = fs.readFileSync('dist/styles.css', 'utf8');
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
const declarations = flatten(current);
assert.ok(declarations.length > 0);
function last(selector, property) {
  return declarations.filter(d => d.selector === selector && d.property === property).at(-1)?.value;
}
assert.equal(last('.arena-vitals #health', 'font-size'), '20px');
assert.equal(last('.arena-progress', 'font-size'), '12px');
assert.equal(last('#boss-label', 'font-size'), '12px');
assert.ok(!declarations.some(d => d.selector === '.jump-caption'));
assert.equal(last('.arena-actions .small', 'min-height'), '44px');
assert.equal(last('.touch', 'width'), '56px');
assert.equal(last('.touch', 'height'), '56px');
assert.equal(last('.choices', 'grid-template-columns'), '1fr');
assert.ok(declarations.some(d => d.selector === '.choices' && d.property === 'grid-template-columns' && d.value === '1fr' && d.context.includes('650px')));
assert.equal(last('.pause-primary', 'position'), 'sticky');
assert.equal(last('[hidden]', 'display'), 'none !important');
assert.equal(last('.arena-viewport', 'aspect-ratio'), '20 / 11');
assert.equal(last('body.play-mode > header', 'display'), 'none');
assert.equal(last('body.play-mode .overlay', 'position'), 'fixed');
console.log('PASS readable HUD sizes, touch targets, stacked cards, sticky Resume and Play-mode CSS contracts');
const html = fs.readFileSync('dist/index.html', 'utf8');
assert.ok(!html.includes('<style>'));
assert.ok(html.includes('styles.css?v=30'));
console.log('PASS stylesheet structure and shipped link');
