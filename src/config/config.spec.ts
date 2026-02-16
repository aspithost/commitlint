import { describe, expect, it } from 'vitest';
import { RuleConfigSeverity } from '@commitlint/types';

import { COMMIT_TYPES } from '@/constants/commitTypes.js';
import { configuration, createConfig } from './config.js';

describe('config.ts', () => {
  describe('configuration', () => {
    it('extends @commitlint/config-conventional', () => {
      expect(configuration.extends).toStrictEqual(['@commitlint/config-conventional']);
    });

    it('uses @commitlint/format as formatter', () => {
      expect(configuration.formatter).toBe('@commitlint/format');
    });

    it('does not require a scope', () => {
      expect(configuration.rules?.['scope-empty']).toBeUndefined();
    });

    it('restricts type to COMMIT_TYPES', () => {
      expect(configuration.rules?.['type-enum']).toStrictEqual(
        [RuleConfigSeverity.Error, 'always', COMMIT_TYPES],
      );
    });
  });

  describe('createConfig', () => {
    it('uses COMMIT_TYPES as default types', () => {
      const config = createConfig({});

      expect(config.rules?.['type-enum']).toStrictEqual(
        [RuleConfigSeverity.Error, 'always', COMMIT_TYPES],
      );
    });

    it('uses custom types when provided', () => {
      const types = ['feat', 'fix'];
      const config = createConfig({ types });

      expect(config.rules?.['type-enum']).toStrictEqual(
        [RuleConfigSeverity.Error, 'always', types],
      );
    });

    it('does not require a scope when scopes is not provided', () => {
      const config = createConfig({});

      expect(config.rules?.['scope-empty']).toBeUndefined();
      expect(config.rules?.['scope-enum']).toBeUndefined();
    });

    it('requires a scope when scopes is provided', () => {
      const scopes = ['api', 'ui'];
      const config = createConfig({ scopes });

      expect(config.rules?.['scope-empty']).toStrictEqual(
        [RuleConfigSeverity.Error, 'never'],
      );
      expect(config.rules?.['scope-enum']).toStrictEqual(
        [RuleConfigSeverity.Error, 'always', scopes],
      );
    });

    it('always includes base configuration', () => {
      const config = createConfig({});

      expect(config.extends).toStrictEqual(['@commitlint/config-conventional']);
      expect(config.formatter).toBe('@commitlint/format');
    });
  });
});
