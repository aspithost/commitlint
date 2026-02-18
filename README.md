# @abelspithost/commitlint

A shared [commitlint](https://commitlint.js.org/) preset that extends `@commitlint/config-conventional` with stricter defaults, plus a CLI to set everything up with one command.

## What's included

- Commitlint configuration that extends `@commitlint/config-conventional`
- Scope is optional by default
- A `createConfig` helper to customize allowed types and scopes (when you provide scopes, they become mandatory)
- An `init` CLI that installs and configures commitlint + husky automatically
- Automatic package manager detection (npm, yarn, pnpm, bun)

## Quick setup

Run the init command in your project root:

```sh
npx -p @abelspithost/commitlint init
```

The CLI detects your package manager by looking for `bun.lockb`/`bun.lock`, `pnpm-lock.yaml`, `yarn.lock`, or falling back to npm. It will:

1. Install `husky`, `@commitlint/cli`, and `@abelspithost/commitlint` as dev dependencies
2. Initialize husky
3. Remove the default `pre-commit` hook that husky creates
4. Create a `.husky/commit-msg` hook (using the correct runner for your package manager)
5. Generate a `commitlint.config.ts` that re-exports the preset (skip if one already exists)

## Manual setup (npm)

Install the required dependencies:

```sh
npm install --save-dev husky @commitlint/cli @abelspithost/commitlint
```

Create a `commitlint.config.ts` in your project root:

```ts
export { default } from '@abelspithost/commitlint';
```

Set up husky and add the commit-msg hook:

```sh
npx husky init
```

Then create a `.husky/commit-msg` file with the following content:

```sh
npx --no -- commitlint --edit $1
```

## Using `createConfig`

Use the `createConfig` helper to customize allowed scopes and types:

```ts
import { createConfig } from '@abelspithost/commitlint';

export default createConfig({
  scopes: ['api', 'ui', 'core'],
});
```

### Options

| Option   | Type       | Default        | Description                          |
| -------- | ---------- | -------------- | ------------------------------------ |
| `scopes` | `string[]` | —              | Restrict commits to these scopes (makes scope mandatory) |
| `types`  | `string[]` | `COMMIT_TYPES` | Override the allowed commit types     |

When you omit `scopes`, scope is optional and you can use any value. When you provide `scopes`, scope becomes **required** and must match one of the listed values. When you omit `types`, it defaults to the built-in `COMMIT_TYPES`.

### Examples

```ts
// Restrict scopes only
import { createConfig } from '@abelspithost/commitlint';

export default createConfig({
  scopes: ['api', 'ui', 'core', 'docs'],
});
```

```ts
// Custom types and scopes
import { createConfig } from '@abelspithost/commitlint';

export default createConfig({
  scopes: ['api', 'ui'],
  types: ['feat', 'fix', 'chore'],
});
```

## Extending the preset manually

Import the default config and spread it into your own configuration in `commitlint.config.ts`:

```ts
import baseConfig, { RuleConfigSeverity, type UserConfig } from '@abelspithost/commitlint';

const configuration: UserConfig = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // require a scope in this project
    'scope-empty': [RuleConfigSeverity.Error, 'never'],
  },
};

export default configuration;
```

This package re-exports `RuleConfigSeverity` and `UserConfig`, so you don't need to install `@commitlint/types` separately.

## Commit message format

Write your commits in the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type: description
type(scope): description
```

### Allowed types

`build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

### Examples

```
feat: add login endpoint
fix(api): handle null response from user service
docs(readme): add installation instructions
```
