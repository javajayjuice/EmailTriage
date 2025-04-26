interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // in milliseconds
}

export class CacheService {
  private static cache: Map<string, CacheItem<unknown>> = new Map();

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - item.timestamp > item.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  static set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  static invalidate(key: string): void {
    this.cache.delete(key);
  }

  static invalidateAll(): void {
    this.cache.clear();
  }
  
  // Add this new method to ensure array data has unique IDs
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
}