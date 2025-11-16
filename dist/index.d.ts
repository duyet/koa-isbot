export { createIsbotFromList, isbot, isbotMatch, isbotMatches, list as isbotPatternList } from 'isbot';
import { Context, Middleware } from 'koa';

/**
 * Bot detection result containing information about the detected bot
 */
interface BotDetectionResult {
    /**
     * Whether a bot was detected
     */
    isBot: boolean;
    /**
     * The name/pattern of the detected bot (if any)
     * @example 'googlebot', 'bingbot', 'chatgpt-user'
     */
    botName: string | null;
    /**
     * All detected bot patterns (if multiple match)
     */
    botPatterns: string[];
    /**
     * The user agent string that was analyzed
     */
    userAgent: string;
}
/**
 * Options for customizing the bot detection middleware
 */
interface KoaIsBotOptions {
    /**
     * Custom bot patterns to add to detection
     * Can be strings or RegExp patterns
     * @example ['mybot', /customcrawler/i]
     */
    customPatterns?: (string | RegExp)[];
    /**
     * Patterns to exclude from bot detection
     * Useful for allowlisting specific user agents
     * @example ['chrome-lighthouse']
     */
    excludePatterns?: string[];
    /**
     * Where to store the detection result in Koa context
     * @default 'isBot' (stored in ctx.state.isBot)
     */
    stateKey?: string;
    /**
     * Enable result caching for performance
     * Caches results by user agent string
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
     * Callback function called when a bot is detected
     * Useful for logging or custom handling
     */
    onBotDetected?: (ctx: Context, result: BotDetectionResult) => void | Promise<void>;
    /**
     * Callback function called for all requests
     * Useful for analytics
     */
    onDetection?: (ctx: Context, result: BotDetectionResult) => void | Promise<void>;
    /**
     * Custom user agent extraction function
     * By default, uses ctx.request.headers['user-agent']
     */
    getUserAgent?: (ctx: Context) => string | undefined;
}
/**
 * Extended Koa context with bot detection result
 */
interface KoaContextWithBot extends Context {
    state: Context['state'] & {
        /**
         * Bot detection result (key name can be customized via options.stateKey)
         */
        isBot?: BotDetectionResult;
        [key: string]: unknown;
    };
}
/**
 * Type for the middleware function
 */
type KoaIsBotMiddleware = Middleware<KoaContextWithBot>;

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
declare function koaIsBot(options?: KoaIsBotOptions): KoaIsBotMiddleware;

export { type BotDetectionResult, type KoaContextWithBot, type KoaIsBotMiddleware, type KoaIsBotOptions, koaIsBot as default, koaIsBot };
