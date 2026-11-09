import { installPackage } from './installPackage.js';

const DEPS = ['husky', '@commitlint/cli'];
const DEPS_STRINGIFIED = DEPS.join(' ');

describe('installPackage', () => {
  it.each([
    ['bun', `bun add -D ${DEPS_STRINGIFIED}`],
    ['pnpm', `pnpm add -D ${DEPS_STRINGIFIED}`],
    ['yarn', `yarn add -D ${DEPS_STRINGIFIED}`],
    ['npm', `npm install --save-dev ${DEPS_STRINGIFIED}`],
  ] as const)(
    'should build the install command for %s',
    (packageManager, expectedInstallCommand) => {
      expect(installPackage(packageManager, DEPS)).toBe(expectedInstallCommand);
    },
  );
});
