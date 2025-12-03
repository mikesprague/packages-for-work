# Copilot Instructions for packages-for-work

This document provides context and guidelines for GitHub Copilot when working in this monorepo.

## Critical: Always Use Current Documentation

**Before making any changes involving external tools, libraries, or services:**

1. **Always verify with official documentation** - Never assume version numbers, API signatures, or configuration syntax from memory
2. **Check for breaking changes** - When updating dependencies or configs, verify migration guides exist
3. **Use the latest stable versions** - For GitHub Actions, npm packages, and other dependencies, verify current versions via official sources
4. **Search the web when uncertain** - If documentation is unclear or you're unsure about current best practices, search for up-to-date information

**Examples of what to verify:**
- GitHub Actions versions (e.g., `actions/checkout@v6`, `actions/setup-node@v6`)
- npm package versions and their APIs
- Configuration file schemas and syntax changes
- TypeScript/Node.js feature support by version

**Never rely on cached or potentially outdated knowledge for:**
- Version numbers
- API changes between major versions
- Deprecated features or their replacements
- New features in recent releases

## Project Overview

This is a TypeScript monorepo containing internal npm packages published to GitHub Packages under the `@mikesprague` scope. The packages provide utility functions and API helpers for work-related projects.

## Repository Structure

```
packages-for-work/
├── packages/
│   ├── ct-tdx/          # TeamDynamix API helper library
│   ├── ct-utils/        # General utilities and helper methods
│   ├── ct-azure/        # (Ignore) Azure-related package
│   └── package-starter/ # (Ignore) Template for new packages
├── .github/
│   └── workflows/       # GitHub Actions for publishing
├── biome.json           # Root linting/formatting config
├── nx.json              # Nx monorepo configuration
├── tsconfig.json        # Root TypeScript configuration
└── package.json         # Root package with workspaces
```

## Technology Stack

| Tool | Purpose | Version |
|------|---------|---------|
| **Nx** | Monorepo task orchestration, caching, versioning, and publishing | Latest |
| **tsdown** | TypeScript library bundler (ESM + CJS output with .d.ts) - uses workspace mode | Latest |
| **Biome** | Linting and formatting (schema 2.0.5) | 2.x |
| **TypeScript** | Type checking (`moduleResolution: "NodeNext"`) | 5.x |
| **Node.js** | Runtime (target Node 22+) | 24.x |

## Packages to Focus On

When making changes, focus on these active packages:
- `packages/ct-tdx` - TeamDynamix API helpers
- `packages/ct-utils` - General utilities

**Ignore these packages** (legacy/template):
- `packages/ct-azure`
- `packages/package-starter`

## Coding Standards

### TypeScript Guidelines

1. **Use strict TypeScript** - All strict mode options are enabled
2. **Prefer interfaces** for public API types
3. **Export types explicitly** alongside functions
4. **Use JSDoc comments** for all exported functions with:
   - `@function` - Function name
   - `@summary` - Brief description
   - `@example` - Usage example
   - `@param` - Parameter descriptions with types
   - `@returns` - Return type and description

### Example Function Pattern

```typescript
/**
 * @function functionName
 * @summary Brief description of what the function does
 * @example
 * const result = await functionName({
 *   param1: 'value1',
 *   param2: 'value2',
 * });
 * @param {FunctionParams} obj - Object with parameters
 * @param {string} obj.param1 - Description of param1
 * @param {string} [obj.param2='default'] - Optional param with default
 * @returns {Promise<ReturnType>} Description of return value
 */
export interface FunctionParams {
  param1: string;
  param2?: string;
}

export const functionName = async ({
  param1,
  param2 = 'default',
}: FunctionParams): Promise<ReturnType> => {
  // Implementation
};
```

### Code Style (Enforced by Biome)

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always
- **Trailing commas**: ES5 style (objects, arrays)
- **Arrow functions**: Always use parentheses around parameters
- **Imports**: Auto-organized by Biome

### ESM Module Pattern

- All packages use `"type": "module"` (ESM)
- Use `node:` prefix for Node.js built-in modules:
  ```typescript
  import fs from 'node:fs';
  import https from 'node:https';
  ```
- Dual output (ESM `.js` + CJS `.cjs`) handled by tsdown

## Common Tasks

### Building Packages

```bash
# Build all packages
npm run build

# Build specific package
npx nx run @mikesprague/ct-tdx:build
```

### Type Checking

```bash
# Type check all packages
npm run typecheck

# Type check specific package
npx nx run @mikesprague/ct-tdx:typecheck
```

### Linting and Formatting

```bash
# Check with Biome
npx biome check .

# Fix issues
npx biome check --write .
```

### Versioning and Publishing

```bash
# Preview release (dry run)
npm run release -- --dry-run

# Create release (version bump, changelog, tags)
npm run release

# Publish to GitHub Packages
npm run release:publish
```

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature → minor version bump
- `fix`: Bug fix → patch version bump
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/updates
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

**Scopes:**
- `ct-tdx`: Changes to ct-tdx package
- `ct-utils`: Changes to ct-utils package
- `deps`: Dependency updates
- `config`: Configuration changes

**Examples:**
```
feat(ct-tdx): add updateTicket method
fix(ct-utils): handle null path in writeDataAsJsonFile
chore(deps): update typescript to 5.9
```

## API Design Principles

1. **Use parameter objects** for functions with multiple parameters
2. **Provide sensible defaults** for optional parameters
3. **Return Promises** for async operations
4. **Throw descriptive errors** with context
5. **Keep external dependencies minimal**

## Dependencies

### Allowed Dependencies

- `axios` - HTTP client (used in ct-tdx)
- Node.js built-in modules (prefer `node:` prefix)

### Avoid

- Large framework dependencies
- Browser-specific APIs
- Dependencies with many transitive deps

## Package.json Structure

Each package should have these fields:

```json
{
  "name": "@mikesprague/package-name",
  "version": "0.0.1",
  "description": "Brief description",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "engines": {
    "node": ">= 24.x",
    "npm": ">= 11.x"
  },
  "scripts": {
    "build": "tsdown",
    "clean": "rimraf dist",
    "typecheck": "tsc --noEmit"
  },
  "publishConfig": {
    "@mikesprague:registry": "https://npm.pkg.github.com",
    "access": "public"
  }
}
```

## Testing Considerations

Currently no test framework is configured. If adding tests:
- Prefer Vitest for its TypeScript/ESM native support
- Place tests in `src/__tests__/` or alongside source files as `*.test.ts`
- Add `test` script and update Nx configuration

## CI/CD Pipeline

- **Build verification**: Runs on all pushes/PRs
- **Publishing**: Triggered by version tags (`@mikesprague/*@*`)
- **Dependabot**: Auto-merges minor/patch updates

## When Making Changes

1. **Verify with current docs** before using any external tool, library, or action version
2. **Check existing patterns** in the package you're modifying
3. **Follow JSDoc conventions** for all exports
4. **Use TypeScript interfaces** for parameter/return types
5. **Test locally** with `npm run build`
6. **Format code** with `npx biome check --write .`
7. **Use conventional commits** for clear changelog generation

## Do Not

- Modify `packages/ct-azure` or `packages/package-starter`
- Add browser-specific code (these are Node.js libraries)
- Remove or weaken TypeScript strict mode settings
- Add dependencies without strong justification
- Commit unformatted code
