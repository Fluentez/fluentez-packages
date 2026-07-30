# Fluentez Ecosystem Documentation

Welcome to the official developer documentation for the Fluentez library ecosystem. Fluentez is a high-performance modular software suite designed for modern web applications.

## Ecosystem Packages Overview

The Fluentez ecosystem is partitioned into modular TypeScript packages published under the `@fluentez` scope:

| Package | Version | Status | Description | Target |
| :--- | :--- | :--- | :--- | :--- |
| `@fluentez/hooks` | 1.0.0 | Active | High-performance React hooks for UI and state control | React 16.8+ |
| `@fluentez/core` | Planned | Roadmap | Ecosystem core foundations and context configuration | Universal |
| `@fluentez/utils` | Planned | Roadmap | Functional helpers, throttling, and debouncing algorithms | Universal |
| `@fluentez/dom` | Planned | Roadmap | DOM viewport computation and bounding element math | Web DOM |
| `@fluentez/animation` | Planned | Roadmap | Transition curves, frame animators, and RAF timing | Web DOM |
| `@fluentez/icons` | Planned | Roadmap | SVG icon registry and vector rendering primitives | Web DOM / React |
| `@fluentez/forms` | Planned | Roadmap | Lightweight form validation engine and field primitives | Universal |

---

## Architectural Principles

1. Modular Decoupling: Each package maintains zero unnecessary dependencies outside its core scope.
2. Dual Bundle Distribution: Every package ships both ECMAScript Modules (ESM) and CommonJS (CJS) formats alongside TypeScript declaration files.
3. Tree-Shaking Optimization: Side-effect free package declarations enable bundlers (Webpack, Vite, Rollup) to prune unused exports.
4. Strict Typing: End-to-end type safety guaranteed via TypeScript 5+.

---

## Quick Start

### Installation

Install individual packages using your preferred package manager:

npm:
```bash
npm install @fluentez/hooks
```

pnpm:
```bash
pnpm add @fluentez/hooks
```

yarn:
```bash
yarn add @fluentez/hooks
```

---

## Package Quick Links & References

- Package Documentation: [packages/hooks/README.md](file:///Volumes/KINGSTON/Developments/fluentez-packages/packages/hooks/README.md)

---

## Security and Compliance

All packages adhere to strict secure coding guidelines:
- Zero dynamic code evaluation (`eval` or `Function` constructors).
- Strict input validation and sanitization.
- No telemetry or unverified remote calls.

License: MIT
