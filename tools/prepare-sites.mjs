import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const client = join(dist, 'client');
const server = join(dist, 'server');

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });
await cp(join(root, 'public'), client, { recursive: true });

await writeFile(join(server, 'index.js'), `
async function fetchAsset(request, env) {
  if (!env?.ASSETS) return new Response('Not found', { status: 404 });
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = decodeURIComponent(url.pathname);
    const candidates = [path];

    if (path.endsWith('/')) candidates.push(path + 'index.html');
    else if (!path.includes('.')) candidates.push(path + '/index.html');

    for (const candidate of candidates) {
      const assetUrl = new URL(candidate, url);
      const response = await fetchAsset(new Request(assetUrl, request), env);
      if (response.status !== 404) return response;
    }

    return fetchAsset(new Request(new URL('/404.html', url), request), env);
  },
};
`);

await writeFile(join(server, 'wrangler.json'), JSON.stringify({
  name: 'regulusapples-blog',
  main: 'index.js',
  compatibility_date: '2026-05-15',
  compatibility_flags: ['nodejs_compat'],
  assets: { directory: '../client' },
  observability: { enabled: true },
}, null, 2));
