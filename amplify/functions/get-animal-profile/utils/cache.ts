// utils/cache.ts

import { CONFIG } from './config';

/**
 * Simple in-memory LRU cache with TTL support
 */
export class Cache<K, V> {
  private cache: Map<string, { value: V, expires: number }>;
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize = CONFIG.cache.maxSize, defaultTtl = CONFIG.cache.ttl) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  get(key: K): V | undefined {
    const keyStr = JSON.stringify(key);
    const item = this.cache.get(keyStr);
    
    if (!item) return undefined;
    
    // Check if expired
    if (item.expires < Date.now()) {
      this.cache.delete(keyStr);
      return undefined;
    }
    
    // Refresh the order (LRU implementation)
    this.cache.delete(keyStr);
    this.cache.set(keyStr, item);
    
    return item.value;
  }

  set(key: K, value: V, ttl = this.defaultTtl): void {
    const keyStr = JSON.stringify(key);
  
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
  
    this.cache.set(keyStr, {
      value,
      expires: Date.now() + ttl
    });
  }

  has(key: K): boolean {
    const keyStr = JSON.stringify(key);
    const item = this.cache.get(keyStr);
    
    if (!item) return false;
    
    // Check if expired
    if (item.expires < Date.now()) {
      this.cache.delete(keyStr);
      return false;
    }
    
    return true;
  }

  delete(key: K): boolean {
    return this.cache.delete(JSON.stringify(key));
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    // Count only non-expired entries
    let count = 0;
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expires >= now) {
        count++;
      } else {
        // Clean up expired entries
        this.cache.delete(key);
      }
    }
    
    return count;
  }
}

// Create singleton instances for different cache types
export const traitCache = new Cache<string, any>();
export const animalMatchCache = new Cache<string, any>();
export const profileCache = new Cache<string, any>();
