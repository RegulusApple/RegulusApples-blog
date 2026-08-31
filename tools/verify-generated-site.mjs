import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const projectRoot = process.cwd();
const publicRoot = join(projectRoot, 'public');

const projectFile = (file) => join(projectRoot, ...file.split('/'));
const publicFile = (file) => join(publicRoot, ...file.split('/'));
const readProject = (file) => readFile(projectFile(file), 'utf8');
const readPublic = (file) => readFile(publicFile(file), 'utf8');

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(file));
    } else {
      files.push(file);
    }
  }
  return files;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const homepage = await readPublic('index.html');
const homepageStyle = await readPublic('css/style.css');
const searchPage = await readPublic('search/index.html');
const searchIndex = JSON.parse(await readPublic('search.json'));
const statsPage = await readPublic('stats/index.html');
const messagePage = await readPublic('message/index.html');
const musicPage = await readPublic('music/index.html');
const readingPage = await readPublic('reading/index.html');
const weeklyPage = await readPublic('weekly/index.html');
const categoriesPage = await readPublic('categories/index.html');
const tagsPage = await readPublic('tags/index.html');
const generatedScript = await readPublic('js/main.js');
const manifest = JSON.parse(await readPublic('manifest.webmanifest'));
const serviceWorker = await readPublic('sw.js');
const htmlFiles = (await walk(publicRoot)).filter((file) => file.endsWith(`${sep}index.html`));

for (const marker of ['<!doctype html>', '<meta charset="utf-8">', '把学习变成可回看的系统']) {
  assert(homepage.toLowerCase().includes(marker.toLowerCase()), `Generated site is missing required marker: ${marker}`);
}

for (const marker of ['.welcome-panel', '.search-form', '.article-body .highlight', "html[data-theme='dark'] .article-body pre"]) {
  assert(homepageStyle.includes(marker), `Generated stylesheet is missing required feature marker: ${marker}`);
}

const articlePath = htmlFiles.find((file) => relative(publicRoot, file).replaceAll('\\', '/').startsWith('notes/'));
assert(articlePath, 'Generated site is missing a regular article page.');
const article = await readFile(articlePath, 'utf8');

for (const marker of ['article-card', 'article-body', 'katex.min.css', 'article-footer', 'article-comments']) {
  assert(article.includes(marker), `Generated article is missing required feature marker: ${marker}`);
}

assert(searchPage.includes('data-search-page') && Array.isArray(searchIndex) && searchIndex.length > 0, 'Generated local search page or index is missing.');

for (const marker of ['theme-toggle', 'manifest.webmanifest', 'href="/stats/"', 'href="/reading/"', 'search-trigger', 'search-overlay', 'global-search-input']) {
  assert(homepage.includes(marker), `Generated homepage is missing required feature marker: ${marker}`);
}

assert(statsPage.includes('year-chart') && messagePage.includes('留言板已经准备好了'), 'Generated statistics or message page is missing.');
assert(categoriesPage.includes('taxonomy-index-card') && categoriesPage.includes('学习'), 'Generated category index page is missing.');
assert(tagsPage.includes('taxonomy-index-card') && tagsPage.includes('记录'), 'Generated tag index page is missing.');

for (const marker of ['music-audio', 'playlist', 'data-music-player']) {
  assert(musicPage.includes(marker), `Generated music page is missing required feature marker: ${marker}`);
}

for (const marker of ['reading-grid', 'book-card', '读书架']) {
  assert(readingPage.includes(marker), `Generated reading page is missing required feature marker: ${marker}`);
}

for (const marker of ['weekly-page', '周小结模板已经准备好']) {
  assert(weeklyPage.includes(marker), `Generated weekly page is missing required feature marker: ${marker}`);
}

for (const marker of ['giscus.app/client.js', 'data-music-player', 'searchOverlay', 'serviceWorker.register']) {
  assert(generatedScript.includes(marker), `Generated interaction script is missing required feature marker: ${marker}`);
}

assert(!homepage.includes('googletagmanager.com/gtag/js') && !homepage.includes('data-website-id='), 'Analytics scripts must stay disabled until the user supplies an analytics identifier.');
assert(manifest.display === 'standalone' && manifest.start_url === '/', 'Generated PWA manifest is invalid.');

const layoutSource = await readProject('themes/halfold/layout/layout.ejs');
const serviceWorkerSource = await readProject('source/sw.js');
const styleVersion = layoutSource.match(/style\.css[^\n]*\?v=(\d+)/)?.[1];
const scriptVersion = layoutSource.match(/main\.js[^\n]*\?v=(\d+)/)?.[1];
const cachedStyleVersion = serviceWorkerSource.match(/style\.css\?v=(\d+)/)?.[1];
const cachedScriptVersion = serviceWorkerSource.match(/main\.js\?v=(\d+)/)?.[1];
assert(styleVersion && styleVersion === cachedStyleVersion, 'Layout and service-worker CSS versions are out of sync.');
assert(scriptVersion && scriptVersion === cachedScriptVersion, 'Layout and service-worker JavaScript versions are out of sync.');
assert(serviceWorker.includes('halfold-blog-v9') && serviceWorker.includes(`/css/style.css?v=${styleVersion}`), 'Generated service worker is missing the current cache shell.');
assert(serviceWorker.includes(`/js/main.js?v=${scriptVersion}`) && serviceWorker.includes('/search.json'), 'Generated service worker is missing current client assets.');
assert(serviceWorker.includes("event.request.mode === 'navigate'"), 'Generated service worker is missing the network-first document strategy.');

const generatorSource = await readProject('scripts/regular-posts.js');
for (const marker of ["register('index'", "register('archive'", "register('category'", "register('tag'", "register('post'", 'isWeekly']) {
  assert(generatorSource.includes(marker), `Regular/weekly post generator is missing required marker: ${marker}`);
}

const linksSource = await readProject('source/links/index.md');
assert(!linksSource.includes('](#)'), 'Links page still contains a dead placeholder link.');

const references = [];
const referencePattern = /(?:href|src)="([^"]+)"/g;
for (const file of htmlFiles) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(referencePattern)) {
    const raw = match[1].trim();
    if (!raw.startsWith('/') || raw.startsWith('//')) continue;
    const pathname = raw.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    let decodedPath;
    try {
      decodedPath = decodeURIComponent(pathname);
    } catch {
      throw new Error(`Generated page contains an invalid encoded URL: ${raw}`);
    }
    let target = publicFile(decodedPath.replace(/^\/+/, ''));
    if (decodedPath.endsWith('/')) target = join(target, 'index.html');
    references.push({ file: relative(publicRoot, file), raw, target });
  }
}

const missingReferences = [];
for (const reference of references) {
  if (!await exists(reference.target)) missingReferences.push(`${reference.file}: ${reference.raw}`);
}
assert(!missingReferences.length, `Generated site contains broken internal references:\n${missingReferences.join('\n')}`);

await access(publicFile('css/katex.min.css'));
await access(publicFile('css/fonts/KaTeX_Main-Regular.woff2'));
await access(publicFile('sw.js'));

console.log(`Generated site checks passed: ${htmlFiles.length} HTML pages, ${references.length} internal references, and current PWA assets verified.`);
