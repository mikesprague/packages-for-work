import { defineConfig } from 'vitest/config';

const include = [
  'packages/ct-tdx/src/**/*.ts',
  'packages/ct-utils/src/**/*.ts',
];

const exclude = [
  '**/.devcontainer/**',
  '**/.github/**',
  '**/.history/**',
  '**/.vscode/**',
  '**/assets/**',
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
  '**/types/**',
  './**/scratch*.ts',
  './**/vitest.config.ts',
  '**/*.test.ts',
  '**/*.spec.ts',
  '**/*.d.ts',
  'packages/ct-azure/**',
  'packages/package-starter/**',
];

export default defineConfig({
  test: {
    // Global settings inherited by projects via extends: true
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
    // Temporary: remove after tests are added
    passWithNoTests: true,
    // Coverage configuration (root-only option)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include,
      exclude,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // Define projects with inheritance from root config
    projects: [
      {
        extends: true,
        test: {
          name: 'ct-tdx',
          root: './packages/ct-tdx',
        },
      },
      {
        extends: true,
        test: {
          name: 'ct-utils',
          root: './packages/ct-utils',
        },
      },
    ],
  },
});
