interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // in milliseconds
}

export class EnhancedCacheService {
  private static cache: Map<string, CacheItem<unknown>> = new Map();
  private static persistentStorageKey = 'app_cache_data';
  private static maxCacheItems = 100; // Prevent cache from growing too large
  
  // Initialize cache from localStorage if available
  static initialize(): void {
    try {
      const savedCache = localStorage.getItem(this.persistentStorageKey);
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        
        // Convert the parsed object back to a Map
        Object.entries(parsed).forEach(([key, item]) => {
          this.cache.set(key, item as CacheItem<unknown>);
        });
        
        // Clean expired items
        this.cleanExpiredItems();
        console.log(`Cache initialized with ${this.cache.size} items`);
      }
    } catch (error) {
      console.error('Failed to initialize cache from localStorage', error);
      // If initialization fails, start with empty cache
      this.cache.clear();
    }
  }
  
  // Save cache to localStorage for persistence
  static persistCache(): void {
    try {
      // Convert Map to object for JSON serialization
      const cacheObj = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.persistentStorageKey, JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Failed to persist cache to localStorage', error);
    }
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - item.timestamp > item.expiresIn) {
      this.invalidate(key);
      return null;
    }

    return item.data as T;
  }

  static set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    // Manage cache size - remove oldest items if needed
    if (this.cache.size >= this.maxCacheItems) {
      this.removeOldestItems(5); // Remove 5 oldest items
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
    
    // Attempt to persist to localStorage
    this.persistCache();
  }

  static invalidate(key: string): void {
    this.cache.delete(key);
    this.persistCache();
  }

  static invalidateAll(): void {
    this.cache.clear();
    localStorage.removeItem(this.persistentStorageKey);
  }
  
  static ensureUniqueIds<T extends Array<{id?: string | number}>>(data: T, idField: string = 'id'): T {
    // Create a Set to track seen IDs
    const seenIds = new Set<string | number>();
    const uniqueData = data.filter(item => {
      const itemId = item[idField as keyof typeof item];
      
      // Skip items without IDs
      if (itemId === undefined || itemId === null) {
        console.warn('Item without ID found in array', item);
        return true;
      }
      
      // Check if we've seen this ID before
      if (seenIds.has(itemId)) {
        console.warn(`Duplicate ID detected: ${itemId}. Item excluded from results.`, item);
        return false;
      }
      
      // Add ID to seen set and keep the item
      seenIds.add(itemId);
      return true;
    });
    
    return uniqueData as T;
  }
  
  // Remove expired items to free up memory
  static cleanExpiredItems(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiresIn) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      console.log(`Cleaned ${expiredCount} expired cache items`);
    }
  }
  
  // Remove oldest items from cache to prevent it from growing too large
  private static removeOldestItems(count: number): void {
    // Convert to array, sort by timestamp, and get the oldest items
    const cacheEntries = Array.from(this.cache.entries());
    cacheEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove the oldest items
    const itemsToRemove = cacheEntries.slice(0, count);
    itemsToRemove.forEach(([key]) => {
      this.cache.delete(key);
    });
    
    console.log(`Removed ${itemsToRemove.length} oldest items from cache`);
  }
  
  // Get cache stats
  static getStats(): { size: number, oldestTimestamp: number | null, newestTimestamp: number | null } {
    let oldestTimestamp = null;
    let newestTimestamp = null;
    
    if (this.cache.size > 0) {
      const timestamps = Array.from(this.cache.values()).map(item => item.timestamp);
      oldestTimestamp = Math.min(...timestamps);
      newestTimestamp = Math.max(...timestamps);
    }
    
    return {
      size: this.cache.size,
      oldestTimestamp,
      newestTimestamp
    };
  }
}

// Initialize cache when the module is imported
if (typeof window !== 'undefined') { // Check if we're in a browser environment
  EnhancedCacheService.initialize();
  
  // Set up event listener to save cache before page unload
  window.addEventListener('beforeunload', () => {
    EnhancedCacheService.persistCache();
  });
  
  // Clean expired items periodically
  setInterval(() => {
    EnhancedCacheService.cleanExpiredItems();
  }, 60000); // Check every minute
}