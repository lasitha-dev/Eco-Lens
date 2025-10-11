/**
 * GoalSyncService - Advanced synchronization between local storage and server
 * Handles offline operations, conflict resolution, and background sync
 */

import { Alert, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import GoalStorageManager from './GoalStorageManager';
import SustainabilityGoalService from '../api/sustainabilityGoalService';

class GoalSyncService {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.syncQueue = [];
    this.retryCount = 0;
    this.maxRetries = 3;
    this.syncInterval = null;
    this.listeners = new Set();

    // Initialize network monitoring
    this.initNetworkMonitoring();
    this.initAppStateMonitoring();
  }

  // ================== INITIALIZATION ==================

  /**
   * Initialize the sync service
   */
  async init(userId, token) {
    this.userId = userId;
    this.token = token;
    
    // Initialize storage manager
    GoalStorageManager.init(userId);

    // Check for pending offline changes
    const offlineChanges = await GoalStorageManager.getOfflineChanges();
    const unsyncedChanges = offlineChanges.filter(change => !change.synced);

    if (unsyncedChanges.length > 0) {
      console.log(`🔄 Found ${unsyncedChanges.length} unsynced changes`);
      
      // Trigger sync if online
      if (this.isOnline) {
        setTimeout(() => this.performSync(), 1000);
      }
    }

    // Start background sync if preferences allow
    const preferences = await GoalStorageManager.getUserPreferences();
    if (preferences.autoSync) {
      this.startBackgroundSync();
    }

    console.log('✅ GoalSyncService initialized');
  }

  /**
   * Initialize network monitoring
   */
  initNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;

      if (!wasOnline && this.isOnline) {
        console.log('📡 Network restored - triggering sync');
        this.onNetworkRestored();
      } else if (wasOnline && !this.isOnline) {
        console.log('📡 Network lost - entering offline mode');
        this.onNetworkLost();
      }

      // Notify listeners
      this.notifyListeners('networkChange', { isOnline: this.isOnline });
    });
  }

  /**
   * Initialize app state monitoring
   */
  initAppStateMonitoring() {
    AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && this.isOnline) {
        // App became active and we're online - check for sync
        this.checkAndSync();
      }
    });
  }

  // ================== SYNC OPERATIONS ==================

  /**
   * Perform complete synchronization
   */
  async performSync(force = false) {
    if (this.isSyncing && !force) {
      console.log('🔄 Sync already in progress');
      return { success: false, reason: 'already_syncing' };
    }

    if (!this.isOnline) {
      console.log('📡 Cannot sync - offline');
      return { success: false, reason: 'offline' };
    }

    this.isSyncing = true;
    this.notifyListeners('syncStart');

    try {
      console.log('🔄 Starting complete sync...');

      // Step 1: Sync pending offline changes to server
      const offlineSync = await this.syncOfflineChanges();
      
      // Step 2: Fetch latest data from server
      const serverSync = await this.syncFromServer();

      // Step 3: Resolve any conflicts
      const conflictResolution = await this.resolveConflicts();

      // Step 4: Update last sync timestamp
      await GoalStorageManager.updateLastSync();

      // Step 5: Clean up synced changes
      await GoalStorageManager.clearSyncedChanges();

      const result = {
        success: true,
        offlineChanges: offlineSync,
        serverData: serverSync,
        conflicts: conflictResolution,
        timestamp: Date.now(),
      };

      console.log('✅ Sync completed successfully');
      this.retryCount = 0;
      this.notifyListeners('syncComplete', result);

      return result;

    } catch (error) {
      console.error('❌ Sync failed:', error);
      
      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying sync (${this.retryCount}/${this.maxRetries})`);
        
        setTimeout(() => {
          this.performSync(true);
        }, Math.pow(2, this.retryCount) * 1000); // Exponential backoff
      } else {
        this.retryCount = 0;
        this.notifyListeners('syncError', { error: error.message });
      }

      return { success: false, error: error.message };

    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync offline changes to server
   */
  async syncOfflineChanges() {
    const offlineChanges = await GoalStorageManager.getOfflineChanges();
    const unsyncedChanges = offlineChanges.filter(change => !change.synced);

    if (unsyncedChanges.length === 0) {
      return { processed: 0, successful: 0, failed: 0 };
    }

    console.log(`📤 Syncing ${unsyncedChanges.length} offline changes`);

    let successful = 0;
    let failed = 0;
    const failedChanges = [];
    const successfulIds = [];

    for (const change of unsyncedChanges) {
      try {
        let result;

        switch (change.type) {
          case 'create':
            result = await SustainabilityGoalService.createGoal(change.data, this.token);
            break;
          
          case 'update':
            result = await SustainabilityGoalService.updateGoal(change.goalId, change.data, this.token);
            break;
          
          case 'delete':
            result = await SustainabilityGoalService.deleteGoal(change.goalId, this.token);
            break;
          
          case 'progress_update':
            // Progress updates are typically handled automatically by the server
            // Mark as successful since it's informational
            result = { success: true };
            break;

          default:
            console.warn('Unknown change type:', change.type);
            result = { success: false, error: 'Unknown change type' };
        }

        if (result.success) {
          successful++;
          successfulIds.push(change.id);
        } else {
          failed++;
          failedChanges.push({ change, error: result.error });
        }

      } catch (error) {
        failed++;
        failedChanges.push({ change, error: error.message });
        console.error(`Failed to sync change ${change.id}:`, error);
      }
    }

    // Mark successful changes as synced
    if (successfulIds.length > 0) {
      await GoalStorageManager.markChangesSynced(successfulIds);
    }

    console.log(`📤 Offline sync complete: ${successful} successful, ${failed} failed`);

    return {
      processed: unsyncedChanges.length,
      successful,
      failed,
      failedChanges,
    };
  }

  /**
   * Sync data from server
   */
  async syncFromServer() {
    console.log('📥 Fetching latest data from server');

    try {
      // Fetch goals and stats from server
      const [goalsResponse, statsResponse] = await Promise.all([
        SustainabilityGoalService.getUserGoals(this.token),
        SustainabilityGoalService.getGoalStats(this.token),
      ]);

      if (!goalsResponse.success) {
        throw new Error(goalsResponse.error || 'Failed to fetch goals');
      }

      if (!statsResponse.success) {
        throw new Error(statsResponse.error || 'Failed to fetch stats');
      }

      // Store fresh data from server
      await GoalStorageManager.storeGoals(goalsResponse.goals, true);
      await GoalStorageManager.storeGoalStats(statsResponse.stats);

      console.log('📥 Server data synced successfully');

      return {
        goals: goalsResponse.goals.length,
        stats: !!statsResponse.stats,
      };

    } catch (error) {
      console.error('❌ Failed to sync from server:', error);
      throw error;
    }
  }

  /**
   * Resolve conflicts between local and server data
   */
  async resolveConflicts() {
    const localGoals = await GoalStorageManager.getGoals(false);
    
    if (!localGoals.cached) {
      return { conflicts: 0, resolved: 0 };
    }

    // Get fresh server data
    const serverResponse = await SustainabilityGoalService.getUserGoals(this.token);
    if (!serverResponse.success) {
      throw new Error('Failed to get server data for conflict resolution');
    }

    // Resolve conflicts using storage manager
    const resolution = GoalStorageManager.resolveConflicts(
      localGoals.data,
      serverResponse.goals
    );

    if (resolution.hasConflicts) {
      console.log(`⚠️ Found ${resolution.conflicts.length} conflicts`);
      
      // For now, auto-resolve using the resolution logic
      // In a more advanced implementation, you could show user a conflict resolution UI
      await GoalStorageManager.storeGoals(resolution.resolved, true);

      // Optionally notify user about resolved conflicts
      const preferences = await GoalStorageManager.getUserPreferences();
      if (preferences.notificationsEnabled && resolution.conflicts.length > 0) {
        Alert.alert(
          'Data Conflicts Resolved',
          `${resolution.conflicts.length} goal conflicts were automatically resolved using the most recent data.`,
          [{ text: 'OK' }]
        );
      }
    }

    return {
      conflicts: resolution.conflicts.length,
      resolved: resolution.resolved.length,
      hasConflicts: resolution.hasConflicts,
    };
  }

  // ================== BACKGROUND SYNC ==================

  /**
   * Start background sync timer
   */
  startBackgroundSync(intervalMs = 5 * 60 * 1000) { // 5 minutes default
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.checkAndSync();
      }
    }, intervalMs);

    console.log('⏰ Background sync started');
  }

  /**
   * Stop background sync
   */
  stopBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏰ Background sync stopped');
    }
  }

  /**
   * Check if sync is needed and perform if necessary
   */
  async checkAndSync() {
    const syncNeeds = await GoalStorageManager.needsSync();
    
    if (syncNeeds.needsSync) {
      console.log('🔄 Sync needed:', {
        lastSyncAge: syncNeeds.lastSyncAge,
        unsyncedChanges: syncNeeds.unsyncedChanges,
      });
      
      return this.performSync();
    }

    return { success: true, reason: 'no_sync_needed' };
  }

  // ================== OFFLINE OPERATIONS ==================

  /**
   * Create goal offline
   */
  async createGoalOffline(goalData) {
    // Generate temporary ID
    const tempId = `temp_${Date.now()}`;
    const goalWithTempId = { ...goalData, _id: tempId, createdAt: new Date().toISOString() };

    // Store locally
    const localGoals = await GoalStorageManager.getGoals(false);
    const updatedGoals = [...localGoals.data, goalWithTempId];
    await GoalStorageManager.storeGoals(updatedGoals);

    // Record offline change
    await GoalStorageManager.recordOfflineChange('create', goalData);

    console.log('📝 Goal created offline:', tempId);
    this.notifyListeners('goalCreatedOffline', goalWithTempId);

    return { success: true, goal: goalWithTempId, offline: true };
  }

  /**
   * Update goal offline
   */
  async updateGoalOffline(goalId, updateData) {
    // Update locally
    const localGoals = await GoalStorageManager.getGoals(false);
    const updatedGoals = localGoals.data.map(goal => 
      goal._id === goalId 
        ? { ...goal, ...updateData, updatedAt: new Date().toISOString() }
        : goal
    );
    
    await GoalStorageManager.storeGoals(updatedGoals);

    // Record offline change
    await GoalStorageManager.recordOfflineChange('update', updateData, goalId);

    console.log('📝 Goal updated offline:', goalId);
    this.notifyListeners('goalUpdatedOffline', { goalId, updateData });

    return { success: true, offline: true };
  }

  /**
   * Delete goal offline
   */
  async deleteGoalOffline(goalId) {
    // Remove locally
    const localGoals = await GoalStorageManager.getGoals(false);
    const updatedGoals = localGoals.data.filter(goal => goal._id !== goalId);
    
    await GoalStorageManager.storeGoals(updatedGoals);

    // Record offline change (unless it's a temp goal)
    if (!goalId.startsWith('temp_')) {
      await GoalStorageManager.recordOfflineChange('delete', null, goalId);
    }

    console.log('📝 Goal deleted offline:', goalId);
    this.notifyListeners('goalDeletedOffline', goalId);

    return { success: true, offline: true };
  }

  // ================== NETWORK EVENT HANDLERS ==================

  /**
   * Handle network restoration
   */
  async onNetworkRestored() {
    console.log('📡 Network restored - checking for sync needs');
    
    // Small delay to ensure connection is stable
    setTimeout(() => {
      this.checkAndSync();
    }, 2000);
  }

  /**
   * Handle network loss
   */
  onNetworkLost() {
    console.log('📡 Network lost - switching to offline mode');
    
    // Cancel any ongoing sync
    if (this.isSyncing) {
      this.isSyncing = false;
    }
  }

  // ================== EVENT LISTENERS ==================

  /**
   * Add event listener
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // ================== UTILITIES ==================

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      hasBackgroundSync: !!this.syncInterval,
      retryCount: this.retryCount,
    };
  }

  /**
   * Force immediate sync
   */
  async forcSync() {
    return this.performSync(true);
  }

  /**
   * Clear all local data
   */
  async clearAllData() {
    await GoalStorageManager.clearCache();
    console.log('🧹 All goal data cleared');
    this.notifyListeners('dataCleared');
  }

  /**
   * Get debug information
   */
  async getDebugInfo() {
    const storageInfo = await GoalStorageManager.getDebugInfo();
    const syncStatus = this.getSyncStatus();
    
    return {
      sync: syncStatus,
      storage: storageInfo,
      version: '1.0',
    };
  }
}

// Create singleton instance
const goalSyncService = new GoalSyncService();

export default goalSyncService;
