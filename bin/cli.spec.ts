import type { MockInstance } from 'vitest';


const mockExecSync = vi.fn();
const mockExistsSync = vi.fn<(path: string) => boolean>();
const mockUnlinkSync = vi.fn();
const mockWriteFileSync = vi.fn();

vi.mock('node:child_process', () => ({
  execSync: mockExecSync,
}));

vi.mock('node:fs', () => ({
  existsSync: mockExistsSync,
  unlinkSync: mockUnlinkSync,
  writeFileSync: mockWriteFileSync,
}));

async function runCli(): Promise<void> {
  vi.resetModules();
  // @ts-expect-error: CLI function in JavaScript
  await import('./cli.mjs');
}

describe('cli.mjs', () => {
  let exitSpy: MockInstance;

  beforeEach(() => {
    mockExecSync.mockReturnValue(Buffer.from(''));
    mockExistsSync.mockReturnValue(false);
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(console, 'log').mockReturnValue(undefined);
    vi.spyOn(console, 'error').mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('install command', () => {
    it('runs npm install --save-dev for npm', async () => {
      await runCli();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('npm install --save-dev'),
        expect.anything(),
      );
    });

    it('runs pnpm add -D for pnpm', async () => {
      mockExistsSync.mockImplementation((path: string) => path === 'pnpm-lock.yaml');

      await runCli();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('pnpm add -D'),
        expect.anything(),
      );
    });

    it('runs yarn add -D for yarn', async () => {
      mockExistsSync.mockImplementation((path: string) => path === 'yarn.lock');

      await runCli();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('yarn add -D'),
        expect.anything(),
      );
    });

    it('runs bun add -D for bun', async () => {
      mockExistsSync.mockImplementation((path: string) => path === 'bun.lockb');

      await runCli();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('bun add -D'),
        expect.anything(),
      );
    });
  });

  describe('husky initialization', () => {
    it('runs npx husky init for npm', async () => {
      await runCli();

      expect(mockExecSync).toHaveBeenCalledWith(
        'npx husky init',
        expect.anything(),
      );
    });

    it('runs pnpm dlx husky init for pnpm', async () => {
      mockExistsSync.mockImplementation((path: string) => path === 'pnpm-lock.yaml');

      await runCli();

      expect(mockExecSync).toHaveBeenCalledWith(
        'pnpm exec husky init',
        expect.anything(),
      );
    });
  });

  describe('pre-commit hook removal', () => {
    it('removes the default pre-commit hook when it exists', async () => {
      mockExistsSync.mockImplementation((path: string) => path === '.husky/pre-commit');

      await runCli();

      expect(mockUnlinkSync).toHaveBeenCalledWith('.husky/pre-commit');
    });

    it('skips removal when pre-commit hook does not exist', async () => {
      await runCli();

      expect(mockUnlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('commit-msg hook', () => {
    it('writes hook with npx runner for npm', async () => {
      await runCli();

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        '.husky/commit-msg',
        'npx --no -- commitlint --edit $1\n',
      );
    });

    it('writes hook with pnpm exec runner for pnpm', async () => {
      mockExistsSync.mockImplementation((path: string) => path === 'pnpm-lock.yaml');

      await runCli();

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        '.husky/commit-msg',
        'pnpm exec commitlint --edit $1\n',
      );
    });

    it('writes hook with yarn run runner for yarn', async () => {
      mockExistsSync.mockImplementation((path: string) => path === 'yarn.lock');

      await runCli();

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        '.husky/commit-msg',
        'yarn run commitlint --edit $1\n',
      );
    });

    it('writes hook with bunx runner for bun', async () => {
      mockExistsSync.mockImplementation((path: string) => path === 'bun.lockb');

      await runCli();

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        '.husky/commit-msg',
        'bunx --bun commitlint --edit $1\n',
      );
    });
  });

  describe('commitlint config', () => {
    it('creates commitlint.config.ts with the expected export', async () => {
      await runCli();

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        'commitlint.config.ts',
        "export { default } from '@abelspithost/commitlint';\n",
      );
    });

    it('skips commitlint.config.ts if it already exists', async () => {
      mockExistsSync.mockImplementation((path: string) => path === 'commitlint.config.ts');

      await runCli();

      expect(mockWriteFileSync).not.toHaveBeenCalledWith(
        'commitlint.config.ts',
        expect.anything(),
      );
    });
  });

  describe('error handling', () => {
    it('calls process.exit(1) when a step fails', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('command failed');
      });

      await runCli();

      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
