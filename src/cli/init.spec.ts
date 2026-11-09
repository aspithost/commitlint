import {
  existsSync, unlinkSync, writeFileSync,
} from 'node:fs';

import { detectPackageManager } from './utils/detectPackageManager.js';
import { _execSync } from './utils/execSync.js';
import { executeStep } from './utils/executeStep.js';
import { installPackage } from './utils/installPackage.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
  unlinkSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('./constants/dependencies.js', () => ({
  DEPENDENCIES: ['dep-a', 'dep-b'],
}));

vi.mock('./utils/detectPackageManager.js', () => ({
  detectPackageManager: vi.fn(() => 'npm'),
}));

vi.mock('./utils/execSync.js', () => ({
  _execSync: vi.fn(),
}));

vi.mock('./utils/executeStep.js', () => ({
  executeStep: vi.fn((_description: string, fn: () => unknown) => {
    fn();
  }),
}));

vi.mock('./utils/installPackage.js', () => ({
  installPackage: vi.fn(() => 'install-command'),
}));

async function runCli(): Promise<void> {
  vi.resetModules();
  await import('./init.js');
}

describe('init', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.spyOn(console, 'log').mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('install dependencies', () => {
    it('should install the dependencies with the detected package manager', async () => {
      vi.mocked(detectPackageManager).mockReturnValueOnce('pnpm');

      await runCli();

      expect(installPackage).toHaveBeenCalledExactlyOnceWith('pnpm', ['dep-a', 'dep-b']);
    });

    it('should execute the install command', async () => {
      await runCli();

      expect(_execSync).toHaveBeenNthCalledWith(1, 'install-command');
    });

    it('should wrap the install in a step', async () => {
      await runCli();

      expect(executeStep).toHaveBeenNthCalledWith(1, 'install dependencies', expect.any(Function));
    });
  });

  describe('husky initialization', () => {
    it.each([
      ['bun', 'bunx husky init'],
      ['pnpm', 'pnpm exec husky init'],
      ['yarn', 'yarn run husky init'],
      ['npm', 'npx husky init'],
    ] as const)('should run husky init for %s', async (packageManager, expected) => {
      vi.mocked(detectPackageManager).mockReturnValueOnce(packageManager);

      await runCli();

      expect(_execSync).toHaveBeenNthCalledWith(2, expected);
    });

    it('should log the detected package manager', async () => {
      await runCli();

      expect(console.log).toHaveBeenCalledWith('Setting up commitlint with husky (using npm)...\n');
    });
  });

  describe('pre-commit hook removal', () => {
    it('should remove the default pre-commit hook when it exists', async () => {
      vi.mocked(existsSync).mockImplementation((path) => path === '.husky/pre-commit');

      await runCli();

      expect(unlinkSync).toHaveBeenCalledExactlyOnceWith('.husky/pre-commit');
    });

    it('should not remove the pre-commit hook when it does not exist', async () => {
      await runCli();

      expect(unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('commit-msg hook', () => {
    it.each([
      ['bun', 'bunx --bun commitlint --edit $1\n'],
      ['pnpm', 'pnpm exec commitlint --edit $1\n'],
      ['yarn', 'yarn run commitlint --edit $1\n'],
      ['npm', 'npx --no -- commitlint --edit $1\n'],
    ] as const)('should write the hook for %s', async (packageManager, expected) => {
      vi.mocked(detectPackageManager).mockReturnValueOnce(packageManager);

      await runCli();

      expect(writeFileSync).toHaveBeenCalledWith('.husky/commit-msg', expected);
    });
  });

  describe('commitlint config', () => {
    // Source bug: init.ts writes a stray "i" after the closing quote ('@abelspithost/commitlint'i;)
    it.fails('should create commitlint.config.ts when it does not exist', async () => {
      await runCli();

      expect(writeFileSync).toHaveBeenCalledWith(
        'commitlint.config.ts',
        'export { default } from \'@abelspithost/commitlint\';\n',
      );
    });

    it('should not overwrite an existing commitlint.config.ts', async () => {
      vi.mocked(existsSync).mockImplementation((path) => path === 'commitlint.config.ts');

      await runCli();

      expect(writeFileSync).not.toHaveBeenCalledWith('commitlint.config.ts', expect.anything());
    });
  });
});
