/**
 * Memoized Sustainability Goal Service
 * Provides caching and memoization wrapper around SustainabilityGoalService
 * Optimizes API calls with intelligent caching strategies
 */

import SustainabilityGoalService from './sustainabilityGoalService';

class MemoizedSustainabilityGoalService {
  constructor() {
    // Cache configurations
    this.cache = new Map();
    this.cacheExpiration = new Map();
    this.defaultCacheDuration = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 100;
    
    // Cache hit/miss tracking for performance monitoring
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };

    // Memoized method cache
    this.memoizedMethods = new Map();
    
    // Request deduplication cache
    this.pendingRequests = new Map();
  }

  /**
   * Generate cache key from method and arguments
   */
  generateCacheKey(method, args) {
    const argsString = JSON.stringify(args);
    return `${method}:${argsString}`;
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  isValidCacheEntry(key) {
    const expiration = this.cacheExpiration.get(key);
    return expiration && Date.now() < expiration;
  }

  /**
   * Get from cache with validity check
   */
  getFromCache(key) {
    if (this.cache.has(key) && this.isValidCacheEntry(key)) {
      this.cacheStats.hits++;
      return this.cache.get(key);
    }
    
    // Remove expired entry
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.cacheExpiration.delete(key);
    }
    
    this.cacheStats.misses++;
    return null;
  }

  /**
   * Set cache with LRU eviction policy
   */
  setCache(key, value, duration = this.defaultCacheDuration) {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.cacheExpiration.delete(oldestKey);
      this.cacheStats.evictions++;
    }

    this.cache.set(key, value);
    this.cacheExpiration.set(key, Date.now() + duration);
  }

  /**
   * Create memoized version of an async method with request deduplication
   */
  memoizeMethod(methodName, originalMethod, cacheDuration = this.defaultCacheDuration) {
    return async (...args) => {
      const cacheKey = this.generateCacheKey(methodName, args);
      
      // Check cache first
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        console.log(`📋 Cache hit for ${methodName}`);
        return cachedResult;
      }

      // Check for pending request (deduplication)
      if (this.pendingRequests.has(cacheKey)) {
        console.log(`⏳ Deduplicating request for ${methodName}`);
        return await this.pendingRequests.get(cacheKey);
      }

      // Execute method and cache result
      console.log(`🌐 Cache miss for ${methodName} - fetching from API`);
      const requestPromise = originalMethod.apply(SustainabilityGoalService, args);
      this.pendingRequests.set(cacheKey, requestPromise);

      try {
        const result = await requestPromise;
        
        // Only cache successful results
        if (result && !result.error) {
          this.setCache(cacheKey, result, cacheDuration);
        }
        
        return result;
      } catch (error) {
        // Don't cache errors
        throw error;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    };
  }

  /**
   * Initialize memoized methods
   */
  init() {
    // Cache durations based on data volatility
    const cacheConfig = {
      getUserGoals: 2 * 60 * 1000,        // 2 minutes - frequently updated
      getGoalStats: 5 * 60 * 1000,        // 5 minutes - moderately updated  
      getGoalProgress: 1 * 60 * 1000,     // 1 minute - frequently updated
      checkProductMeetsGoals: 10 * 60 * 1000, // 10 minutes - relatively stable
      generateGoalDescription: 30 * 60 * 1000, // 30 minutes - very stable
      validateGoalConfig: 30 * 60 * 1000,     // 30 minutes - very stable
      getGoalProgressColor: 60 * 60 * 1000,   // 1 hour - very stable
      getGoalProgressStatus: 60 * 60 * 1000,  // 1 hour - very stable
      assessGoalDifficulty: 30 * 60 * 1000,   // 30 minutes - stable
    };

    // Create memoized versions of read-only methods
    Object.keys(cacheConfig).forEach(methodName => {
      if (typeof SustainabilityGoalService[methodName] === 'function') {
        this[methodName] = this.memoizeMethod(
          methodName,
          SustainabilityGoalService[methodName],
          cacheConfig[methodName]
        );
      }
    });

    // Non-cached write methods (pass through directly)
    const writeMethods = [
      'createGoal', 'updateGoal', 'deleteGoal', 'trackPurchase'
    ];

    writeMethods.forEach(methodName => {
      if (typeof SustainabilityGoalService[methodName] === 'function') {
        this[methodName] = async (...args) => {
          const result = await SustainabilityGoalService[methodName].apply(
            SustainabilityGoalService, 
            args
          );
          
          // Invalidate related cache entries after write operations
          this.invalidateRelatedCache(methodName);
          
          return result;
        };
      }
    });

    console.log('✅ MemoizedSustainabilityGoalService initialized');
  }

  /**
   * Invalidate cache entries related to write operations
   */
  invalidateRelatedCache(writeMethod) {
    const invalidationPatterns = {
      createGoal: ['getUserGoals', 'getGoalStats'],
      updateGoal: ['getUserGoals', 'getGoalStats', 'getGoalProgress'],
      deleteGoal: ['getUserGoals', 'getGoalStats'],
      trackPurchase: ['getUserGoals', 'getGoalStats', 'getGoalProgress'],
    };

    const patterns = invalidationPatterns[writeMethod] || [];
    let invalidatedCount = 0;

    patterns.forEach(pattern => {
      for (const [key] of this.cache) {
        if (key.startsWith(pattern + ':')) {
          this.cache.delete(key);
          this.cacheExpiration.delete(key);
          invalidatedCount++;
        }
      }
    });

    if (invalidatedCount > 0) {
      console.log(`🧹 Invalidated ${invalidatedCount} cache entries for ${writeMethod}`);
    }
  }

  /**
   * Advanced memoized methods with additional optimization
   */

  /**
   * Batch get multiple goals with single cache lookup
   */
  async batchGetGoals(goalIds, token) {
    const cacheKey = this.generateCacheKey('batchGetGoals', [goalIds, token]);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Get all user goals and filter for requested IDs
      const allGoals = await this.getUserGoals(token);
      const requestedGoals = allGoals.filter(goal => goalIds.includes(goal._id));
      
      const result = {
        success: true,
        goals: requestedGoals,
        found: requestedGoals.length,
        requested: goalIds.length,
      };

      this.setCache(cacheKey, result, 2 * 60 * 1000); // 2 minutes
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Memoized product alignment check with batch optimization
   */
  async checkMultipleProductsAlignment(products, activeGoals) {
    const cacheKey = this.generateCacheKey('checkMultipleProductsAlignment', [
      products.map(p => p.id || p._id),
      activeGoals.map(g => g._id)
    ]);

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const results = products.map(product => ({
        productId: product.id || product._id,
        alignment: SustainabilityGoalService.checkProductMeetsGoals(product, activeGoals)
      }));

      const result = {
        success: true,
        alignments: results,
        processed: products.length,
      };

      this.setCache(cacheKey, result, 5 * 60 * 1000); // 5 minutes
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Memoized progress calculations with batch support
   */
  async batchCalculateProgress(goals, purchaseHistory, options = {}) {
    const cacheKey = this.generateCacheKey('batchCalculateProgress', [
      goals.map(g => g._id),
      purchaseHistory.length, // Use count instead of full data for cache key
      options
    ]);

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const progressMap = SustainabilityGoalService.batchCalculateProgress(
        goals, 
        purchaseHistory, 
        options
      );

      // Convert Map to serializable object
      const result = {
        success: true,
        progress: Object.fromEntries(progressMap),
        calculated: goals.length,
      };

      this.setCache(cacheKey, result, 3 * 60 * 1000); // 3 minutes
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all cache
   */
  clearCache() {
    const size = this.cache.size;
    this.cache.clear();
    this.cacheExpiration.clear();
    this.pendingRequests.clear();
    
    console.log(`🧹 Cleared cache: ${size} entries removed`);
    
    // Reset stats
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  /**
   * Get cache statistics for performance monitoring
   */
  getCacheStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : '0.00';
    
    return {
      ...this.cacheStats,
      total,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmupCache(token) {
    if (!token) return;

    console.log('🔥 Warming up cache...');
    
    try {
      // Pre-load frequently accessed data
      await Promise.all([
        this.getUserGoals(token),
        this.getGoalStats(token),
      ]);
      
      console.log('✅ Cache warmed up successfully');
    } catch (error) {
      console.warn('⚠️ Cache warmup failed:', error);
    }
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      cacheStats: this.getCacheStats(),
      cacheKeys: Array.from(this.cache.keys()),
      pendingRequests: Array.from(this.pendingRequests.keys()),
      config: {
        maxCacheSize: this.maxCacheSize,
        defaultCacheDuration: this.defaultCacheDuration,
      },
    };
  }
}

// Create singleton instance
const memoizedGoalService = new MemoizedSustainabilityGoalService();
memoizedGoalService.init();

export default memoizedGoalService;
