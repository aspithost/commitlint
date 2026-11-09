#!/usr/bin/env node
import {
  existsSync, unlinkSync, writeFileSync,
} from 'node:fs';

import { DEPENDENCIES } from './constants/dependencies.js';
import { detectPackageManager } from './utils/detectPackageManager.js';
import { _execSync } from './utils/execSync.js';
import { executeStep } from './utils/executeStep.js';
import { installPackage } from './utils/installPackage.js';

function init(): void {
  const packageManger = detectPackageManager();

  executeStep('install dependencies', () => {
    _execSync(installPackage(packageManger, DEPENDENCIES));
  });

  console.log(`Setting up commitlint with husky (using ${packageManger})...\n`);

  executeStep('initialize husky', () => {
    let scriptBase;
    switch (packageManger) {
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
    _execSync(`${scriptBase} husky init`);
  });

  executeStep('remove default pre-commit hook', () => {
    const preCommit = '.husky/pre-commit';
    if (existsSync(preCommit)) {
      unlinkSync(preCommit);
    }
  });

  executeStep('create commit-msg hook', () => {
    let runner;
    switch (packageManger) {
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

  executeStep('create commitlint config', () => {
    if (existsSync('commitlint.config.ts')) {
      console.log('\ncommitlint.config.ts already exists, skipping');
    } else {
      writeFileSync(
        'commitlint.config.ts',
        'export { default } from \'@abelspithost/commitlint\'i;\n',
      );
      console.log('\nCreated commitlint.config.ts');
    }
  });

  console.log('Done! Commitlint with husky is ready.');
}

init();
