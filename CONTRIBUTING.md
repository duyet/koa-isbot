# Contributing to koa-isbot

Thank you for your interest in contributing to koa-isbot! This document provides guidelines and instructions for contributing.

## 🎯 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Environment details** (Node.js version, OS, etc.)
- **Code samples** if applicable

Example:

```markdown
**Bug**: Bot not detected for specific user agent

**Steps to reproduce**:
1. Install koa-isbot v2.0.0
2. Use middleware with default config
3. Send request with user agent: "MySpecificBot/1.0"

**Expected**: Bot should be detected
**Actual**: Bot is not detected

**Environment**: Node.js 20.0.0, Ubuntu 22.04
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why is this enhancement needed?
- **Proposed solution** - how should it work?
- **Alternative solutions** you've considered
- **Examples** or mockups if applicable

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Add/update tests as needed
5. Ensure all tests pass
6. Update documentation
7. Commit your changes with descriptive messages
8. Push to your fork
9. Open a Pull Request

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Setup Instructions

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/koa-isbot.git
cd koa-isbot

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Development Workflow

```bash
# Watch mode for development
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format

# Run all checks before committing
npm run build && npm test && npm run lint
```

## 📝 Coding Standards

### TypeScript

- Use **strict TypeScript** settings
- Provide **type annotations** for function parameters and returns
- Avoid `any` type unless absolutely necessary
- Use **interfaces** for object shapes
- Export types for public API

Example:

```typescript
// Good
export function detectBot(userAgent: string): BotDetectionResult {
  // ...
}

// Bad
export function detectBot(userAgent) {
  // ...
}
```

### Code Style

We use **ESLint** and **Prettier** for code consistency:

- **Semicolons**: Required
- **Quotes**: Single quotes
- **Indentation**: 2 spaces
- **Line length**: 100 characters max
- **Trailing commas**: ES5 style

Run `npm run format` to automatically format your code.

### Naming Conventions

- **Functions**: camelCase (`detectBot`, `createCache`)
- **Classes**: PascalCase (`BotDetectionCache`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_OPTIONS`)
- **Interfaces/Types**: PascalCase (`BotDetectionResult`)
- **Files**: kebab-case (`bot-detector.ts`)

### Comments and Documentation

- Use **JSDoc** for public APIs
- Include **examples** in JSDoc when helpful
- Write **clear inline comments** for complex logic
- Update **README.md** for user-facing changes

Example:

```typescript
/**
 * Detects if a user agent string belongs to a bot
 *
 * @param userAgent - The user agent string to analyze
 * @returns Detection result with bot information
 *
 * @example
 * ```typescript
 * const result = detectBot('Googlebot/2.1');
 * console.log(result.isBot); // true
 * console.log(result.botName); // 'googlebot'
 * ```
 */
export function detectBot(userAgent: string): BotDetectionResult {
  // ...
}
```

## 🧪 Testing Guidelines

### Writing Tests

- Write tests for **all new features**
- Update tests for **modified features**
- Aim for **high coverage** (target: 90%+)
- Use **descriptive test names**
- Follow **AAA pattern** (Arrange, Act, Assert)

Example:

```typescript
describe('BotDetectionCache', () => {
  describe('get', () => {
    it('should return cached value if not expired', () => {
      // Arrange
      const cache = new BotDetectionCache(100, 1000);
      const result = { isBot: true, botName: 'googlebot' };
      cache.set('test-ua', result);

      // Act
      const retrieved = cache.get('test-ua');

      // Assert
      expect(retrieved).toEqual(result);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx vitest run test/cache.test.ts
```

### Test Coverage

- Maintain **> 90% coverage** for:
  - Lines
  - Functions
  - Branches
  - Statements

Check coverage with: `npm run test:coverage`

## 📋 Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```
feat(cache): add TTL support for cache entries

Add configurable TTL (time-to-live) for cache entries to
automatically expire old values.

Closes #123
```

```
fix(middleware): handle null user agent correctly

Previously, null user agents caused an error. Now they are
treated as non-bot requests.

Fixes #456
```

## 🔄 Pull Request Process

1. **Update documentation** if needed (README, CHANGELOG, etc.)
2. **Update tests** to cover your changes
3. **Ensure all tests pass**: `npm test`
4. **Ensure linting passes**: `npm run lint`
5. **Update CHANGELOG.md** under "Unreleased" section
6. **Request review** from maintainers

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe the testing you've done

## Checklist
- [ ] Tests pass locally
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

## 🐛 Debugging Tips

### Enable Debug Output

```typescript
// Add console.log in middleware
app.use(koaIsBot({
  onDetection: (ctx, result) => {
    console.log('Detection:', result);
  }
}));
```

### Test Individual Components

```typescript
// Test cache separately
import { BotDetectionCache } from './src/cache';

const cache = new BotDetectionCache();
// ... test cache
```

### Run Tests for Specific Features

```bash
# Run only cache tests
npx vitest run test/cache.test.ts

# Run with debugging
node --inspect-brk node_modules/.bin/vitest run
```

## 📚 Additional Resources

- [Koa Documentation](https://koajs.com/)
- [isbot Library](https://github.com/omrilotan/isbot)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

## 💬 Questions?

- Open a [Discussion](https://github.com/duyetdev/koa-isbot/discussions)
- Check [existing issues](https://github.com/duyetdev/koa-isbot/issues)
- Read the [README](README.md)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

- **Be respectful** of differing opinions and experiences
- **Be collaborative** and help others
- **Be professional** in all interactions
- **Accept constructive criticism** gracefully

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes for significant contributions
- CHANGELOG.md credits

Thank you for contributing to koa-isbot! 🚀
