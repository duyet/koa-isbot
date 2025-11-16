# koa-isbot - Claude Development Guide

This file provides context for AI assistants (Claude) working on this project.

## Project Overview

**koa-isbot** is a modern Koa middleware for intelligent bot detection. It's a TypeScript-first library that integrates with the industry-standard [isbot](https://github.com/omrilotan/isbot) library to detect thousands of bots including search engines, AI assistants (ChatGPT, Claude, Perplexity), and social media crawlers.

## Architecture Philosophy

This project follows these core principles:

1. **TypeScript First** - Strict typing, comprehensive type definitions
2. **Zero Config** - Works perfectly out of the box with sensible defaults
3. **Performance** - Built-in LRU caching, optimized for production
4. **Security** - Input validation, DoS protection, bounded caches
5. **Developer Experience** - Excellent IntelliSense, clear documentation
6. **Modern Standards** - ESM, tree-shaking, dual package support

## Project Structure

```
koa-isbot/
├── src/
│   ├── index.ts       # Main middleware (exports koaIsBot)
│   ├── types.ts       # TypeScript type definitions
│   └── cache.ts       # LRU cache implementation
├── test/
│   ├── index.test.ts      # Integration tests
│   ├── cache.test.ts      # Cache unit tests
│   └── performance.test.ts # Performance benchmarks
├── examples/
│   ├── basic.ts       # Zero-config usage
│   └── advanced.ts    # Full-featured example
├── dist/              # Build output (ESM + CJS)
├── tsconfig.json      # TypeScript build config
├── tsconfig.eslint.json # TypeScript ESLint config
├── tsup.config.ts     # Build configuration
├── vitest.config.ts   # Test configuration
└── .eslintrc.json     # Code quality rules
```

## Key Components

### 1. Main Middleware (`src/index.ts`)

The `koaIsBot` function is the primary export. It:
- Accepts optional configuration via `KoaIsBotOptions`
- Returns Koa middleware that adds `ctx.state.isBot` (or custom key)
- Integrates with isbot library for detection
- Supports custom patterns and exclusions
- Implements caching for performance
- Provides callback hooks for analytics

**Important Implementation Details:**
- Uses LRU cache with automatic cleanup
- Sanitizes user agent strings (2048 char limit for DoS protection)
- Supports custom user agent extraction
- Handles null/undefined user agents gracefully

### 2. Type Definitions (`src/types.ts`)

Comprehensive TypeScript types for:
- `BotDetectionResult` - Detection result with bot info
- `KoaIsBotOptions` - Configuration options
- `KoaContextWithBot` - Extended Koa context
- `CacheEntry` - Cache entry with TTL

### 3. Cache (`src/cache.ts`)

Performance-optimized LRU cache with:
- Configurable size and TTL
- Automatic expiration cleanup
- LRU eviction policy
- No external dependencies

## Development Workflow

### Setup

```bash
npm install           # Install dependencies
npm run build        # Build the project
npm test             # Run tests
npm run test:coverage # Run with coverage
```

### Code Quality

```bash
npm run type-check   # TypeScript type checking
npm run lint         # ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Prettier formatting
```

### Testing Strategy

- **Unit Tests** - Test individual components (cache, types)
- **Integration Tests** - Test middleware with real Koa apps
- **Performance Tests** - Benchmark middleware overhead
- **Coverage Target** - > 90% (currently 99.31%)

All tests use Vitest for fast, modern testing.

## Important Configuration Files

### tsconfig.json

- **For building**: Strict TypeScript, outputs to `dist/`
- **Excludes**: test, examples (only includes src/)
- **Target**: ES2022 with ESNext modules

### tsconfig.eslint.json

- **For linting**: Includes src/, test/, and examples/
- **Used by**: ESLint for type-aware linting
- **Why separate**: Build config excludes tests, but ESLint needs to check them

### tsup.config.ts

- **Dual output**: ESM (`.js`) and CJS (`.cjs`)
- **Declaration files**: `.d.ts` and `.d.cts`
- **Source maps**: Enabled for debugging
- **Tree-shaking**: Enabled for optimal bundles

