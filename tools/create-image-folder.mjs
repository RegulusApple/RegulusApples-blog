#!/usr/bin/env node
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function printUsage() {
  console.log('用法: npm run image:new -- --date YYYY-MM --name <目录名>');
  console.log('示例: npm run image:new -- --date 2026-09 --name circuit-basics-p1');
}

function parseArguments(args) {
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') return { help: true };
    if (argument !== '--date' && argument !== '--name') {
      throw new Error('未知参数：' + argument);
    }
    if (Object.hasOwn(options, argument)) {
      throw new Error('参数重复：' + argument);
    }

    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error('参数 ' + argument + ' 后面需要一个值。');
    }

    options[argument] = value;
    index += 1;
  }

  return options;
}

function validateOptions(options) {
  if (!options['--date'] || !options['--name']) {
    throw new Error('必须提供 --date YYYY-MM 和 --name <目录名>。');
  }

  const dateMatch = /^(\d{4})-(\d{2})$/.exec(options['--date']);
  if (!dateMatch) {
    throw new Error('--date 格式应为 YYYY-MM，例如 2026-09。');
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  if (year < 1000 || month < 1 || month > 12) {
    throw new Error('--date 不是有效的年份和月份。');
  }

  const name = options['--name'];
  if (name === '.' || name === '..' || name.trim() !== name) {
    throw new Error('--name 不能是相对目录标记，也不能带首尾空格。');
  }
  if (/[<>:"\/\\|?*\u0000-\u001F]/u.test(name) || /[. ]$/u.test(name)) {
    throw new Error('--name 不能包含路径分隔符、Windows 保留字符或以点/空格结尾。');
  }
  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/iu.test(name)) {
    throw new Error('--name 不能使用 Windows 保留设备名。');
  }
  if (name.length > 120) {
    throw new Error('--name 最长为 120 个字符。');
  }

  return { year: dateMatch[1], month: dateMatch[2], name };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const { year, month, name } = validateOptions(options);
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const monthDirectory = path.join(repoRoot, 'source', 'images', year, year + '_' + month);
  const articleDirectory = path.join(monthDirectory, name);

  await mkdir(monthDirectory, { recursive: true });
  await mkdir(articleDirectory);

  const relativeDirectory = path.relative(repoRoot, articleDirectory).split(path.sep).join('/');
  console.log('已创建图片目录：' + relativeDirectory);
}

main().catch((error) => {
  console.error('创建图片目录失败：' + error.message);
  process.exitCode = 1;
});