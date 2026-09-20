'use strict';

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function renderMermaidSource(source) {
  const normalizedSource = String(source || '').trim();
  const escapedSource = escapeHtml(normalizedSource);

  return [
    '<figure class="mermaid-block" data-mermaid-block>',
    `<div class="mermaid mermaid-diagram" data-mermaid-diagram role="img" aria-label="Mermaid 图表">${escapedSource}</div>`,
    '<p class="mermaid-status" data-mermaid-status hidden>图表渲染失败，请展开源码检查 Mermaid 语法。</p>',
    '<details class="mermaid-source">',
    '<summary>查看 Mermaid 源码</summary>',
    `<pre><code>${escapedSource}</code></pre>`,
    '</details>',
    '</figure>\n'
  ].join('');
}

function renderMermaidFence(tokens, index, options, env, self) {
  const token = tokens[index];
  return renderMermaidSource(token.content);
}

function protectMermaidFences(data) {
  if (!data || typeof data.content !== 'string') return data;

  const mermaidFence = /(^|\r?\n)([ \t]{0,3})(`{3,}|~{3,})[ \t]*mermaid(?:[ \t]+[^\r\n]*)?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*\3[ \t]*(?=\r?\n|$)/gi;

  data.content = data.content.replace(
    mermaidFence,
    (_match, prefix, _indent, _fence, source) => `${prefix}${renderMermaidSource(source)}\n`
  );

  return data;
}

function isMermaidFence(token) {
  const info = String(token.info || '').trim().split(/\s+/, 1)[0];
  return info.toLowerCase() === 'mermaid';
}

module.exports = {
  isMermaidFence,
  protectMermaidFences,
  renderMermaidFence,
  renderMermaidSource
};
