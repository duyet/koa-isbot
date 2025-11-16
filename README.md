# koa-isbot

[![Node.js CI](https://github.com/duyetdev/koa-isbot/workflows/Node.js%20Package/badge.svg)](https://github.com/duyetdev/koa-isbot/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern Koa middleware for intelligent bot detection using the industry-standard [isbot](https://github.com/omrilotan/isbot) library. Detect search engines, crawlers, AI bots (ChatGPT, Claude, Perplexity), and thousands of other bots with TypeScript support and zero configuration.

## ✨ Features

- 🤖 **Comprehensive Bot Detection** - Detects thousands of bots including Google, Bing, ChatGPT, Claude, Perplexity, and more
- 📦 **Zero Config** - Works out of the box with sensible defaults
- 🎯 **TypeScript First** - Full type safety and IntelliSense support
- ⚡ **High Performance** - Built-in caching and optimizations
- 🔧 **Highly Customizable** - Extend detection with custom patterns
- 🛡️ **Security Hardened** - Input validation and DoS protection
- 📊 **Analytics Friendly** - Callbacks for tracking and logging
- 🌳 **Tree-shakeable** - ESM and CJS support with optimal bundling
- ✅ **Battle Tested** - 100% test coverage with Vitest

## 📥 Installation

```bash
npm install @duyetdev/koa-isbot
```

## 🚀 Quick Start

```typescript
import Koa from 'koa';
import { koaIsBot } from '@duyetdev/koa-isbot';

const app = new Koa();

// Add the middleware
app.use(koaIsBot());

// Use bot detection in your routes
app.use((ctx) => {
  if (ctx.state.isBot?.isBot) {
    console.log(`Bot detected: ${ctx.state.isBot.botName}`);
    // Serve static pre-rendered content
  } else {
    // Serve dynamic content
  }
});

app.listen(3000);
```

## 📖 API Documentation

### `koaIsBot(options?)`

Creates a Koa middleware for bot detection.

#### Options

```typescript
interface KoaIsBotOptions {
  /**
   * Custom bot patterns to add to detection
   * @example ['mybot', /customcrawler/i]
   */
  customPatterns?: (string | RegExp)[];

  /**
   * Patterns to exclude from bot detection
   * @example ['chrome-lighthouse']
   */
  excludePatterns?: string[];

  /**
   * Where to store the detection result in Koa context
   * @default 'isBot'
   */
  stateKey?: string;

  /**
   * Enable result caching for performance
   * @default true
   */
  cache?: boolean;

  /**
   * Maximum cache size (number of entries)
   * @default 1000
   */
  cacheSize?: number;

  /**
   * Cache TTL in milliseconds
   * @default 3600000 (1 hour)
   */
  cacheTTL?: number;

  /**
   * Callback when a bot is detected
   */
  onBotDetected?: (ctx: Context, result: BotDetectionResult) => void | Promise<void>;

  /**
   * Callback for all requests
   */
  onDetection?: (ctx: Context, result: BotDetectionResult) => void | Promise<void>;

  /**
   * Custom user agent extraction function
   * @default (ctx) => ctx.request.headers['user-agent']
   */
  getUserAgent?: (ctx: Context) => string | undefined;
}
```

#### Detection Result

The bot detection result is stored in `ctx.state.isBot` (or custom `stateKey`):

```typescript
interface BotDetectionResult {
  /** Whether a bot was detected */
  isBot: boolean;

  /** Name of the detected bot */
  botName: string | null;

  /** All detected bot patterns */
  botPatterns: string[];

  /** The user agent string analyzed */
  userAgent: string;
}
```

## 💡 Usage Examples

### Basic Usage

```typescript
import Koa from 'koa';
import { koaIsBot } from '@duyetdev/koa-isbot';

const app = new Koa();
app.use(koaIsBot());

app.use((ctx) => {
  const { isBot, botName } = ctx.state.isBot;

  ctx.body = isBot
    ? `Hello ${botName}! Here's your optimized content.`
    : 'Hello human! Welcome to our site.';
});
```

### Custom Bot Patterns

Add detection for your own bots or crawlers:

```typescript
app.use(koaIsBot({
  customPatterns: [
    'my-internal-bot',
    /company-crawler/i,
    'monitoring-service'
  ]
}));
```

### Exclude Specific Bots

Exclude certain bots from detection (e.g., Lighthouse for performance testing):

```typescript
app.use(koaIsBot({
  excludePatterns: ['chrome-lighthouse']
}));
```

### Analytics & Logging

Track bot visits for analytics:

```typescript
app.use(koaIsBot({
  onBotDetected: async (ctx, result) => {
    console.log(`🤖 Bot visit: ${result.botName} on ${ctx.path}`);

    // Send to analytics
    await analytics.track('bot_visit', {
      bot: result.botName,
      path: ctx.path,
      timestamp: new Date()
    });
  },

  onDetection: async (ctx, result) => {
    // Track all requests (bots and humans)
    await analytics.track('page_view', {
      isBot: result.isBot,
      path: ctx.path
    });
  }
}));
```

### Custom State Key

Store the result in a custom location:

```typescript
app.use(koaIsBot({ stateKey: 'bot' }));

