'use strict';

// Small HTML-backed DOM fixture, not a browser. Missing IDs really return null.
const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
function harness(coreOverride, options = {}) {
  const elements = new Map(),
    listeners = {},
    documentListeners = {},
    canvasListeners = {};
  const art = [],
    drawCalls = [];
  let frame;
  const context = calls => new Proxy({}, {
    get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args])),
    set(object, key, value) {
      object[key] = value;
      calls.push(['set', key, value]);
      return true;
    }
  });
  const mainCtx = context(drawCalls);
  function detach(node) {
    for (const child of node.children) detach(child);
    if (node.id && elements.get(node.id) === node) elements.delete(node.id);
  }
  function parse(html, parent) {
    const stack = [parent];
    // Shipped scripts are external; ignore raw stylesheet/script text during fixture parsing.
    const markup = html.replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
    for (const match of markup.matchAll(/<(\/)?([a-z][\w-]*)\b([^>]*)>/gi)) {
      const closing = !!match[1],
        tag = match[2].toLowerCase();
      if (closing) {
        const index = stack.findLastIndex(node => node.tagName === tag);
        if (index > 0) stack.length = index;
        continue;
      }
      const node = create(tag);
      for (const attr of match[3].matchAll(/([^\s=/'">]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) node.setAttribute(attr[1], attr[2] ?? attr[3] ?? attr[4] ?? '');
      node.parent = stack.at(-1);
      node.parent.children.push(node);
      if (node.id) {
        assert.ok(!elements.has(node.id), 'duplicate live ID ' + node.id);
        elements.set(node.id, node);
      }
      if (!VOID_TAGS.has(tag)) stack.push(node);
    }
  }
  function create(tagName) {
    const classes = new Set();
    let html = '',
      content = '';
    const node = {
      tagName,
      id: '',
      children: [],
      style: {},
      attributes: {},
      dataset: {},
      listeners: {},
      hidden: false,
      value: '',
      open: false,
      classList: {
        add(...names) {
          for (const name of names) classes.add(name);
        },
        remove(...names) {
          for (const name of names) classes.delete(name);
        },
        contains(name) {
          return classes.has(name);
        },
        toggle(name, force) {
          const on = force ?? !classes.has(name);
          if (on) classes.add(name);else classes.delete(name);
          return on;
        }
      },
      setAttribute(key, value) {
        this.attributes[key] = String(value);
        if (key === 'id') this.id = value;else if (key === 'class') {
          classes.clear();
          for (const name of value.split(/\s+/)) classes.add(name);
        } else if (key === 'hidden') this.hidden = true;else if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;else this[key] = value;
      },
      getAttribute(key) {
        return this.attributes[key] ?? null;
      },
      focus() {
        this.focused = true;
        env.document.activeElement = this;
      },
      setPointerCapture() {},
      getBoundingClientRect() {
        if (options.rects?.[this.id]) return options.rects[this.id];
        if (['game-stage', 'control-safe-area'].includes(this.id)) return {
          left: 0,
          top: 0,
          width: env.window.innerWidth,
          height: env.window.innerHeight
        };
        if (this.id === 'arena-viewport') return {
          left: 0,
          top: 0,
          width: 960,
          height: 528
        };
        return {
          left: 0,
          top: 0,
          width: 960,
          height: 600
        };
      },
      showModal() {
        this.open = true;
      },
      close() {
        this.open = false;
      },
      addEventListener(key, fn) {
        this.listeners[key] = fn;
        if (this.id === 'game') canvasListeners[key] = fn;
      },
      getContext() {
        if (this.id === 'game') return mainCtx;
        if (!this.artContext) {
          const calls = [];
          this.artContext = context(calls);
          art.push({
            canvas: this,
            calls
          });
        }
        return this.artContext;
      },
      querySelectorAll(selector) {
        assert.equal(selector, 'canvas[data-guide-kind]', 'unsupported fixture selector');
        const result = [];
        function visit(n) {
          for (const child of n.children) {
            if (child.tagName === 'canvas' && child.dataset.guideKind) result.push(child);
            visit(child);
          }
        }
        visit(this);
        return result;
      }
    };
    Object.defineProperties(node, {
      offsetHeight: {
        get() {
          if (node.id === 'arena-toolbar') return (options.toolbarHeight ?? 82) + (elements.get('arena-instruction')?.hidden === false ? 40 : 0);
          if (node.id === 'boss-panel') return options.footerHeight ?? 48;
          return 0;
        }
      },
      innerHTML: {
        get: () => html,
        set(value) {
          for (const child of node.children) detach(child);
          node.children = [];
          html = String(value);
          content = '';
          parse(html, node);
        }
      },
      textContent: {
        get: () => content,
        set(value) {
          for (const child of node.children) detach(child);
          node.children = [];
          content = String(value);
          html = '';
        }
      }
    });
    return node;
  }
  const root = create('document');
  const html = options.html ?? fs.readFileSync('dist/index.html', 'utf8');
  parse(html, root);
  const el = id => elements.get(id) ?? null;
  const env = {
    console,
    assert,
    document: {
      getElementById: el,
      body: root.children.find(n => n.tagName === 'html')?.children.find(n => n.tagName === 'body'),
      hidden: false,
      activeElement: null,
      addEventListener(key, fn) {
        documentListeners[key] = fn;
      }
    },
    window: {
      innerWidth: options.width ?? 1280,
      innerHeight: options.height ?? 800,
      localStorage: options.storage,
      navigator: {
        clipboard: options.clipboard
      },
      matchMedia() {
        return {
          matches: !!options.coarse
        };
      },
      addEventListener(key, fn) {
        const previous = listeners[key];
        listeners[key] = previous ? e => {
          previous(e);
          fn(e);
        } : fn;
      }
    },
    requestAnimationFrame(fn) {
      frame = fn;
    }
  };
  vm.createContext(env);
  const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>/g)].map(match => match[1].split('?')[0]);
  for (const file of scripts) {
    if (/^https:\/\//.test(file)) continue;
    assert.ok(/^[\w-]+\.js$/.test(file), 'unexpected script path');
    vm.runInContext(file === 'core.js' && coreOverride ? coreOverride : options.sources?.[file] ?? fs.readFileSync(path.join('dist', file), 'utf8'), env, {
      filename: file
    });
    options.afterScript?.(file, {
      env,
      listeners,
      documentListeners
    });
  }
  const run = code => vm.runInContext(code, env);
  const click = id => {
    const node = el(id);
    assert.ok(node, 'missing live element ' + id);
    assert.equal(typeof node.onclick, 'function', 'missing handler ' + id);
    node.onclick();
  };
  const unlock = password => {
    el('debug-password').value = password;
    el('debug-unlock-form').onsubmit({
      preventDefault() {}
    });
  };
  return {
    env,
    el,
    run,
    click,
    unlock,
    art,
    drawCalls,
    listeners,
    documentListeners,
    canvasListeners,
    frame: t => frame(t)
  };
}
module.exports = {
  harness
};
