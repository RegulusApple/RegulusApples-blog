import { readFile } from 'node:fs/promises';

const html = await readFile('public/index.html', 'utf8');

for (const marker of ['<!doctype html>', '<meta charset="utf-8">', '把学习变成可回看的系统']) {
  if (!html.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`Generated site is missing required marker: ${marker}`);
  }
}

console.log('Generated site encoding and shell checks passed.');
