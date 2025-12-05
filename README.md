# packages-for-work

A TypeScript monorepo containing internal npm packages published to GitHub Packages under the `@mikesprague` scope.

## Packages

| Package | Description |
|---------|-------------|
| [@mikesprague/ct-tdx](./packages/ct-tdx) | TeamDynamix API helper library |
| [@mikesprague/ct-utils](./packages/ct-utils) | General utilities and helper methods |

## Prerequisites

- **Node.js** >= 24.x
- **npm** >= 11.x
- Access to GitHub Packages registry

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mikesprague/packages-for-work.git
cd packages-for-work

# Install dependencies
npm install

# Build all packages
npm run build

# Run type checking
npm run typecheck

# Run linting
npx biome check .
```

---

## Development Guide

### Repository Structure

```shell
packages-for-work/
├── packages/
│   ├── ct-tdx/          # TeamDynamix API helpers
│   └── ct-utils/        # General utilities
├── .github/
│   └── workflows/       # CI/CD workflows
├── biome.json           # Linting/formatting config
├── nx.json              # Nx monorepo configuration
├── tsconfig.json        # TypeScript configuration
├── tsdown.config.ts     # Build configuration
└── package.json         # Root package with workspaces
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages |
| `npm run typecheck` | Type check all packages |
| `npm run clean` | Clean dist folders |
| `npm run release` | Version bump, changelog, and tag |
| `npm run release -- --dry-run` | Preview release without making changes |
| `npm run release:publish` | Publish packages to registry |

### Making Changes

1. **Create a feature branch:**

   ```bash
   git checkout -b feat/my-new-feature
   ```

2. **Make your changes** in the appropriate package under `packages/`

3. **Follow the coding standards:**
   - Use TypeScript strict mode
   - Add JSDoc comments to exported functions
   - Use parameter objects for functions with multiple parameters

4. **Test your changes locally:**

   ```bash
   npm run build
   npm run typecheck
   npx biome check .
   ```

5. **Format your code:**

   ```bash
   npx biome check --write .
   ```

6. **Commit using conventional commits:**

   ```bash
   git add .
   git commit -m "feat(ct-tdx): add new API method"
   ```

   Or use commitizen for guided commits:

   ```bash
   npx cz
   ```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```shell
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature → triggers **minor** version bump
- `fix`: Bug fix → triggers **patch** version bump
- `docs`: Documentation only
- `refactor`: Code refactoring (no feature change)
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

**Breaking Changes:**
Add `!` after type for a **major** version bump:

```shell
feat!: remove deprecated API method
```

**Scopes:**

- `ct-tdx`: Changes to ct-tdx package
- `ct-utils`: Changes to ct-utils package
- `deps`: Dependency updates
- `config`: Configuration changes

---

## Release Guide

This section covers the complete release process from start to finish.

### Prerequisites for Releasing

1. All changes committed to `main` branch
2. All CI checks passing
3. Clean working directory (`git status` shows no changes)

### Step 1: Preview the Release (Dry Run)

Always preview first to see what will happen:

```bash
npm run release -- --dry-run
```

This shows:

- Which packages have changes
- What version bumps will occur (based on commits)
- What the changelog entries will look like
- What git tags will be created

**Review the output carefully before proceeding.**

### Step 2: Run All Checks

Ensure everything passes before releasing:

```bash
npm run build
npm run typecheck
npx biome check .
```

### Step 3: Execute the Release

When satisfied with the dry run:

```bash
npm run release
```

This will:

1. Analyze commits since last release
2. Determine version bumps based on conventional commits
3. Update `package.json` versions
4. Generate/update `CHANGELOG.md` files
5. Create a git commit with the changes
6. Create git tags (e.g., `@mikesprague/ct-tdx@1.2.3`)
7. Push commits and tags to remote

### Step 4: Publish to GitHub Packages

After the release commits and tags are pushed:

```bash
npm run release:publish
```

Or let CI handle it - the publish workflow triggers automatically on version tags.

### Step 5: Verify the Release

1. Check [GitHub Packages](https://github.com/mikesprague?tab=packages) for the new version
2. Verify the changelog was updated correctly
3. Test installing the package in a consuming project:

   ```bash
   npm install @mikesprague/ct-tdx@latest
   ```

---

## Rolling Back a Release

### If NOT yet published (tags/commits only)

1. **Delete the git tag(s):**

   ```bash
   # Delete local tag
   git tag -d @mikesprague/ct-tdx@1.2.3

   # Delete remote tag (if pushed)
   git push origin --delete @mikesprague/ct-tdx@1.2.3
   ```

2. **Revert the version bump commit:**

   ```bash
   # If not pushed yet
   git reset --hard HEAD~1

   # If already pushed (creates a revert commit)
   git revert HEAD
   git push
   ```

### If already published to GitHub Packages

Once published, **you cannot republish the same version number**. Options:

1. **Deprecate the version** (recommended):

   ```bash
   npm deprecate @mikesprague/ct-tdx@1.2.3 "This version has issues, use 1.2.4 instead"
   ```

2. **Unpublish within 72 hours** (GitHub Packages policy):

   ```bash
   npm unpublish @mikesprague/ct-tdx@1.2.3
   ```

3. **Publish a patch fix** as the next version (e.g., `1.2.4`) with the corrected code

### Best Practices to Avoid Rollbacks

- **Always run `--dry-run` first**
- **Review changelogs** before confirming
- **Run all checks** (build, typecheck, lint) before releasing
- **Use the CI release workflow** which has validation steps built in

---

## CI/CD Workflows

### Automatic Publishing (`publish-packages.yml`)

Triggers when version tags are pushed (e.g., `@mikesprague/ct-tdx@1.2.3`):

- Builds packages
- Publishes to GitHub Packages

### Manual Release (`release.yml`)

Workflow dispatch with options:

- **dry_run**: Preview changes without executing
- **verbose**: Show detailed output

This workflow:

1. Runs build, typecheck, and lint checks
2. Executes `nx release` for versioning
3. Publishes packages

### Dependabot Auto-merge (`dependabot-auto-merge.yml`)

Automatically merges minor/patch dependency updates from Dependabot.

---

## Installing Packages

### Configure npm for GitHub Packages

Create or update `~/.npmrc`:

```shell
@mikesprague:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### Install a Package

```bash
npm install @mikesprague/ct-tdx
npm install @mikesprague/ct-utils
```

---

## Technology Stack

| Tool | Purpose |
|------|---------|
| [Nx](https://nx.dev) | Monorepo orchestration, caching, and release management |
| [tsdown](https://github.com/rolldown/tsdown) | TypeScript library bundler (ESM + CJS) |
| [Biome](https://biomejs.dev) | Linting and formatting |
| [TypeScript](https://www.typescriptlang.org) | Type checking |

---

## License

MIT
