import { existsSync } from 'node:fs';

import { detectPackageManager } from './detectPackageManager.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
}));

describe('detectPackageManager', () => {
  it.each([
    ['bun.lockb', 'bun'],
    ['bun.lock', 'bun'],
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
  ])('should detect the package manager for %s', (lockFile, expectedPackageManager) => {
    vi.mocked(existsSync).mockImplementation((path) => path === lockFile);

    expect(detectPackageManager()).toBe(expectedPackageManager);
  });

  it('should fall back to npm when no lock file exists', () => {
    vi.mocked(existsSync).mockReturnValue(false);

    expect(detectPackageManager()).toBe('npm');
  });
});