app.use((ctx) => {
  if (ctx.state.bot?.isBot) {
    // Access via custom key
  }
});
```

### Performance Optimization

Configure caching for high-traffic applications:

```typescript
app.use(koaIsBot({
  cache: true,
  cacheSize: 5000,    // Store up to 5000 unique user agents
  cacheTTL: 7200000   // 2 hours cache lifetime
}));
```

### SEO Optimization

Serve pre-rendered content to search engines:

```typescript
app.use(koaIsBot());

app.use(async (ctx) => {
  if (ctx.state.isBot?.isBot) {
    // Serve pre-rendered HTML for SEO
    ctx.body = await prerenderService.getPage(ctx.path);
    ctx.set('Cache-Control', 'public, max-age=3600');
  } else {
    // Serve SPA for humans
    ctx.body = await fs.readFile('index.html');
  }
});
```

### Custom User Agent Extraction

Extract user agent from custom headers (useful with proxies):

```typescript
app.use(koaIsBot({
  getUserAgent: (ctx) => {
    // Check custom header from proxy
    return ctx.get('X-Original-User-Agent') ||
           ctx.get('User-Agent') ||
           '';
  }
}));
```

## 🤖 Detected Bots

This middleware uses [isbot](https://github.com/omrilotan/isbot) which detects thousands of bots including:

**Search Engines:**
- Googlebot, Bingbot, Yandex, Baidu, DuckDuckBot
- Yahoo Slurp, Exabot, and many more

**AI Assistants & Crawlers:**
- ChatGPT-User, GPTBot (OpenAI)
- Claude-Web (Anthropic)
- PerplexityBot
- Applebot, Facebookbot

**Social Media:**
- TwitterBot, LinkedInBot, TelegramBot
- SlackBot, PinterestBot, WhatsApp

**Development & Monitoring:**
- Postman, curl, wget
- Pingdom, UptimeRobot, StatusCake
- Chrome Lighthouse (optional)

**And thousands more!** See the [full list](https://github.com/omrilotan/isbot#bots).

## 🔄 Migration from v0.1.x

Version 2.0 is a complete rewrite with breaking changes. Here's how to migrate:

### Before (v0.1.x)

```javascript
const isBot = require('koa-isbot');

app.use(isBot());

app.use(async (ctx, next) => {
  console.log(ctx.isBot); // 'googlebot' or null
});
```

### After (v2.0)

```typescript
import { koaIsBot } from '@duyetdev/koa-isbot';

app.use(koaIsBot());

app.use((ctx) => {
  console.log(ctx.state.isBot); // BotDetectionResult object
  // {
  //   isBot: true,
  //   botName: 'googlebot',
  //   botPatterns: ['googlebot'],
  //   userAgent: '...'
  // }
});
```

### Key Changes

- **ES Modules**: Now uses ESM (with CJS support)
- **TypeScript**: Full TypeScript support with types
- **Result Location**: Moved from `ctx.isBot` to `ctx.state.isBot`
- **Result Format**: Now returns detailed object instead of string/null
- **Detection**: Uses isbot library (thousands of patterns vs. 15)
- **Features**: Added caching, callbacks, customization

## 🏗️ Advanced Example

See [examples/advanced.ts](./examples/advanced.ts) for a complete example with:
- Custom patterns and exclusions
- Analytics integration
- Performance monitoring
- Different content serving
- Error handling

```bash
# Run the advanced example
npm install
npm run build
node examples/advanced.ts
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format
```

## 📊 Performance

- **Cached requests**: < 1ms overhead
- **Uncached requests**: < 5ms overhead
- **Memory**: Automatic LRU cache eviction
- **Security**: Input sanitization and length limits

## 🔒 Security

- User agent strings are limited to 2048 characters to prevent DoS
- Input is sanitized before regex matching
- Cache size is bounded with LRU eviction
- No eval() or unsafe operations

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

## 📝 License

MIT License - Copyright (c) 2016-2025 Van-Duyet Le

See [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Built on top of [isbot](https://github.com/omrilotan/isbot) by Omri Lotan
- Inspired by the original koa-isbot concept
- TypeScript types for [Koa](https://koajs.com/)

## 📮 Support

- 🐛 [Report bugs](https://github.com/duyetdev/koa-isbot/issues)
- 💬 [Ask questions](https://github.com/duyetdev/koa-isbot/discussions)
- ⭐ Star the repo if you find it useful!

## 🔗 Related Projects

- [isbot](https://github.com/omrilotan/isbot) - The underlying bot detection library
- [Koa](https://koajs.com/) - Next generation web framework for Node.js
- [koa-useragent](https://github.com/rvboris/koa-useragent) - User agent parser for Koa

---

Made with ❤️ by [Van-Duyet Le](https://github.com/duyetdev)
