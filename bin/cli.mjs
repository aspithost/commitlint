#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';

function run(cmd) {
  return execSync(cmd, { stdio: 'inherit' });
}

function step(description, fn) {
  try {
    fn();
  } catch {
    console.error(`\nFailed to ${description}. Please check the error above and retry.`);
    process.exit(1);
  }
}

function detectPackageManager() {
  if (existsSync('bun.lockb') || existsSync('bun.lock')) return 'bun';
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}

function installCommand(pm, deps) {
  const joined = deps.join(' ');
  switch (pm) {
    case 'bun':
      return `bun add -D ${joined}`;
    case 'pnpm':
      return `pnpm add -D ${joined}`;
    case 'yarn':
      return `yarn add -D ${joined}`;
    default:
      return `npm install --save-dev ${joined}`;
  }
}

const pm = detectPackageManager();
const DEPS = ['husky', '@commitlint/cli', '@abelspithost/commitlint'];

console.log(`Setting up commitlint with husky (using ${pm})...\n`);

step('install dependencies', () => {
  run(installCommand(pm, DEPS));
});

step('initialize husky', () => {
  let scriptBase;
  switch (pm) {
    case 'bun':
      scriptBase = 'bunx';
      break;
    case 'pnpm':
      scriptBase = 'pnpm exec';
      break;
    case 'yarn':
      scriptBase = 'yarn run';
      break;
    default:
      scriptBase = 'npx';
  }
  run(`${scriptBase} husky init`);
});

step('remove default pre-commit hook', () => {
  const preCommit = '.husky/pre-commit';
  if (existsSync(preCommit)) {
    unlinkSync(preCommit);
  }
});

step('create commit-msg hook', () => {
  let runner;
  switch (pm) {
    case 'bun':
      runner = 'bunx --bun';
      break;
    case 'pnpm':
      runner = 'pnpm exec';
      break;
    case 'yarn':
      runner = 'yarn run';
      break;
    default:
      runner = 'npx --no --';
  }
  writeFileSync('.husky/commit-msg', `${runner} commitlint --edit $1\n`);
});

step('create commitlint config', () => {
  if (existsSync('commitlint.config.ts')) {
    console.log('\ncommitlint.config.ts already exists, skipping');
  } else {
    writeFileSync(
      'commitlint.config.ts',
      "export { default } from '@abelspithost/commitlint';\n",
    );
    console.log('\nCreated commitlint.config.ts');
  }
});

console.log('Done! Commitlint with husky is ready.');
