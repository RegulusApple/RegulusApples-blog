import { access, readFile } from 'node:fs/promises';

const html = await readFile('public/index.html', 'utf8');

for (const marker of ['<!doctype html>', '<meta charset="utf-8">', '把学习变成可回看的系统']) {
  if (!html.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`Generated site is missing required marker: ${marker}`);
  }
}

const homepageStyle = await readFile('public/css/style.css', 'utf8');
const homepage = await readFile('public/index.html', 'utf8');
const article = await readFile('public/notes/learning-as-a-reviewable-system/index.html', 'utf8');
const searchPage = await readFile('public/search/index.html', 'utf8');
const searchIndex = JSON.parse(await readFile('public/search.json', 'utf8'));
const statsPage = await readFile('public/stats/index.html', 'utf8');
const messagePage = await readFile('public/message/index.html', 'utf8');
const musicPage = await readFile('public/music/index.html', 'utf8');
const readingPage = await readFile('public/reading/index.html', 'utf8');
const generatedScript = await readFile('public/js/main.js', 'utf8');
const manifest = JSON.parse(await readFile('public/manifest.webmanifest', 'utf8'));

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

for (const marker of ['theme-toggle', 'manifest.webmanifest', 'href="/stats/"']) {
  if (!homepage.includes(marker)) {
    throw new Error(`Generated homepage is missing second-phase feature marker: ${marker}`);
  }
}

for (const marker of ['related-card', 'article-comments', 'comments-placeholder']) {
  if (!article.includes(marker)) {
    throw new Error(`Generated article is missing second-phase feature marker: ${marker}`);
  }
}

if (!statsPage.includes('year-chart') || !messagePage.includes('留言板已经准备好了')) {
  throw new Error('Generated statistics or message page is missing.');
}

for (const marker of ['music-audio', 'playlist', 'data-music-player']) {
  if (!musicPage.includes(marker)) {
    throw new Error(`Generated music page is missing third-phase feature marker: ${marker}`);
  }
}

for (const marker of ['reading-grid', 'book-card', '读书架']) {
  if (!readingPage.includes(marker)) {
    throw new Error(`Generated reading page is missing third-phase feature marker: ${marker}`);
  }
}

for (const marker of ['giscus.app/client.js', 'data-music-player', 'serviceWorker.register']) {
  if (!generatedScript.includes(marker)) {
    throw new Error(`Generated interaction script is missing third-phase feature marker: ${marker}`);
  }
}

if (homepage.includes('googletagmanager.com/gtag/js') || homepage.includes('data-website-id=')) {
  throw new Error('Analytics scripts must stay disabled until the user supplies an analytics identifier.');
}

if (manifest.display !== 'standalone' || manifest.start_url !== '/') {
  throw new Error('Generated PWA manifest is invalid.');
}

await access('public/css/katex.min.css');
await access('public/css/fonts/KaTeX_Main-Regular.woff2');
await access('public/sw.js');

console.log('Generated site encoding, shell, search, math, article, PWA, statistics, and interaction checks passed.');
