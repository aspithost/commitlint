import { RuleConfigSeverity, type UserConfig } from '@commitlint/types';

import { COMMIT_TYPES } from '../constants/commitTypes.js';

const baseConfiguration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
};

/**
 * Default commitlint configuration.
 *
 * Extends `@commitlint/config-conventional` with stricter defaults:
 * - Scope is optional.
 * - Allowed types are restricted to {@link COMMIT_TYPES}.
 *
 * @example
 * ```ts
 * // commitlint.config.ts
 * export { default } from '@abelspithost/commitlint';
 * ```
 */
export const configuration: UserConfig = {
  ...baseConfiguration,
  rules: {
    'type-enum': [RuleConfigSeverity.Error, 'always', COMMIT_TYPES],
  },
};

/**
 * Create a customized commitlint configuration.
 *
 * Starts from the same base as {@link configuration} (extends
 * `@commitlint/config-conventional`, scope optional) and lets you
 * restrict the allowed scopes and/or override the allowed types.
 *
 * @param options - Configuration options.
 * @param options.scopes - Restrict commits to these scopes. When provided,
 *   a scope becomes **required** on every commit.
 * @param options.types - Override the allowed commit types.
 *   Defaults to {@link COMMIT_TYPES}.
 * @returns A `UserConfig` object ready to be exported from
 *   `commitlint.config.ts`.
 *
 * @example
 * ```ts
 * // commitlint.config.ts
 * import { createConfig } from '@abelspithost/commitlint';
 *
 * export default createConfig({
 *   scopes: ['api', 'ui', 'core'],
 * });
 * ```
 */
export function createConfig({
  scopes,
  types = COMMIT_TYPES,
} : {
  scopes?: string[];
  types?: string[];
}): UserConfig {
  return {
    ...baseConfiguration,
    rules: {
      ...(scopes && {
        'scope-empty': [RuleConfigSeverity.Error, 'never'],
        'scope-enum': [RuleConfigSeverity.Error, 'always', scopes],
      }),
      'type-enum': [RuleConfigSeverity.Error, 'always', types],
    },
  };
}