### vitest.config.ts

- **Coverage**: v8 provider, thresholds at 90%
- **Excludes**: node_modules, dist, test, examples, old JS files
- **Globals**: Enabled for convenient test syntax

## Code Style Guidelines

### TypeScript

- Use strict type checking
- Avoid `any` (error in src/, allowed in tests)
- Export all public types
- Provide JSDoc for public APIs

### Testing

- Descriptive test names
- AAA pattern (Arrange, Act, Assert)
- Test all code paths
- Test edge cases (null, undefined, empty strings, long strings)
- Relaxed TypeScript rules for tests (see .eslintrc.json overrides)

### Documentation

- JSDoc with examples for public APIs
- Update README for user-facing changes
- Update CHANGELOG for all releases
- Inline comments for complex logic

## CI/CD

GitHub Actions runs on all pushes and PRs:
- Tests on Node.js 18.x, 20.x, 22.x, 24.x
- Type checking
- Linting
- Build verification
- Coverage reporting

## Common Tasks

### Adding a New Feature

1. Update types in `src/types.ts` if needed
2. Implement in `src/index.ts` or new file
3. Add comprehensive tests
4. Update README with usage examples
5. Update CHANGELOG
6. Ensure all tests pass and coverage remains high

### Fixing a Bug

1. Add a failing test that reproduces the bug
2. Fix the bug
3. Ensure test passes
4. Update CHANGELOG
5. Consider if README needs updates

### Updating Dependencies

```bash
npm update              # Update within semver ranges
npm outdated           # Check for outdated packages
npm audit              # Check for security issues
npm audit fix          # Auto-fix security issues
```

**Important**: After updating isbot, test thoroughly as bot patterns may change.

## Known Considerations

### Performance

- Caching is enabled by default (recommended)
- Cache cleanup runs every 10 minutes
- Default cache size: 1000 entries
- Default TTL: 1 hour

### Security

- User agent strings limited to 2048 characters
- Input is sanitized before regex matching
- Cache is bounded with LRU eviction
- No eval() or unsafe operations

### Breaking Changes

Version 2.0 introduced breaking changes from v0.1.x:
- ESM-first (with CJS support)
- TypeScript-native
- Result location changed (`ctx.state.isBot` vs `ctx.isBot`)
- Result format changed (object vs string | null)
- Node.js >= 18.0.0 required

## Debugging Tips

### Enable Debug Logging

```typescript
app.use(koaIsBot({
  onDetection: (ctx, result) => {
    console.log('Detection:', result);
  }
}));
```

### Test Specific Bot Patterns

```typescript
import { isbot } from 'isbot';
console.log(isbot('Googlebot/2.1')); // true
```

### Check Cache State

Add temporary logging in `src/cache.ts`:
```typescript
console.log('Cache size:', this.cache.size);
```

## Future Enhancements

Potential areas for improvement:
- [ ] Add metrics/stats collection
- [ ] Support for rate limiting by bot type
- [ ] Plugin system for custom detectors
- [ ] Performance mode (skip expensive patterns)
- [ ] Bot verification (verify bot claims via DNS)

## Resources

- [isbot library](https://github.com/omrilotan/isbot) - Underlying detection
- [Koa documentation](https://koajs.com/) - Web framework
- [TypeScript handbook](https://www.typescriptlang.org/docs/)
- [Vitest docs](https://vitest.dev/) - Testing framework

## Philosophy

This project embodies the principle: **Simple things should be simple, complex things should be possible.**

- Zero config for 90% use cases
- Powerful customization for the other 10%
- Type safety without type ceremony
- Performance by default, not as an afterthought
- Security built-in, not bolted on

## Questions?

When working on this project:
1. Read the existing code to understand patterns
2. Follow the established conventions
3. Write tests for all changes
4. Update documentation
5. Keep it simple and elegant

---

*This file was created to help future AI assistants understand and maintain this project. Keep it updated as the project evolves.*
