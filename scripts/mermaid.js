'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  isMermaidFence,
  protectMermaidFences,
  renderMermaidFence
} = require('./mermaid-renderer');

const mermaidSource = path.join(hexo.base_dir, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');
const mermaidTarget = path.join(
  hexo.base_dir,
  'themes',
  'regulusapples-blog',
  'source',
  'js',
  'vendor',
  'mermaid.min.js'
);

if (!fs.existsSync(mermaidSource)) {
  throw new Error(`Mermaid browser bundle is missing: ${mermaidSource}`);
}

fs.mkdirSync(path.dirname(mermaidTarget), { recursive: true });
fs.copyFileSync(mermaidSource, mermaidTarget);

// Hexo's built-in syntax highlighter runs before markdown-it. Protect Mermaid
// fences first so they remain HTML blocks instead of becoming plaintext code.
hexo.extend.filter.register('before_post_render', protectMermaidFences, 0);

hexo.extend.filter.register('markdown-it:renderer', function registerMermaidRenderer(md) {
  const defaultFence = md.renderer.rules.fence;

  md.renderer.rules.fence = function renderFence(tokens, index, options, env, self) {
    if (isMermaidFence(tokens[index])) {
      return renderMermaidFence(tokens, index, options, env, self);
    }

    return defaultFence.call(this, tokens, index, options, env, self);
  };
});
