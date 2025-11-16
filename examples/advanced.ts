/**
 * Advanced usage example of @duyetdev/koa-isbot
 *
 * This example demonstrates advanced features including:
 * - Custom bot patterns
 * - Excluded patterns
 * - Custom state key
 * - Callback hooks for logging/analytics
 * - Custom user agent extraction
 * - Performance optimization with caching
 */

import Koa from 'koa';
import { koaIsBot } from '../src/index.js';
import type { BotDetectionResult } from '../src/types.js';

const app = new Koa();

// Analytics tracking (simulated)
const analytics = {
  botVisits: new Map<string, number>(),
  totalRequests: 0,
  botRequests: 0,

  trackVisit(result: BotDetectionResult) {
    this.totalRequests++;
    if (result.isBot) {
      this.botRequests++;
      const count = this.botVisits.get(result.botName || 'unknown') || 0;
      this.botVisits.set(result.botName || 'unknown', count + 1);
    }
  },

  getStats() {
    return {
      totalRequests: this.totalRequests,
      botRequests: this.botRequests,
      humanRequests: this.totalRequests - this.botRequests,
      botPercentage: ((this.botRequests / this.totalRequests) * 100).toFixed(2) + '%',
      topBots: Array.from(this.botVisits.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  },
};

// Configure advanced bot detection
app.use(
  koaIsBot({
    // Add custom bot patterns for company-specific crawlers
    customPatterns: ['my-internal-bot', /company-crawler/i, 'monitoring-service'],

    // Exclude Google Lighthouse from being treated as a bot
    // (useful if you want to see real performance scores)
    excludePatterns: ['chrome-lighthouse'],

    // Store result in custom state key for better organization
    stateKey: 'bot',

    // Enable caching for better performance
    cache: true,
    cacheSize: 1000,
    cacheTTL: 3600000, // 1 hour

    // Log all detections for analytics
    onDetection: async (ctx, result) => {
      analytics.trackVisit(result);

      // You could also send to analytics service
      // await analyticsService.track('bot_detection', {
      //   isBot: result.isBot,
      //   botName: result.botName,
      //   path: ctx.path,
      // });
    },

    // Special handling for detected bots
    onBotDetected: async (ctx, result) => {
      // Log bot visits
      console.log(`🤖 Bot detected: ${result.botName} on ${ctx.path}`);

      // Set custom headers for bot responses
      ctx.set('X-Bot-Detected', result.botName || 'true');
      ctx.set('Cache-Control', 'public, max-age=3600');

      // You could also:
      // - Track in database
      // - Send alerts for suspicious patterns
      // - Serve from CDN/cache
      // - Apply rate limiting
    },

    // Custom user agent extraction (e.g., from proxy headers)
    getUserAgent: (ctx) => {
      // Check for user agent in custom header first
      const customUA = ctx.get('X-Original-User-Agent');
      if (customUA) return customUA;

      // Fall back to standard header
      return ctx.get('User-Agent') || '';
    },
  })
);

// Request logging middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;

  const botInfo = ctx.state.bot;
  const logPrefix = botInfo?.isBot ? '🤖' : '👤';

  console.log(`${logPrefix} ${ctx.method} ${ctx.path} - ${duration}ms`);
});

// Serve different content based on bot detection
app.use((ctx) => {
  const botInfo = ctx.state.bot;

  if (ctx.path === '/stats') {
    // Analytics endpoint
    ctx.body = analytics.getStats();
    return;
  }

  if (botInfo?.isBot) {
    // Bot-optimized response
    ctx.body = {
      title: 'My Awesome Site',
      description: 'Pre-rendered content for search engines and crawlers',
      content: 'Optimized static HTML content here...',
      detectedAs: botInfo.botName,
      patterns: botInfo.botPatterns,
      cached: true,
    };
  } else {
    // Human-optimized response with dynamic content
    ctx.body = {
      title: 'My Awesome Site',
      description: 'Interactive experience for human visitors',
      content: 'Dynamic personalized content here...',
      features: ['real-time updates', 'personalization', 'interactive UI'],
      session: 'new-session-123',
    };
  }
});

// Error handling
app.on('error', (err, ctx) => {
  console.error('Server error:', err, ctx);
});

const PORT = process.env['PORT'] || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Advanced bot detection server running on http://localhost:${PORT}`);
  console.log('\nEndpoints:');
  console.log(`  GET /       - Main content (varies by bot detection)`);
  console.log(`  GET /stats  - Analytics dashboard`);
  console.log('\nTry these examples:');
  console.log(`  curl http://localhost:${PORT} -A "Googlebot"`);
  console.log(`  curl http://localhost:${PORT} -A "Mozilla/5.0 Chrome/91.0"`);
  console.log(`  curl http://localhost:${PORT} -A "my-internal-bot"`);
  console.log(`  curl http://localhost:${PORT}/stats`);
});

export default app;
