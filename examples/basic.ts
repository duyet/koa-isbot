/**
 * Basic usage example of @duyetdev/koa-isbot
 *
 * This example demonstrates the simplest way to integrate bot detection
 * into your Koa application with zero configuration.
 */

import Koa from 'koa';
import { koaIsBot } from '../src/index.js';

const app = new Koa();

// Add bot detection middleware
app.use(koaIsBot());

// Use the bot detection result in your routes
app.use((ctx) => {
  const botInfo = ctx.state.isBot;

  if (botInfo?.isBot) {
    // Bot detected - serve optimized content
    ctx.body = {
      message: 'Bot detected',
      bot: botInfo.botName,
      userAgent: botInfo.userAgent,
      note: 'Serving pre-rendered static content for better performance',
    };
  } else {
    // Regular user - serve dynamic content
    ctx.body = {
      message: 'Welcome, human!',
      userAgent: botInfo?.userAgent,
      note: 'Serving dynamic personalized content',
    };
  }
});

const PORT = process.env['PORT'] || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('\nTry these examples:');
  console.log(`  curl http://localhost:${PORT} -A "Googlebot"`);
  console.log(`  curl http://localhost:${PORT} -A "Mozilla/5.0"`);
});

export default app;
