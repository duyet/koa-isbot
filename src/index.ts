import { isbot, isbotMatch, isbotMatches, createIsbotFromList, isbotPatterns, list } from 'isbot';
import type { Context, Next } from 'koa';
import { BotDetectionCache } from './cache.js';
import type {
  BotDetectionResult,
  KoaIsBotMiddleware,
  KoaIsBotOptions,
  KoaContextWithBot,
} from './types.js';

// Export types for consumers
export type {
  BotDetectionResult,
  KoaIsBotOptions,
  KoaContextWithBot,
  KoaIsBotMiddleware,
} from './types.js';

/**
 * Default options for the middleware
 */
const DEFAULT_OPTIONS: Required<Omit<KoaIsBotOptions, 'onBotDetected' | 'onDetection'>> = {
  customPatterns: [],
  excludePatterns: [],
  stateKey: 'isBot',
  cache: true,
  cacheSize: 1000,
  cacheTTL: 3600000, // 1 hour
  getUserAgent: (ctx: Context) => ctx.request.headers['user-agent'] || '',
};

/**
 * Creates a Koa middleware for bot detection using the isbot library
 *
 * @param options - Configuration options for the middleware
 * @returns Koa middleware function
 *
 * @example
 * Basic usage:
 * ```typescript
 * import Koa from 'koa';
 * import { koaIsBot } from '@duyetdev/koa-isbot';
 *
 * const app = new Koa();
 * app.use(koaIsBot());
 *
 * app.use((ctx) => {
 *   if (ctx.state.isBot?.isBot) {
 *     console.log(`Bot detected: ${ctx.state.isBot.botName}`);
 *   }
 * });
 * ```
 *
 * @example
 * With custom configuration:
 * ```typescript
 * app.use(koaIsBot({
 *   customPatterns: ['mybot', /customcrawler/i],
 *   excludePatterns: ['chrome-lighthouse'],
 *   stateKey: 'bot',
 *   cache: true,
 *   onBotDetected: (ctx, result) => {
 *     console.log('Bot visit:', result.botName);
 *   }
 * }));
 * ```
 */
export function koaIsBot(options: KoaIsBotOptions = {}): KoaIsBotMiddleware {
  // Merge with default options
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Initialize cache if enabled
  const cache = config.cache ? new BotDetectionCache(config.cacheSize, config.cacheTTL) : null;

  // Create custom isbot detector if needed
  let customIsBot = isbot;
  let customIsbotMatch = isbotMatch;
  let customIsbotMatches = isbotMatches;

  if (config.customPatterns.length > 0 || config.excludePatterns.length > 0) {
    let patterns = [...list];

    // Add custom patterns
    if (config.customPatterns.length > 0) {
      const customStrings = config.customPatterns.map((p) => (p instanceof RegExp ? p.source : p));
      patterns = [...patterns, ...customStrings];
    }

    // Remove excluded patterns
    if (config.excludePatterns.length > 0) {
      const patternsToRemove = new Set(
        config.excludePatterns.flatMap((pattern) => isbotPatterns(pattern))
      );
      patterns = patterns.filter((p) => !patternsToRemove.has(p));
    }

    // Create custom detector
    const baseCustomIsBot = createIsbotFromList(patterns);
    customIsBot = (ua?: string | null): boolean => baseCustomIsBot(ua || '');

    // Create custom match functions
    const customPattern = new RegExp(patterns.join('|'), 'i');
    customIsbotMatch = (ua?: string | null): string | null => {
      if (!ua) return null;
      const match = ua.toLowerCase().match(customPattern);
      return match?.[0] ?? null;
    };
    customIsbotMatches = (ua?: string | null): string[] => {
      if (!ua) return [];
      const matches = ua.toLowerCase().match(new RegExp(customPattern, 'gi'));
      return matches ?? [];
    };
  }

  // Periodic cache cleanup (every 10 minutes)
  if (cache) {
    const cleanupInterval = setInterval(() => {
      cache.cleanup();
    }, 600000);

    // Don't keep the process alive for this interval
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }

  /**
   * Detect bot from user agent string
   */
  const detectBot = (userAgent: string): BotDetectionResult => {
    // Security: Validate and sanitize input
    const sanitizedUA = String(userAgent || '').slice(0, 2048); // Limit length to prevent DoS

    const detected = customIsBot(sanitizedUA);
    const botName = customIsbotMatch(sanitizedUA);
    const botPatterns = customIsbotMatches(sanitizedUA);

    return {
      isBot: detected,
      botName,
      botPatterns,
      userAgent: sanitizedUA,
    };
  };

  /**
   * The middleware function
   */
  return async (ctx: Context, next: Next): Promise<void> => {
    // Extract user agent
    const userAgent = config.getUserAgent(ctx);

    if (!userAgent) {
      // No user agent, assume not a bot
      (ctx.state as KoaContextWithBot['state'])[config.stateKey] = {
        isBot: false,
        botName: null,
        botPatterns: [],
        userAgent: '',
      };
      await next();
      return;
    }

    // Check cache first
    let result: BotDetectionResult | null = null;
    if (cache) {
      result = cache.get(userAgent);
    }

    // Detect if not in cache
    if (!result) {
      result = detectBot(userAgent);

      // Store in cache
      if (cache) {
        cache.set(userAgent, result);
      }
    }

    // Store result in context state
    (ctx.state as KoaContextWithBot['state'])[config.stateKey] = result;

    // Call callbacks if provided
    if (options.onDetection) {
      await options.onDetection(ctx, result);
    }

    if (result.isBot && options.onBotDetected) {
      await options.onBotDetected(ctx, result);
    }

    await next();
  };
}

/**
 * Default export for convenience
 */
export default koaIsBot;

/**
 * Re-export useful isbot functions for advanced usage
 */
export { isbot, isbotMatch, isbotMatches, createIsbotFromList, list as isbotPatternList };
