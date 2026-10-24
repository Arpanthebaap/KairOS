# Contributing to KairOS

Thank you for your interest in contributing to KairOS. We welcome academic researchers, software engineers, and domain experts to collaborate on our neuro-symbolic multi-agent architecture.

## 1. Development Principles

- **Mathematical Correctness**: Algorithms in `src/core/` must satisfy their formal invariant proofs.
- **Strict Typing**: All TypeScript code must compile under `strict: true` with no implicit any.
- **Zero-Cloud Reliability**: Every feature must maintain an offline deterministic fallback without internet access.
- **Accessibility**: UI features must conform to WCAG 2.1 AAA/AA standards and WAI-ARIA Authoring Practices.

## 2. Pull Request Guidelines

1. Fork and branch from `main`.
2. Ensure all unit and integration tests pass:
   ```bash
   npm run test
   ```
3. Ensure static typing and linting pass with zero errors:
   ```bash
   npm run typecheck
   npm run lint
   ```
4. Verify repository size remains strictly under 10 MB.
5. Submit your Pull Request targeting `main` with conventional commit messaging.

## 3. Code Style

- Format code using Prettier: `npx prettier --write .`
- Follow standard TSDoc conventions for all exported functions and types.
