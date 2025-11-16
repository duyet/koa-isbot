# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-16

### 🎉 Complete Rewrite

Version 2.0 is a ground-up rewrite of koa-isbot with modern tooling, comprehensive features, and TypeScript support.

### ✨ Added

- **TypeScript Support**: Full TypeScript rewrite with comprehensive type definitions
- **Modern Build System**: Using tsup for optimized ESM and CJS bundles
- **Comprehensive Bot Detection**: Integration with isbot library (thousands of bot patterns vs. 15)
- **Performance Caching**: Built-in LRU cache with configurable TTL for better performance
- **Custom Patterns**: Ability to add custom bot patterns or exclude specific patterns
- **Callback Hooks**: `onBotDetected` and `onDetection` callbacks for analytics and logging
- **Custom Configuration**:
  - Configurable state key
  - Custom user agent extraction
  - Cache size and TTL settings
- **Security Hardening**:
  - Input validation and sanitization
  - DoS protection with string length limits
  - Bounded cache with LRU eviction
- **Modern Testing**: Migrated to Vitest with 100% test coverage
- **Developer Experience**:
  - ESLint and Prettier configuration
  - Pre-commit hooks with Husky
  - Comprehensive JSDoc comments
  - Working examples (basic and advanced)
- **CI/CD**: Updated GitHub Actions for Node.js 18.x, 20.x, 22.x, 24.x
- **Documentation**: Comprehensive README with migration guide and examples

### 🔄 Changed

- **Result Location**: Moved from `ctx.isBot` to `ctx.state.isBot` (configurable via `stateKey`)
- **Result Format**: Now returns `BotDetectionResult` object instead of string/null
  ```typescript
  // Before: ctx.isBot = 'googlebot' | null
  // After: ctx.state.isBot = {
  //   isBot: true,
  //   botName: 'googlebot',
  //   botPatterns: ['googlebot'],
  //   userAgent: '...'
  // }
  ```
- **Module System**: Migrated from CommonJS to ESM (with CJS support via dual package)
- **Node.js Support**: Now requires Node.js >= 18.0.0
- **Package Manager**: Updated to use npm with modern package-lock.json format

### 🚀 Improved

- **Bot Detection**: From 15 hardcoded patterns to thousands via isbot library
- **Performance**: Added intelligent caching (configurable, enabled by default)
- **Accuracy**: Detects modern bots (ChatGPT, Claude, Perplexity, etc.)
- **API Design**: More intuitive and extensible API
- **Error Handling**: Better error handling and edge case coverage
- **Code Quality**: Strict TypeScript, ESLint, and Prettier enforcement

### 📦 Dependencies

- **Added**:
  - `isbot ^5.1.17` - Industry-standard bot detection
  - `typescript ^5.7.2` - TypeScript support
  - `tsup ^8.3.5` - Modern bundler
  - `vitest ^2.1.8` - Testing framework
  - ESLint and Prettier for code quality

- **Updated**:
  - `koa ^2.16.3` - Latest Koa version
  - `supertest ^7.0.0` - Latest testing tools

- **Removed**:
  - `nodeunit` - Replaced with Vitest

### 🔧 Breaking Changes

⚠️ This is a major version with breaking changes. See [Migration Guide](README.md#migration-from-v01x) in README.

1. **Import Statement**:
   ```typescript
   // Before
   const isBot = require('koa-isbot');

   // After
   import { koaIsBot } from '@duyetdev/koa-isbot';
   ```

2. **Result Access**:
   ```typescript
   // Before
   ctx.isBot // 'googlebot' | null

   // After
   ctx.state.isBot // BotDetectionResult object
   ```

3. **Minimum Node.js Version**: Now requires Node.js >= 18.0.0

4. **Module Format**: Primary export is now ESM (CJS still supported)

### 📝 Development

- Added comprehensive test suite (40+ tests)
- Added performance benchmarks
- Added integration tests with real Koa applications
- Added TypeScript type tests
- Set up automated testing in CI/CD

## [0.1.1] - 2016

### Initial Release

- Basic bot detection middleware for Koa
- Support for 15 common bots (Googlebot, Bingbot, etc.)
- Simple API: `ctx.isBot` returns bot name or null
- CommonJS module

---

[2.0.0]: https://github.com/duyetdev/koa-isbot/compare/v0.1.1...v2.0.0
[0.1.1]: https://github.com/duyetdev/koa-isbot/releases/tag/v0.1.1
