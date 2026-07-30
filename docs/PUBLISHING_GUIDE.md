# Enterprise Operations: NPM Package Publishing Guide

This operations document outlines the procedures for publishing and maintaining scoped packages under the `@fluentez` scope on the public NPM registry (`registry.npmjs.org`).

---

## 1. Prerequisites and Administrative Setup

### 1.1 NPM Account and Scope Authorization

Packages within this repository are published under the scoped namespace `@fluentez`. Scoped packages are private by default unless explicitly flagged as public during publication.

1. Register an NPM Account: Visit https://www.npmjs.com/signup to create an account.
2. Create Scope Namespace:
   - Log into https://www.npmjs.com
   - Navigate to Organizations -> Create New Organization
   - Enter Organization Name: `fluentez`
   - Select the Free Tier (Public packages) or Team Tier.

### 1.2 Command Line Authentication

Verify your workstation authentication status:

```bash
npm whoami
```

If not authenticated, run:

```bash
npm login
```

Follow the interactive prompts to enter your Username, Password, and Two-Factor Authentication (2FA) One-Time Password (OTP).

---

## 2. Build and Verification Protocol

Before initiating a publish pipeline, all packages must undergo static type verification and bundle building.

### Step 1: Install Dependencies

Execute from workspace root:

```bash
pnpm install
```

### Step 2: Validate TypeScript Types

```bash
pnpm check-types
```

### Step 3: Compile Distribution Bundles

```bash
pnpm build
```

This populates `dist/` directories in each package with dual formats:
- `dist/index.js` (CommonJS format)
- `dist/index.mjs` (ESModule format)
- `dist/index.d.ts` (TypeScript types declaration file)

---

## 3. Package Publication Procedures

### 3.1 Publishing a Single Package (e.g., `@fluentez/hooks`)

Navigate to the target package directory:

```bash
cd packages/hooks
```

Publish the package with public access:

```bash
npm publish --access public
```

Note: Scoped packages (`@scope/package-name`) will fail without `--access public` unless using a paid NPM private organization account.

### 3.2 Publishing All Ecosystem Packages Simultaneously

To publish all workspace packages sequentially using `pnpm`:

```bash
pnpm --recursive publish --access public
```

---

## 4. Semantic Versioning Protocol (SemVer)

All `@fluentez` packages comply strictly with Semantic Versioning (SemVer 2.0.0):

```
MAJOR.MINOR.PATCH
```

- MAJOR version: Incremented when making incompatible API changes or breaking updates.
- MINOR version: Incremented when adding functionality in a backward-compatible manner.
- PATCH version: Incremented when making backward-compatible bug fixes.

To update version numbers across sub-packages:

```bash
cd packages/hooks
npm version patch # For bug fixes (e.g., 1.0.0 -> 1.0.1)
npm version minor # For new features (e.g., 1.0.0 -> 1.1.0)
npm version major # For breaking changes (e.g., 1.0.0 -> 2.0.0)
```

---

## 5. Automated CI/CD Publishing Pipeline (GitHub Actions Example)

Create `.github/workflows/publish.yml` in your repository root:

```yaml
name: Publish Ecosystem Packages

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Type Check
        run: pnpm check-types

      - name: Build Bundles
        run: pnpm build

      - name: Publish Packages
        run: pnpm --recursive publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 6. Troubleshooting and Operational Incident Recovery

### 6.1 Issue: 403 Forbidden - You do not have permission to publish "@fluentez/package"

Cause:
- Your NPM account is not a member of the `@fluentez` organization/scope, or the package was not previously initialized under your scope.

Resolution:
1. Ensure your username is listed as an Owner or Member in NPM organization settings (`https://www.npmjs.com/org/fluentez`).
2. Verify you appended `--access public` flag: `npm publish --access public`.

### 6.2 Issue: 402 Payment Required

Cause:
- Attempting to publish a scoped package privately without a paid organization subscription.

Resolution:
- Always pass `--access public` during `npm publish`.

### 6.3 Issue: EOTP - You must provide a one-time password

Cause:
- Two-Factor Authentication (2FA) is enabled on your NPM account.

Resolution:
- Append OTP code from your authenticator app to the command:
  ```bash
  npm publish --access public --otp=123456
  ```
