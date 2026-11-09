type PackageManager = 'bun' | 'pnpm' | 'yarn' | 'npm';

export function installPackage(packageManager: PackageManager, deps: string[]) {
  const joined = deps.join(' ');
  switch (packageManager) {
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
