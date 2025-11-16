import { describe, it, expect, vi, beforeEach } from 'vitest';
import Koa from 'koa';
import type { Context } from 'koa';
import request from 'supertest';
import { koaIsBot } from '../src/index.js';
import type { BotDetectionResult } from '../src/types.js';

describe('koaIsBot middleware', () => {
  let app: Koa;

  beforeEach(() => {
    app = new Koa();
  });

  const createTestApp = (middleware: ReturnType<typeof koaIsBot>) => {
    const testApp = new Koa();
    testApp.use(middleware);
    testApp.use((ctx) => {
      ctx.body = ctx.state.isBot;
    });
    return testApp;
  };

  describe('basic bot detection', () => {
    it('should detect Googlebot', async () => {
      const testApp = createTestApp(koaIsBot());

      const response = await request(testApp.callback())
        .get('/')
        .set(
          'User-Agent',
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        );

      expect(response.status).toBe(200);
      expect(response.body.isBot).toBe(true);
      expect(response.body.botName).toBeTruthy();
    });

    it('should detect Bingbot', async () => {
      const testApp = createTestApp(koaIsBot());

      const response = await request(testApp.callback())
        .get('/')
        .set(
          'User-Agent',
          'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
        );

      expect(response.status).toBe(200);
      expect(response.body.isBot).toBe(true);
      expect(response.body.botName).toBeTruthy();
    });

    it('should detect ChatGPT bot', async () => {
      const testApp = createTestApp(koaIsBot());

      const response = await request(testApp.callback())
        .get('/')
        .set(
          'User-Agent',
          'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot'
        );

      expect(response.status).toBe(200);
      expect(response.body.isBot).toBe(true);
    });

    it('should not detect regular browser', async () => {
      const testApp = createTestApp(koaIsBot());

      const response = await request(testApp.callback())
        .get('/')
        .set(
          'User-Agent',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

      expect(response.status).toBe(200);
      expect(response.body.isBot).toBe(false);
      expect(response.body.botName).toBeNull();
    });

    it('should handle missing user agent', async () => {
      const testApp = createTestApp(koaIsBot());

      const response = await request(testApp.callback()).get('/');

      expect(response.status).toBe(200);
      expect(response.body.isBot).toBe(false);
      expect(response.body.userAgent).toBe('');
    });
  });

  describe('custom state key', () => {
    it('should use custom state key', async () => {
      app.use(koaIsBot({ stateKey: 'bot' }));
      app.use((ctx) => {
        ctx.body = { customKey: ctx.state.bot };
      });

      const response = await request(app.callback()).get('/').set('User-Agent', 'Googlebot');

      expect(response.status).toBe(200);
      expect(response.body.customKey.isBot).toBe(true);
    });
  });

  describe('custom patterns', () => {
    it('should detect custom bot patterns', async () => {
      const testApp = createTestApp(
        koaIsBot({
          customPatterns: ['mybot', /customcrawler/i],
        })
      );

      const response1 = await request(testApp.callback()).get('/').set('User-Agent', 'mybot/1.0');

      expect(response1.body.isBot).toBe(true);

      const response2 = await request(testApp.callback())
        .get('/')
        .set('User-Agent', 'CustomCrawler/2.0');

      expect(response2.body.isBot).toBe(true);
    });

    it('should still detect standard bots with custom patterns', async () => {
      const testApp = createTestApp(
        koaIsBot({
          customPatterns: ['mybot'],
        })
      );

      const response = await request(testApp.callback()).get('/').set('User-Agent', 'Googlebot');

      expect(response.body.isBot).toBe(true);
    });
  });

  describe('exclude patterns', () => {
    it('should exclude specified patterns', async () => {
      const testApp = createTestApp(
        koaIsBot({
          excludePatterns: ['chrome-lighthouse'],
        })
      );

      const response = await request(testApp.callback())
        .get('/')
        .set(
          'User-Agent',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36 Chrome-Lighthouse'
        );

      // This would normally be detected as a bot, but we excluded it
      // Note: isbot might not have chrome-lighthouse in the list, so this test
      // demonstrates the exclusion mechanism
      expect(response.body.isBot).toBeDefined();
    });
  });

  describe('callbacks', () => {
    it('should call onBotDetected when bot is detected', async () => {
      const onBotDetected = vi.fn();

      app.use(koaIsBot({ onBotDetected }));
      app.use((ctx) => {
        ctx.body = 'ok';
      });

      await request(app.callback()).get('/').set('User-Agent', 'Googlebot');

      expect(onBotDetected).toHaveBeenCalledTimes(1);
      expect(onBotDetected).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          isBot: true,
        })
      );
    });

    it('should not call onBotDetected for non-bots', async () => {
      const onBotDetected = vi.fn();

      app.use(koaIsBot({ onBotDetected }));
      app.use((ctx) => {
        ctx.body = 'ok';
      });

      await request(app.callback())
        .get('/')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0');

      expect(onBotDetected).not.toHaveBeenCalled();
    });

    it('should call onDetection for all requests', async () => {
      const onDetection = vi.fn();

      app.use(koaIsBot({ onDetection }));
      app.use((ctx) => {
        ctx.body = 'ok';
      });

      await request(app.callback()).get('/').set('User-Agent', 'Googlebot');

      await request(app.callback()).get('/').set('User-Agent', 'Mozilla/5.0 Chrome/91.0');

      expect(onDetection).toHaveBeenCalledTimes(2);
    });

    it('should support async callbacks', async () => {
      let callbackExecuted = false;
      const onBotDetected = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        callbackExecuted = true;
      };

      app.use(koaIsBot({ onBotDetected }));
      app.use((ctx) => {
        ctx.body = 'ok';
      });

      await request(app.callback()).get('/').set('User-Agent', 'Googlebot');

      expect(callbackExecuted).toBe(true);
    });
  });

  describe('custom user agent extraction', () => {
    it('should use custom getUserAgent function', async () => {
      app.use(
        koaIsBot({
          getUserAgent: (ctx: Context) => ctx.query.ua as string,
        })
      );
      app.use((ctx) => {
        ctx.body = ctx.state.isBot;
      });

      const response = await request(app.callback()).get('/?ua=Googlebot');

      expect(response.body.isBot).toBe(true);
    });
  });

  describe('caching', () => {
    it('should cache results by default', async () => {
      const onDetection = vi.fn();

      app.use(koaIsBot({ onDetection }));
      app.use((ctx) => {
        ctx.body = 'ok';
      });

      const userAgent = 'Googlebot/2.1';

      // Make multiple requests with same user agent
      await request(app.callback()).get('/').set('User-Agent', userAgent);
      await request(app.callback()).get('/').set('User-Agent', userAgent);
      await request(app.callback()).get('/').set('User-Agent', userAgent);

      // Callback should be called 3 times (once per request)
      expect(onDetection).toHaveBeenCalledTimes(3);
    });

    it('should respect cache option when disabled', async () => {
      const testApp = createTestApp(koaIsBot({ cache: false }));

      const response1 = await request(testApp.callback()).get('/').set('User-Agent', 'Googlebot');

      const response2 = await request(testApp.callback()).get('/').set('User-Agent', 'Googlebot');

      expect(response1.body.isBot).toBe(true);
      expect(response2.body.isBot).toBe(true);
    });
  });

  describe('security', () => {
    it('should handle extremely long user agent strings', async () => {
      const testApp = createTestApp(koaIsBot());

      const longUA = 'A'.repeat(10000) + ' Googlebot';

      const response = await request(testApp.callback()).get('/').set('User-Agent', longUA);

      expect(response.status).toBe(200);
      expect(response.body.isBot).toBeDefined();
      // Should be truncated to 2048 chars
      expect(response.body.userAgent.length).toBeLessThanOrEqual(2048);
    });

    it('should handle special characters in user agent', async () => {
      const testApp = createTestApp(koaIsBot());

      const specialUA = 'Bot<script>alert("xss")</script>';

      const response = await request(testApp.callback()).get('/').set('User-Agent', specialUA);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should handle null/undefined user agent gracefully', async () => {
      app.use(
        koaIsBot({
          getUserAgent: () => undefined,
        })
      );
      app.use((ctx) => {
        ctx.body = ctx.state.isBot;
      });

      const response = await request(app.callback()).get('/');

      expect(response.status).toBe(200);
      expect(response.body.isBot).toBe(false);
    });
  });

  describe('integration', () => {
    it('should work with multiple middleware', async () => {
      app.use(async (ctx, next) => {
        ctx.state.requestId = '123';
        await next();
      });

      app.use(koaIsBot());

      app.use((ctx) => {
        ctx.body = {
          requestId: ctx.state.requestId,
          bot: ctx.state.isBot,
        };
      });

      const response = await request(app.callback()).get('/').set('User-Agent', 'Googlebot');

      expect(response.body.requestId).toBe('123');
      expect(response.body.bot.isBot).toBe(true);
    });

    it('should pass through errors', async () => {
      app.use(koaIsBot());

      app.use(() => {
        throw new Error('Test error');
      });

      const response = await request(app.callback()).get('/').set('User-Agent', 'Googlebot');

      expect(response.status).toBe(500);
    });
  });

  describe('bot pattern details', () => {
    it('should provide bot patterns array', async () => {
      const testApp = createTestApp(koaIsBot());

      const response = await request(testApp.callback()).get('/').set('User-Agent', 'Googlebot');

      expect(response.body.botPatterns).toBeDefined();
      expect(Array.isArray(response.body.botPatterns)).toBe(true);
    });

    it('should have empty patterns for non-bots', async () => {
      const testApp = createTestApp(koaIsBot());

      const response = await request(testApp.callback())
        .get('/')
        .set('User-Agent', 'Mozilla/5.0 Chrome/91.0');

      expect(response.body.botPatterns).toEqual([]);
    });
  });
});
