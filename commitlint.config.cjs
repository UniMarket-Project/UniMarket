module.exports = {
  extends: ['@commitlint/config-conventional'],

  // Ignore automatic merge and revert commits
  ignores: [
    (commit) => commit.startsWith('Merge ') || commit.startsWith('Revert '),
  ],

  rules: {
    // 1. Commit Type: Must start with standard conventional commit types
    'type-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature for user/system
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Formatting, whitespace, missing semi-colons
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Code change that improves performance
        'test',     // Adding or updating tests
        'build',    // Changes to build system or external dependencies
        'ci',       // Changes to CI configuration and scripts
        'chore',    // Routine repository maintenance / chore tasks
        'revert',   // Revert previous commits
      ],
    ],

    // 2. Commit Scope: Disallow empty scopes and enforce team/workspace scopes
    'scope-empty': [2, 'never'],
    'scope-enum': [0], // Disabled in favor of custom workspace pattern plugin below
    'scope-workspace-pattern': [2, 'always'],

    // 3. Commit Subject / Description: Must be provided and non-empty
    'subject-empty': [2, 'never'],
    'subject-case': [0], // Flexible casing in description
  },
  plugins: [
    {
      rules: {
        'scope-workspace-pattern': ({ scope }) => {
          if (!scope) {
            return [false, 'scope may not be empty'];
          }

          // Accepted scopes:
          // - web/* (for frontend team, e.g. web/auth, web/feed, web/landing, web)
          // - api/* (for backend team, e.g. api/auth, api/listings, api/platform, api)
          // - shared (for shared contracts/schemas, or shared/*)
          // - infra (for docker, ci, configs, or infra/*)
          // - repo (for root workspace or docs)
          // - deps (for automated dependency updates)
          const isWeb = scope === 'web' || scope.startsWith('web/');
          const isApi = scope === 'api' || scope.startsWith('api/');
          const isShared = scope === 'shared' || scope.startsWith('shared/');
          const isInfra = scope === 'infra' || scope.startsWith('infra/');
          const isRepo = scope === 'repo';
          const isDeps = scope === 'deps';

          const isValid = isWeb || isApi || isShared || isInfra || isRepo || isDeps;

          return [
            isValid,
            `Scope "${scope}" is not permitted. Accepted scopes must be:\n` +
              `  - web/* (for frontend team)\n` +
              `  - api/* (for backend team)\n` +
              `  - shared (for shared contracts/schemas)\n` +
              `  - infra (for docker, ci, configs)\n` +
              `  - repo (for root workspace or docs)`,
          ];
        },
      },
    },
  ],
};
