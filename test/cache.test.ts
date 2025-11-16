import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BotDetectionCache } from '../src/cache.js';
import type { BotDetectionResult } from '../src/types.js';

describe('BotDetectionCache', () => {
  let cache: BotDetectionCache;

  beforeEach(() => {
    cache = new BotDetectionCache(3, 1000); // Small cache for testing
  });

  const createResult = (isBot: boolean, botName: string | null): BotDetectionResult => ({
    isBot,
    botName,
    botPatterns: botName ? [botName] : [],
    userAgent: 'test',
  });

  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      const result = createResult(true, 'googlebot');
      cache.set('test-ua', result);

      const retrieved = cache.get('test-ua');
      expect(retrieved).toEqual(result);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = cache.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should update size correctly', () => {
      expect(cache.size).toBe(0);

      cache.set('ua1', createResult(true, 'googlebot'));
      expect(cache.size).toBe(1);

      cache.set('ua2', createResult(true, 'bingbot'));
      expect(cache.size).toBe(2);
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entry when max size is reached', () => {
      cache.set('ua1', createResult(true, 'googlebot'));
      cache.set('ua2', createResult(true, 'bingbot'));
      cache.set('ua3', createResult(true, 'slackbot'));

      expect(cache.size).toBe(3);

      // Adding 4th item should evict ua1
      cache.set('ua4', createResult(true, 'twitterbot'));

      expect(cache.size).toBe(3);
      expect(cache.get('ua1')).toBeNull();
      expect(cache.get('ua2')).not.toBeNull();
      expect(cache.get('ua3')).not.toBeNull();
      expect(cache.get('ua4')).not.toBeNull();
    });

    it('should move accessed items to end (LRU behavior)', () => {
      cache.set('ua1', createResult(true, 'googlebot'));
      cache.set('ua2', createResult(true, 'bingbot'));
      cache.set('ua3', createResult(true, 'slackbot'));

      // Access ua1 to move it to end
      cache.get('ua1');

      // Adding ua4 should evict ua2 (oldest after ua1 was accessed)
      cache.set('ua4', createResult(true, 'twitterbot'));

      expect(cache.get('ua1')).not.toBeNull();
      expect(cache.get('ua2')).toBeNull();
      expect(cache.get('ua3')).not.toBeNull();
      expect(cache.get('ua4')).not.toBeNull();
    });
  });

  describe('TTL expiration', () => {
    it('should return null for expired entries', () => {
      vi.useFakeTimers();

      const result = createResult(true, 'googlebot');
      cache.set('test-ua', result);

      // Advance time beyond TTL
      vi.advanceTimersByTime(1001);

      const retrieved = cache.get('test-ua');
      expect(retrieved).toBeNull();

      vi.useRealTimers();
    });

    it('should return valid entries within TTL', () => {
      vi.useFakeTimers();

      const result = createResult(true, 'googlebot');
      cache.set('test-ua', result);

      // Advance time but stay within TTL
      vi.advanceTimersByTime(500);

      const retrieved = cache.get('test-ua');
      expect(retrieved).toEqual(result);

      vi.useRealTimers();
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries during cleanup', () => {
      vi.useFakeTimers();

      cache.set('ua1', createResult(true, 'googlebot'));
      cache.set('ua2', createResult(true, 'bingbot'));

      // Advance time to expire ua1
      vi.advanceTimersByTime(500);

      cache.set('ua3', createResult(true, 'slackbot'));

      // Advance time to expire ua1 and ua2
      vi.advanceTimersByTime(600);

      expect(cache.size).toBe(3);

      cache.cleanup();

      expect(cache.size).toBe(1);
      expect(cache.get('ua1')).toBeNull();
      expect(cache.get('ua2')).toBeNull();
      expect(cache.get('ua3')).not.toBeNull();

      vi.useRealTimers();
    });

    it('should not remove valid entries during cleanup', () => {
      cache.set('ua1', createResult(true, 'googlebot'));
      cache.set('ua2', createResult(true, 'bingbot'));

      cache.cleanup();

      expect(cache.size).toBe(2);
      expect(cache.get('ua1')).not.toBeNull();
      expect(cache.get('ua2')).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('ua1', createResult(true, 'googlebot'));
      cache.set('ua2', createResult(true, 'bingbot'));
      cache.set('ua3', createResult(true, 'slackbot'));

      expect(cache.size).toBe(3);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('ua1')).toBeNull();
      expect(cache.get('ua2')).toBeNull();
      expect(cache.get('ua3')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle cache size of 1', () => {
      const smallCache = new BotDetectionCache(1, 1000);

      smallCache.set('ua1', createResult(true, 'googlebot'));
      expect(smallCache.size).toBe(1);

      smallCache.set('ua2', createResult(true, 'bingbot'));
      expect(smallCache.size).toBe(1);
      expect(smallCache.get('ua1')).toBeNull();
      expect(smallCache.get('ua2')).not.toBeNull();
    });

    it('should handle zero TTL', () => {
      vi.useFakeTimers();

      const zeroTTLCache = new BotDetectionCache(10, 0);
      zeroTTLCache.set('ua1', createResult(true, 'googlebot'));

      // Any time advancement should expire
      vi.advanceTimersByTime(1);

      expect(zeroTTLCache.get('ua1')).toBeNull();

      vi.useRealTimers();
    });
  });
});
