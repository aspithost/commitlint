import { execSync } from 'node:child_process';

export function _execSync(cmd: string) {
  return execSync(cmd, { stdio: 'inherit' });
}
