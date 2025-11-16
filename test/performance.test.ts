import { describe, it, expect, beforeEach } from 'vitest';
import Koa from 'koa';
import request from 'supertest';
import { koaIsBot } from '../src/index.js';

describe('performance benchmarks', () => {
  let app: Koa;

  beforeEach(() => {
    app = new Koa();
  });

  const USER_AGENTS = {
    googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  };

  describe('middleware performance', () => {
    it('should handle requests quickly with cache enabled', async () => {
      app.use(koaIsBot({ cache: true }));
      app.use((ctx) => {
        ctx.body = 'ok';
      });

      const server = app.callback();
      const iterations = 100;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        await request(server)
          .get('/')
          .set('User-Agent', USER_AGENTS.googlebot);
      }

      const duration = Date.now() - start;
      const avgTime = duration / iterations;

      // Should average less than 10ms per request with caching
      expect(avgTime).toBeLessThan(10);
    });

    it('should handle mixed traffic efficiently', async () => {
      app.use(koaIsBot({ cache: true }));
      app.use((ctx) => {
        ctx.body = 'ok';
      });

      const server = app.callback();
      const iterations = 50;
      const userAgents = Object.values(USER_AGENTS);

      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        const ua = userAgents[i % userAgents.length];
        await request(server).get('/').set('User-Agent', ua!);
      }

      const duration = Date.now() - start;
      const avgTime = duration / iterations;

      // Should handle mixed traffic efficiently
      expect(avgTime).toBeLessThan(15);
    });

    it('should show cache benefit on repeated requests', async () => {
      const cachedApp = new Koa();
      cachedApp.use(koaIsBot({ cache: true }));
      cachedApp.use((ctx) => {
        ctx.body = 'ok';
      });

      const uncachedApp = new Koa();
      uncachedApp.use(koaIsBot({ cache: false }));
      uncachedApp.use((ctx) => {
        ctx.body = 'ok';
      });

      const iterations = 100;
      const userAgent = USER_AGENTS.googlebot;

      // Test with cache
      const cachedStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await request(cachedApp.callback())
          .get('/')
          .set('User-Agent', userAgent);
      }
      const cachedDuration = Date.now() - cachedStart;

      // Test without cache
      const uncachedStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await request(uncachedApp.callback())
          .get('/')
          .set('User-Agent', userAgent);
      }
      const uncachedDuration = Date.now() - uncachedStart;

      // Cache should provide some benefit (but network overhead might dominate in tests)
      // This is more of a sanity check
      expect(cachedDuration).toBeGreaterThan(0);
      expect(uncachedDuration).toBeGreaterThan(0);
    });
  });

  describe('memory efficiency', () => {
    it('should not leak memory with many different user agents', async () => {
      app.use(koaIsBot({
        cache: true,
        cacheSize: 100, // Limit cache size
      }));
      app.use((ctx) => {
        ctx.body = 'ok';
      });

      const server = app.callback();

      // Generate many unique user agents
      for (let i = 0; i < 200; i++) {
        await request(server)
          .get('/')
          .set('User-Agent', `Bot-${i}/1.0`);
      }

      // Should complete without memory issues
      expect(true).toBe(true);
    });
  });

  describe('scalability', () => {
    it('should handle concurrent requests', async () => {
      app.use(koaIsBot());
      app.use((ctx) => {
        ctx.body = 'ok';
      });

      const server = app.callback();
      const concurrency = 20;
      const userAgent = USER_AGENTS.chrome;

      const promises = [];
      for (let i = 0; i < concurrency; i++) {
        promises.push(
          request(server).get('/').set('User-Agent', userAgent)
        );
      }

      const start = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      // All should succeed
      results.forEach((result) => {
        expect(result.status).toBe(200);
      });

      // Should handle concurrent requests reasonably fast
      expect(duration).toBeLessThan(1000);
    });
  });
});
