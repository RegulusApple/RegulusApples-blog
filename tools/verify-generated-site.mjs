import { access, readFile } from 'node:fs/promises';

const html = await readFile('public/index.html', 'utf8');

for (const marker of ['<!doctype html>', '<meta charset="utf-8">', '把学习变成可回看的系统']) {
  if (!html.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`Generated site is missing required marker: ${marker}`);
  }
}

const homepageStyle = await readFile('public/css/style.css', 'utf8');
const article = await readFile('public/notes/learning-as-a-reviewable-system/index.html', 'utf8');
const searchPage = await readFile('public/search/index.html', 'utf8');
const searchIndex = JSON.parse(await readFile('public/search.json', 'utf8'));

for (const marker of ['background: #fff', '.search-form', '.article-body .highlight']) {
  if (!homepageStyle.includes(marker)) {
    throw new Error(`Generated stylesheet is missing required feature marker: ${marker}`);
  }
}

for (const marker of ['约 207 字', 'loading="lazy"', 'katex.min.css']) {
  if (!article.includes(marker)) {
    throw new Error(`Generated article is missing required feature marker: ${marker}`);
  }
}

if (!searchPage.includes('data-search-page') || !Array.isArray(searchIndex) || searchIndex.length === 0) {
  throw new Error('Generated local search page or index is missing.');
}

await access('public/css/katex.min.css');
await access('public/css/fonts/KaTeX_Main-Regular.woff2');

console.log('Generated site encoding, shell, search, math, and article feature checks passed.');
