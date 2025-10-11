/**
 * Integrated Offline Goal Manager
 * Combines all offline goal creation/update capabilities with sync service
 * Provides a unified interface for offline-first goal management
 */

import { Alert } from 'react-native';
import GoalStorageManager from '../utils/GoalStorageManager';
import goalSyncService from '../utils/GoalSyncService';
import memoizedGoalService from '../api/memoizedSustainabilityGoalService';
import SustainabilityGoalService from '../api/sustainabilityGoalService';

class IntegratedOfflineGoalManager {
  constructor() {
    this.isInitialized = false;
    this.eventListeners = new Set();
    this.operationQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Initialize the integrated goal manager
   */
  async init(userId, token) {
    if (this.isInitialized) return;

    this.userId = userId;
    this.token = token;

    // Initialize storage manager
    GoalStorageManager.init(userId);

    // Initialize sync service
    await goalSyncService.init(userId, token);

    // Listen to sync service events
    this.syncUnsubscribe = goalSyncService.addListener(this.handleSyncEvents.bind(this));

    // Process any queued operations
    this.processOperationQueue();

    this.isInitialized = true;
    this.notifyListeners('initialized', { userId, token });

    console.log('✅ IntegratedOfflineGoalManager initialized');
  }

  /**
   * Handle sync service events
   */
  handleSyncEvents(event, data) {
    switch (event) {
      case 'syncComplete':
        this.notifyListeners('syncComplete', data);
        // Clear successful operations from queue
        this.clearProcessedoperations(data);
        break;
      
      case 'syncError':
        this.notifyListeners('syncError', data);
        break;
      
      case 'networkChange':
        if (data.isOnline) {
          // Network restored - process queue
          this.processOperationQueue();
        }
        this.notifyListeners('networkChange', data);
        break;
      
      case 'goalCreatedOffline':
      case 'goalUpdatedOffline':
      case 'goalDeletedOffline':
        this.notifyListeners('offlineChange', { event, data });
        break;
    }
  }

  /**
   * Create a goal with offline-first approach
   */
  async createGoal(goalData, options = {}) {
    const { 
      optimistic = true, 
      showNotification = true,
      retryOnFailure = true 
    } = options;

    const operationId = Date.now().toString();
    const operation = {
      id: operationId,
      type: 'create',
      data: goalData,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: retryOnFailure ? 3 : 0,
    };

    try {
      // Check if online
      const syncStatus = goalSyncService.getSyncStatus();
      
      if (syncStatus.isOnline && !optimistic) {
        // Online and not optimistic - try server first
        try {
          const result = await SustainabilityGoalService.createGoal(goalData, this.token);
          
          if (result.success) {
            // Success - update local cache
            await this.refreshLocalGoals();
            
            if (showNotification) {
              this.showSuccessNotification('Goal created successfully!');
            }
            
            this.notifyListeners('goalCreated', { goal: result.goal, online: true });
            return { success: true, goal: result.goal, offline: false };
          }
        } catch (error) {
          console.log('Server creation failed, falling back to offline mode:', error);
        }
      }

      // Offline or server failed - create offline
      const result = await goalSyncService.createGoalOffline(goalData);
      
      if (result.success) {
        // Add to operation queue for later sync
        this.operationQueue.push(operation);
        
        if (showNotification) {
          this.showOfflineNotification('Goal created offline. Will sync when online.');
        }
        
        this.notifyListeners('goalCreated', { goal: result.goal, offline: true });
        return result;
      }

      throw new Error('Failed to create goal offline');

    } catch (error) {
      console.error('Error creating goal:', error);
      
      if (showNotification) {
        Alert.alert('Error', `Failed to create goal: ${error.message}`);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a goal with offline-first approach
   */
  async updateGoal(goalId, updateData, options = {}) {
    const { 
      optimistic = true, 
      showNotification = true,
      retryOnFailure = true 
    } = options;

    const operationId = Date.now().toString();
    const operation = {
      id: operationId,
      type: 'update',
      goalId,
      data: updateData,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: retryOnFailure ? 3 : 0,
    };

    try {
      const syncStatus = goalSyncService.getSyncStatus();
      
      if (syncStatus.isOnline && !optimistic) {
        // Try server first
        try {
          const result = await SustainabilityGoalService.updateGoal(goalId, updateData, this.token);
          
          if (result.success) {
            await this.refreshLocalGoals();
            
            if (showNotification) {
              this.showSuccessNotification('Goal updated successfully!');
            }
            
            this.notifyListeners('goalUpdated', { goalId, updateData, online: true });
            return { success: true, online: false };
          }
        } catch (error) {
          console.log('Server update failed, falling back to offline mode:', error);
        }
      }

      // Update offline
      const result = await goalSyncService.updateGoalOffline(goalId, updateData);
      
      if (result.success) {
        this.operationQueue.push(operation);
        
        if (showNotification) {
          this.showOfflineNotification('Goal updated offline. Will sync when online.');
        }
        
        this.notifyListeners('goalUpdated', { goalId, updateData, offline: true });
        return result;
      }

      throw new Error('Failed to update goal offline');

    } catch (error) {
      console.error('Error updating goal:', error);
      
      if (showNotification) {
        Alert.alert('Error', `Failed to update goal: ${error.message}`);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a goal with offline-first approach
   */
  async deleteGoal(goalId, options = {}) {
    const { 
      optimistic = true, 
      showNotification = true,
      retryOnFailure = true,
      confirmDeletion = true,
    } = options;

    // Confirm deletion if requested
    if (confirmDeletion) {
      const confirmed = await new Promise((resolve) => {
        Alert.alert(
          'Delete Goal',
          'Are you sure you want to delete this goal? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });

      if (!confirmed) {
        return { success: false, error: 'User cancelled deletion' };
      }
    }

    const operationId = Date.now().toString();
    const operation = {
      id: operationId,
      type: 'delete',
      goalId,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: retryOnFailure ? 3 : 0,
    };

    try {
      const syncStatus = goalSyncService.getSyncStatus();
      
      if (syncStatus.isOnline && !optimistic) {
        // Try server first
        try {
          const result = await SustainabilityGoalService.deleteGoal(goalId, this.token);
          
          if (result.success) {
            await this.refreshLocalGoals();
            
            if (showNotification) {
              this.showSuccessNotification('Goal deleted successfully!');
            }
            
            this.notifyListeners('goalDeleted', { goalId, online: true });
            return { success: true, offline: false };
          }
        } catch (error) {
          console.log('Server deletion failed, falling back to offline mode:', error);
        }
      }

      // Delete offline
      const result = await goalSyncService.deleteGoalOffline(goalId);
      
      if (result.success) {
        this.operationQueue.push(operation);
        
        if (showNotification) {
          this.showOfflineNotification('Goal deleted offline. Will sync when online.');
        }
        
        this.notifyListeners('goalDeleted', { goalId, offline: true });
        return result;
      }

      throw new Error('Failed to delete goal offline');

    } catch (error) {
      console.error('Error deleting goal:', error);
      
      if (showNotification) {
        Alert.alert('Error', `Failed to delete goal: ${error.message}`);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Batch operations for better performance
   */
  async batchCreateGoals(goalDataArray, options = {}) {
    const results = [];
    
    for (const goalData of goalDataArray) {
      const result = await this.createGoal(goalData, { 
        ...options, 
        showNotification: false 
      });
      results.push(result);
    }

    if (options.showNotification !== false) {
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      if (failCount === 0) {
        this.showSuccessNotification(`${successCount} goals created successfully!`);
      } else {
        Alert.alert(
          'Batch Operation Complete',
          `${successCount} goals created, ${failCount} failed.`
        );
      }
    }

    return {
      success: results.some(r => r.success),
      results,
      successCount: results.filter(r => r.success).length,
      failCount: results.filter(r => !r.success).length,
    };
  }

  /**
   * Smart sync that handles conflicts and retries
   */
  async smartSync(options = {}) {
    const { 
      forceSync = false, 
      resolveConflicts = true,
      showProgress = true 
    } = options;

    try {
      if (showProgress) {
        this.notifyListeners('syncStarted', { message: 'Starting smart sync...' });
      }

      // Check if sync is needed
      const syncNeeds = await GoalStorageManager.needsSync();
      
      if (!forceSync && !syncNeeds.needsSync) {
        if (showProgress) {
          this.showSuccessNotification('Goals are already up to date!');
        }
        return { success: true, reason: 'no_sync_needed' };
      }

      // Perform sync with conflict resolution
      const result = await goalSyncService.performSync(forceSync);
      
      if (result.success) {
        // Update cache
        memoizedGoalService.clearCache();
        await this.refreshLocalGoals();
        
        if (showProgress) {
          this.showSuccessNotification('Goals synchronized successfully!');
        }
        
        this.notifyListeners('syncCompleted', result);
        return result;
      }

      throw new Error(result.error || 'Sync failed');

    } catch (error) {
      console.error('Smart sync error:', error);
      
      if (showProgress) {
        Alert.alert('Sync Error', error.message);
      }
      
      this.notifyListeners('syncError', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Process queued operations when online
   */
  async processOperationQueue() {
    if (this.isProcessingQueue || this.operationQueue.length === 0) return;

    this.isProcessingQueue = true;
    const syncStatus = goalSyncService.getSyncStatus();

    if (!syncStatus.isOnline) {
      this.isProcessingQueue = false;
      return;
    }

    console.log(`📤 Processing ${this.operationQueue.length} queued operations`);

    const processedOperations = [];
    
    for (const operation of this.operationQueue) {
      try {
        let result;
        
        switch (operation.type) {
          case 'create':
            result = await SustainabilityGoalService.createGoal(operation.data, this.token);
            break;
          case 'update':
            result = await SustainabilityGoalService.updateGoal(
              operation.goalId, 
              operation.data, 
              this.token
            );
            break;
          case 'delete':
            result = await SustainabilityGoalService.deleteGoal(operation.goalId, this.token);
            break;
        }

        if (result.success) {
          operation.status = 'completed';
          processedOperations.push(operation.id);
          console.log(`✅ Processed queued ${operation.type} operation`);
        } else {
          throw new Error(result.error);
        }

      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount >= operation.maxRetries) {
          operation.status = 'failed';
          processedOperations.push(operation.id);
          console.error(`❌ Failed to process ${operation.type} operation:`, error);
        } else {
          console.log(`🔄 Retrying ${operation.type} operation (${operation.retryCount}/${operation.maxRetries})`);
        }
      }
    }

    // Remove processed operations
    this.operationQueue = this.operationQueue.filter(
      op => !processedOperations.includes(op.id)
    );

    this.isProcessingQueue = false;

    // Refresh local goals after processing
    if (processedOperations.length > 0) {
      await this.refreshLocalGoals();
      this.notifyListeners('queueProcessed', { 
        processed: processedOperations.length,
        remaining: this.operationQueue.length 
      });
    }
  }

  /**
   * Refresh local goals from server
   */
  async refreshLocalGoals() {
    try {
      const result = await memoizedGoalService.getUserGoals(this.token);
      
      if (result && !result.error) {
        await GoalStorageManager.storeGoals(result, true);
        return true;
      }
    } catch (error) {
      console.warn('Failed to refresh local goals:', error);
    }
    
    return false;
  }

  /**
   * Clear processed operations from sync results
   */
  clearProcessedOperations(syncResult) {
    if (syncResult.offlineChanges && syncResult.offlineChanges.successful > 0) {
      // Remove operations that were successfully synced
      this.operationQueue = this.operationQueue.filter(op => op.status !== 'completed');
      console.log(`🧹 Cleared ${syncResult.offlineChanges.successful} processed operations`);
    }
  }

  /**
   * Notification helpers
   */
  showSuccessNotification(message) {
    // In a real app, you might use a toast library
    setTimeout(() => {
      Alert.alert('Success', message, [{ text: 'OK' }]);
    }, 100);
  }

  showOfflineNotification(message) {
    // In a real app, you might use a toast library
    setTimeout(() => {
      Alert.alert('Offline Mode', message, [{ text: 'OK' }]);
    }, 100);
  }

  /**
   * Event listener management
   */
  addListener(callback) {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  notifyListeners(event, data = null) {
    this.eventListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in goal manager listener:', error);
      }
    });
  }

  /**
   * Get status and debug information
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      syncStatus: goalSyncService.getSyncStatus(),
      queuedOperations: this.operationQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      operations: this.operationQueue.map(op => ({
        id: op.id,
        type: op.type,
        status: op.status,
        retryCount: op.retryCount,
        timestamp: op.timestamp,
      })),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.syncUnsubscribe) {
      this.syncUnsubscribe();
    }
    
    this.eventListeners.clear();
    this.operationQueue = [];
    this.isInitialized = false;
    
    console.log('🧹 IntegratedOfflineGoalManager cleaned up');
  }
}

// Create singleton instance
const integratedGoalManager = new IntegratedOfflineGoalManager();

export default integratedGoalManager;
