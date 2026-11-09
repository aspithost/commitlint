import { existsSync } from 'node:fs';

export function detectPackageManager() {
  if (existsSync('bun.lockb') || existsSync('bun.lock')) return 'bun';
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}
