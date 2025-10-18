/**
 * GoalStorageManager - Enhanced local storage with sync capabilities
 * Handles offline data persistence, conflict resolution, and background sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const STORAGE_KEYS = {
  GOALS: 'sustainabilityGoals',
  GOAL_STATS: 'goalStats',
  OFFLINE_CHANGES: 'offlineGoalChanges',
  LAST_SYNC: 'lastGoalSync',
  USER_PREFERENCES: 'goalUserPreferences',
  CACHE_METADATA: 'goalCacheMetadata',
};

const CACHE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OFFLINE_CHANGES = 100;

class GoalStorageManager {
  /**
   * Initialize the storage manager with user-specific keys
   */
  static init(userId) {
    this.userId = userId;
    this.storagePrefix = userId ? `user_${userId}_` : 'guest_';
  }

  /**
   * Get prefixed storage key for user-specific data
   */
  static getStorageKey(key) {
    return `${this.storagePrefix}${key}`;
  }

  // ================== BASIC STORAGE OPERATIONS ==================

  /**
   * Store goals data with metadata
   */
  static async storeGoals(goals, fromServer = false) {
    try {
      // Ensure goals is an array
      const goalsArray = Array.isArray(goals) ? goals : [];
      
      const storageData = {
        data: goalsArray,
        timestamp: Date.now(),
        fromServer,
        version: Date.now(), // Simple versioning
      };

      await AsyncStorage.setItem(
        this.getStorageKey(STORAGE_KEYS.GOALS),
        JSON.stringify(storageData)
      );

      console.log('✅ Goals stored locally:', goalsArray.length, 'items');
      return true;
    } catch (error) {
      console.error('❌ Failed to store goals:', error);
      return false;
    }
  }

  /**
   * Retrieve goals data with cache validation
   */
  static async getGoals(validateCache = true) {
    try {
      const stored = await AsyncStorage.getItem(
        this.getStorageKey(STORAGE_KEYS.GOALS)
      );

      if (!stored) {
        return { data: [], cached: false, expired: false };
      }

      const parsedData = JSON.parse(stored);
      const isExpired = validateCache && 
        (Date.now() - parsedData.timestamp > CACHE_EXPIRATION_MS);

      return {
        data: parsedData.data || [],
        cached: true,
        expired: isExpired,
        fromServer: parsedData.fromServer,
        version: parsedData.version,
        timestamp: parsedData.timestamp,
      };
    } catch (error) {
      console.error('❌ Failed to retrieve goals:', error);
      return { data: [], cached: false, expired: false };
    }
  }

  /**
   * Store goal statistics
   */
  static async storeGoalStats(stats) {
    try {
      const storageData = {
        data: stats,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        this.getStorageKey(STORAGE_KEYS.GOAL_STATS),
        JSON.stringify(storageData)
      );

      return true;
    } catch (error) {
      console.error('❌ Failed to store goal stats:', error);
      return false;
    }
  }

  /**
   * Retrieve goal statistics
   */
  static async getGoalStats() {
    try {
      const stored = await AsyncStorage.getItem(
        this.getStorageKey(STORAGE_KEYS.GOAL_STATS)
      );

      if (!stored) return null;

      const parsedData = JSON.parse(stored);
      const isExpired = Date.now() - parsedData.timestamp > CACHE_EXPIRATION_MS;

      return {
        data: parsedData.data,
        expired: isExpired,
        timestamp: parsedData.timestamp,
      };
    } catch (error) {
      console.error('❌ Failed to retrieve goal stats:', error);
      return null;
    }
  }

  // ================== OFFLINE CHANGE TRACKING ==================

  /**
   * Record an offline change for later sync
   */
  static async recordOfflineChange(changeType, data, goalId = null) {
    try {
      const existingChanges = await this.getOfflineChanges();
      
      // Prevent too many offline changes
      if (existingChanges.length >= MAX_OFFLINE_CHANGES) {
        console.warn('⚠️ Max offline changes reached, removing oldest');
        existingChanges.shift(); // Remove oldest change
      }

      const change = {
        id: Date.now().toString(),
        type: changeType, // 'create', 'update', 'delete', 'progress_update'
        data,
        goalId,
        timestamp: Date.now(),
        synced: false,
      };

      existingChanges.push(change);

      await AsyncStorage.setItem(
        this.getStorageKey(STORAGE_KEYS.OFFLINE_CHANGES),
        JSON.stringify(existingChanges)
      );

      console.log('📝 Offline change recorded:', changeType, goalId);
      return change.id;
    } catch (error) {
      console.error('❌ Failed to record offline change:', error);
      return null;
    }
  }

  /**
   * Get all pending offline changes
   */
  static async getOfflineChanges() {
    try {
      const stored = await AsyncStorage.getItem(
        this.getStorageKey(STORAGE_KEYS.OFFLINE_CHANGES)
      );

      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to get offline changes:', error);
      return [];
    }
  }

  /**
   * Mark offline changes as synced
   */
  static async markChangesSynced(changeIds) {
    try {
      const changes = await this.getOfflineChanges();
      const updatedChanges = changes.map(change => 
        changeIds.includes(change.id) 
          ? { ...change, synced: true, syncedAt: Date.now() }
          : change
      );

      await AsyncStorage.setItem(
        this.getStorageKey(STORAGE_KEYS.OFFLINE_CHANGES),
        JSON.stringify(updatedChanges)
      );

      console.log('✅ Marked changes as synced:', changeIds.length);
      return true;
    } catch (error) {
      console.error('❌ Failed to mark changes as synced:', error);
      return false;
    }
  }

  /**
   * Clear synced offline changes (cleanup)
   */
  static async clearSyncedChanges() {
    try {
      const changes = await this.getOfflineChanges();
      const unsyncedChanges = changes.filter(change => !change.synced);

      await AsyncStorage.setItem(
        this.getStorageKey(STORAGE_KEYS.OFFLINE_CHANGES),
        JSON.stringify(unsyncedChanges)
      );

      const clearedCount = changes.length - unsyncedChanges.length;
      if (clearedCount > 0) {
        console.log('🧹 Cleared synced changes:', clearedCount);
      }

      return clearedCount;
    } catch (error) {
      console.error('❌ Failed to clear synced changes:', error);
      return 0;
    }
  }

  // ================== SYNC MANAGEMENT ==================

  /**
   * Update last sync timestamp
   */
  static async updateLastSync() {
    try {
      const syncData = {
        timestamp: Date.now(),
        version: '1.0',
      };

      await AsyncStorage.setItem(
        this.getStorageKey(STORAGE_KEYS.LAST_SYNC),
        JSON.stringify(syncData)
      );

      return true;
    } catch (error) {
      console.error('❌ Failed to update last sync:', error);
      return false;
    }
  }

  /**
   * Get last sync information
   */
  static async getLastSync() {
    try {
      const stored = await AsyncStorage.getItem(
        this.getStorageKey(STORAGE_KEYS.LAST_SYNC)
      );

      if (!stored) return null;

      return JSON.parse(stored);
    } catch (error) {
      console.error('❌ Failed to get last sync:', error);
      return null;
    }
  }

  /**
   * Check if data needs sync (has been too long since last sync)
   */
  static async needsSync(maxAge = 30 * 60 * 1000) { // 30 minutes default
    try {
      const lastSync = await this.getLastSync();
      const offlineChanges = await this.getOfflineChanges();
      const unsyncedChanges = offlineChanges.filter(change => !change.synced);

      // Need sync if: no previous sync, too old, or has unsynced changes
      const needsSync = !lastSync || 
        (Date.now() - lastSync.timestamp > maxAge) ||
        unsyncedChanges.length > 0;

      return {
        needsSync,
        lastSyncAge: lastSync ? Date.now() - lastSync.timestamp : null,
        unsyncedChanges: unsyncedChanges.length,
      };
    } catch (error) {
      console.error('❌ Failed to check sync needs:', error);
      return { needsSync: true, lastSyncAge: null, unsyncedChanges: 0 };
    }
  }

  // ================== USER PREFERENCES ==================

  /**
   * Store user preferences for goals
   */
  static async storeUserPreferences(preferences) {
    try {
      await AsyncStorage.setItem(
        this.getStorageKey(STORAGE_KEYS.USER_PREFERENCES),
        JSON.stringify({
          data: preferences,
          timestamp: Date.now(),
        })
      );

      return true;
    } catch (error) {
      console.error('❌ Failed to store user preferences:', error);
      return false;
    }
  }

  /**
   * Get user preferences for goals
   */
  static async getUserPreferences() {
    try {
      const stored = await AsyncStorage.getItem(
        this.getStorageKey(STORAGE_KEYS.USER_PREFERENCES)
      );

      if (!stored) {
        return {
          autoSync: true,
          animationsEnabled: true,
          notificationsEnabled: true,
          cacheExpiration: CACHE_EXPIRATION_MS,
        };
      }

      return JSON.parse(stored).data;
    } catch (error) {
      console.error('❌ Failed to get user preferences:', error);
      return {
        autoSync: true,
        animationsEnabled: true,
        notificationsEnabled: true,
        cacheExpiration: CACHE_EXPIRATION_MS,
      };
    }
  }

  // ================== CACHE MANAGEMENT ==================

  /**
   * Clear all goal-related cache
   */
  static async clearCache() {
    try {
      const keys = Object.values(STORAGE_KEYS).map(key => this.getStorageKey(key));
      await AsyncStorage.multiRemove(keys);

      console.log('🧹 Goal cache cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Get cache size and metadata
   */
  static async getCacheInfo() {
    try {
      const info = {};
      const keys = Object.values(STORAGE_KEYS);

      for (const key of keys) {
        const stored = await AsyncStorage.getItem(this.getStorageKey(key));
        info[key] = {
          exists: !!stored,
          size: stored ? stored.length : 0,
          sizeKB: stored ? Math.round(stored.length / 1024 * 100) / 100 : 0,
        };
      }

      const totalSize = Object.values(info).reduce((sum, item) => sum + item.size, 0);

      return {
        ...info,
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
      };
    } catch (error) {
      console.error('❌ Failed to get cache info:', error);
      return {};
    }
  }

  // ================== CONFLICT RESOLUTION ==================

  /**
   * Resolve conflicts between local and server data
   */
  static resolveConflicts(localGoals, serverGoals) {
    const resolved = [];
    const conflicts = [];

    // Create lookup maps
    const localMap = new Map(localGoals.map(goal => [goal._id, goal]));
    const serverMap = new Map(serverGoals.map(goal => [goal._id, goal]));

    // Check all goals from both sources
    const allIds = new Set([...localMap.keys(), ...serverMap.keys()]);

    for (const id of allIds) {
      const localGoal = localMap.get(id);
      const serverGoal = serverMap.get(id);

      if (!localGoal) {
        // Server-only goal (new from server)
        resolved.push(serverGoal);
      } else if (!serverGoal) {
        // Local-only goal (created offline)
        resolved.push(localGoal);
      } else {
        // Both exist - check for conflicts
        const localUpdated = new Date(localGoal.updatedAt || localGoal.createdAt).getTime();
        const serverUpdated = new Date(serverGoal.updatedAt || serverGoal.createdAt).getTime();

        if (this.hasSignificantDifferences(localGoal, serverGoal)) {
          conflicts.push({
            id,
            local: localGoal,
            server: serverGoal,
            localNewer: localUpdated > serverUpdated,
          });

          // Use newer version for now (can be enhanced with user choice)
          resolved.push(localUpdated > serverUpdated ? localGoal : serverGoal);
        } else {
          // No significant conflicts, use server version
          resolved.push(serverGoal);
        }
      }
    }

    return {
      resolved,
      conflicts,
      hasConflicts: conflicts.length > 0,
    };
  }

  /**
   * Check if two goals have significant differences
   */
  static hasSignificantDifferences(goal1, goal2) {
    // Check key fields that matter for conflicts
    const keyFields = ['title', 'goalType', 'goalConfig', 'isActive'];
    
    for (const field of keyFields) {
      if (JSON.stringify(goal1[field]) !== JSON.stringify(goal2[field])) {
        return true;
      }
    }

    return false;
  }

  // ================== DEBUGGING & UTILITIES ==================

  /**
   * Get storage debug info
   */
  static async getDebugInfo() {
    try {
      const cacheInfo = await this.getCacheInfo();
      const lastSync = await this.getLastSync();
      const offlineChanges = await this.getOfflineChanges();
      const userPreferences = await this.getUserPreferences();

      return {
        userId: this.userId,
        storagePrefix: this.storagePrefix,
        cacheInfo,
        lastSync,
        offlineChanges: {
          total: offlineChanges.length,
          unsynced: offlineChanges.filter(c => !c.synced).length,
        },
        userPreferences,
        constants: {
          CACHE_EXPIRATION_MS,
          MAX_OFFLINE_CHANGES,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get debug info:', error);
      return { error: error.message };
    }
  }
}

export default GoalStorageManager;
