'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isbot = require('isbot');

// src/index.ts

// src/cache.ts
var BotDetectionCache = class {
  cache;
  maxSize;
  ttl;
  constructor(maxSize = 1e3, ttl = 36e5) {
    this.cache = /* @__PURE__ */ new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  /**
   * Get a cached result if available and not expired
   */
  get(userAgent) {
    const entry = this.cache.get(userAgent);
    if (!entry) {
      return null;
    }
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(userAgent);
      return null;
    }
    this.cache.delete(userAgent);
    this.cache.set(userAgent, entry);
    return entry.result;
  }
  /**
   * Store a detection result in cache
   */
  set(userAgent, result) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== void 0) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(userAgent, {
      result,
      timestamp: Date.now()
    });
  }
  /**
   * Clear all cached entries
   */
  clear() {
    this.cache.clear();
  }
  /**
   * Get current cache size
   */
  get size() {
    return this.cache.size;
  }
  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
};

// src/index.ts
var DEFAULT_OPTIONS = {
  customPatterns: [],
  excludePatterns: [],
  stateKey: "isBot",
  cache: true,
  cacheSize: 1e3,
  cacheTTL: 36e5,
  // 1 hour
  getUserAgent: (ctx) => ctx.request.headers["user-agent"] || ""
};
function koaIsBot(options = {}) {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  const cache = config.cache ? new BotDetectionCache(config.cacheSize, config.cacheTTL) : null;
  let customIsBot = isbot.isbot;
  let customIsbotMatch = isbot.isbotMatch;
  let customIsbotMatches = isbot.isbotMatches;
  if (config.customPatterns.length > 0 || config.excludePatterns.length > 0) {
    let patterns = [...isbot.list];
    if (config.customPatterns.length > 0) {
      const customStrings = config.customPatterns.map((p) => p instanceof RegExp ? p.source : p);
      patterns = [...patterns, ...customStrings];
    }
    if (config.excludePatterns.length > 0) {
      const patternsToRemove = new Set(
        config.excludePatterns.flatMap((pattern) => isbot.isbotPatterns(pattern))
      );
      patterns = patterns.filter((p) => !patternsToRemove.has(p));
    }
    const baseCustomIsBot = isbot.createIsbotFromList(patterns);
    customIsBot = (ua) => baseCustomIsBot(ua || "");
    const customPattern = new RegExp(patterns.join("|"), "i");
    customIsbotMatch = (ua) => {
      if (!ua) return null;
      const match = ua.toLowerCase().match(customPattern);
      return match?.[0] ?? null;
    };
    customIsbotMatches = (ua) => {
      if (!ua) return [];
      const matches = ua.toLowerCase().match(new RegExp(customPattern, "gi"));
      return matches ?? [];
    };
  }
  if (cache) {
    const cleanupInterval = setInterval(() => {
      cache.cleanup();
    }, 6e5);
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }
  const detectBot = (userAgent) => {
    const sanitizedUA = String(userAgent || "").slice(0, 2048);
    const detected = customIsBot(sanitizedUA);
    const botName = customIsbotMatch(sanitizedUA);
    const botPatterns = customIsbotMatches(sanitizedUA);
    return {
      isBot: detected,
      botName,
      botPatterns,
      userAgent: sanitizedUA
    };
  };
  return async (ctx, next) => {
    const userAgent = config.getUserAgent(ctx);
    if (!userAgent) {
      ctx.state[config.stateKey] = {
        isBot: false,
        botName: null,
        botPatterns: [],
        userAgent: ""
      };
      await next();
      return;
    }
    let result = null;
    if (cache) {
      result = cache.get(userAgent);
    }
    if (!result) {
      result = detectBot(userAgent);
      if (cache) {
        cache.set(userAgent, result);
      }
    }
    ctx.state[config.stateKey] = result;
    if (options.onDetection) {
      await options.onDetection(ctx, result);
    }
    if (result.isBot && options.onBotDetected) {
      await options.onBotDetected(ctx, result);
    }
    await next();
  };
}
var index_default = koaIsBot;

Object.defineProperty(exports, "createIsbotFromList", {
  enumerable: true,
  get: function () { return isbot.createIsbotFromList; }
});
Object.defineProperty(exports, "isbot", {
  enumerable: true,
  get: function () { return isbot.isbot; }
});
Object.defineProperty(exports, "isbotMatch", {
  enumerable: true,
  get: function () { return isbot.isbotMatch; }
});
Object.defineProperty(exports, "isbotMatches", {
  enumerable: true,
  get: function () { return isbot.isbotMatches; }
});
Object.defineProperty(exports, "isbotPatternList", {
  enumerable: true,
  get: function () { return isbot.list; }
});
exports.default = index_default;
exports.koaIsBot = koaIsBot;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map