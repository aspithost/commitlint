import { execSync } from 'node:child_process';

import { _execSync } from './execSync.js';

const { OUTPUT } = vi.hoisted(() => ({ OUTPUT: Buffer.from('output') }));

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => OUTPUT),
}));

describe('_execSync', () => {
  it('should run the command with inherited stdio', () => {
    _execSync('npm test');

    expect(execSync).toHaveBeenCalledExactlyOnceWith('npm test', { stdio: 'inherit' });
  });

  it('should return the result of execSync', () => {
    expect(_execSync('npm test')).toBe(OUTPUT);
  });
});
