import type { BotDetectionResult, CacheEntry } from './types.js';

/**
 * Simple LRU cache with TTL support
 * Optimized for bot detection results
 */
export class BotDetectionCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 1000, ttl = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Get a cached result if available and not expired
   */
  get(userAgent: string): BotDetectionResult | null {
    const entry = this.cache.get(userAgent);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(userAgent);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(userAgent);
    this.cache.set(userAgent, entry);

    return entry.result;
  }

  /**
   * Store a detection result in cache
   */
  set(userAgent: string, result: BotDetectionResult): void {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(userAgent, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
