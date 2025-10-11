/**
 * useRealtimeGoalUpdates Hook
 * Provides real-time goal progress updates with caching and optimization
 * Enhanced with local storage sync and performance optimizations
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SustainabilityGoalService from '../api/sustainabilityGoalService';
import GoalStorageManager from '../utils/GoalStorageManager';
import goalSyncService from '../utils/GoalSyncService';
import { useAuth } from './useAuthLogin';

const CACHE_KEYS = {
  GOALS: '@sustainability_goals_cache',
  GOALS_STATS: '@sustainability_goals_stats_cache',
  LAST_UPDATE: '@goals_last_update',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useRealtimeGoalUpdates = (options = {}) => {
  const {
    enableCaching = true,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    onGoalAchieved,
    onProgressUpdate,
  } = options;

  const { auth: token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [goalStats, setGoalStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Refs for managing intervals and preventing race conditions
  const refreshIntervalRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const mountedRef = useRef(true);

  /**
   * Load goals from cache with enhanced storage manager integration
   */
  const loadFromCache = useCallback(async () => {
    if (!enableCaching) return null;

    try {
      // Use the enhanced GoalStorageManager for cache operations
      const cachedData = await GoalStorageManager.getGoals();
      
      if (cachedData.cached && !cachedData.expired) {
        console.log('📋 Loading goals from enhanced cache');
        
        // Also get stats from cache
        const statsData = await GoalStorageManager.getGoalStats();
        
        return {
          goals: cachedData.data,
          stats: statsData?.data || null,
          lastUpdate: cachedData.timestamp,
          fromServer: cachedData.fromServer,
        };
      }
    } catch (error) {
      console.warn('Failed to load goals from enhanced cache:', error);
    }
    
    return null;
  }, [enableCaching]);

  /**
   * Save goals to cache using enhanced storage manager
   */
  const saveToCache = useCallback(async (goalsData, statsData) => {
    if (!enableCaching) return;

    try {
      // Use GoalStorageManager for enhanced caching
      await Promise.all([
        GoalStorageManager.storeGoals(goalsData, true), // Mark as from server
        GoalStorageManager.storeGoalStats(statsData),
      ]);
      console.log('💾 Goals saved to enhanced cache');
    } catch (error) {
      console.warn('Failed to save goals to enhanced cache:', error);
    }
  }, [enableCaching]);

  /**
   * Fetch goals from API with optimistic updates and enhanced sync integration
   */
  const fetchGoals = useCallback(async (useCache = true) => {
    if (!token || isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    setError(null);

    try {
      // Load from cache first if requested
      if (useCache) {
        const cached = await loadFromCache();
        if (cached && mountedRef.current) {
          setGoals(cached.goals);
          setGoalStats(cached.stats);
          setLastUpdate(cached.lastUpdate);
          console.log('⚡ Goals loaded from enhanced cache, fetching fresh data in background');
        }
      }

      setLoading(!useCache || !goals.length); // Don't show loading if we have cached data

      // Check if we should prefer local data (if syncing is in progress or offline)
      const syncStatus = goalSyncService.getSyncStatus();
      if (!syncStatus.isOnline) {
        console.log('📱 Offline mode - loading from local storage only');
        const localData = await GoalStorageManager.getGoals(false);
        if (localData.cached && mountedRef.current) {
          setGoals(localData.data);
          const statsData = await GoalStorageManager.getGoalStats();
          setGoalStats(statsData?.data || null);
          setLastUpdate(localData.timestamp);
        }
        setLoading(false);
        return;
      }

      // Fetch fresh data from server with memoized service calls
      const [freshGoals, freshStats] = await Promise.all([
        SustainabilityGoalService.getUserGoals(token),
        SustainabilityGoalService.getGoalStats(token),
      ]);

      if (!mountedRef.current) return;

      // Memoized goal comparison for performance
      const previousGoalMap = useMemo(() => new Map(
        goals.map(g => [g._id, g])
      ), [goals]);

      // Check for newly achieved goals - optimized comparison
      if (goals.length > 0 && onGoalAchieved) {
        const previouslyAchieved = new Set(
          goals.filter(g => g.isAchieved).map(g => g._id)
        );
        
        const newlyAchieved = freshGoals.filter(
          g => g.isAchieved && !previouslyAchieved.has(g._id)
        );

        newlyAchieved.forEach(goal => {
          onGoalAchieved(goal);
        });
      }

      // Check for progress updates - memoized for performance
      if (goals.length > 0 && onProgressUpdate) {
        const progressUpdates = freshGoals
          .map(freshGoal => {
            const oldGoal = previousGoalMap.get(freshGoal._id);
            if (oldGoal && oldGoal.progress?.currentPercentage !== freshGoal.progress?.currentPercentage) {
              return {
                goal: freshGoal,
                oldPercentage: oldGoal.progress?.currentPercentage || 0,
                newPercentage: freshGoal.progress?.currentPercentage || 0,
              };
            }
            return null;
          })
          .filter(Boolean);

        progressUpdates.forEach(update => {
          onProgressUpdate(update);
        });
      }

      // Update state
      setGoals(freshGoals);
      setGoalStats(freshStats);
      setLastUpdate(Date.now());
      setLoading(false);

      // Save to enhanced cache
      await saveToCache(freshGoals, freshStats);

      console.log(`📊 Goals updated: ${freshGoals.length} goals, ${freshStats?.activeGoals || 0} active`);

    } catch (err) {
      console.error('Error fetching goals:', err);
      if (mountedRef.current) {
        setError(err.message);
        setLoading(false);
        
        // Try to load from local storage as fallback
        const localData = await GoalStorageManager.getGoals(false);
        if (localData.cached) {
          console.log('📱 Loading fallback data from local storage');
          setGoals(localData.data);
          const statsData = await GoalStorageManager.getGoalStats();
          setGoalStats(statsData?.data || null);
        }
      }
    } finally {
      isUpdatingRef.current = false;
    }
  }, [token, goals, loadFromCache, saveToCache, onGoalAchieved, onProgressUpdate]);

  /**
   * Force refresh goals (bypass cache)
   */
  const refreshGoals = useCallback(() => {
    return fetchGoals(false);
  }, [fetchGoals]);

  /**
   * Update progress for a specific purchase
   */
  const trackPurchaseProgress = useCallback(async (purchase) => {
    if (!goals.length || !purchase) return;

    try {
      console.log('🛒 Tracking purchase progress for goals');
      
      // Optimistically update goals based on purchase
      const updatedGoals = await Promise.all(
        goals.map(async (goal) => {
          try {
            // Use the service to check if any items in the purchase meet this goal
            const purchaseItems = purchase.items || [];
            const goalAlignment = purchaseItems.map(item => 
              SustainabilityGoalService.checkProductMeetsGoals(item.product, [goal])
            );
            
            const itemsMeetingGoal = goalAlignment.filter(a => a.meetsAnyGoal).length;
            
            if (itemsMeetingGoal > 0) {
              // Calculate new progress optimistically
              const newTotalItems = (goal.progress?.totalPurchases || 0) + purchaseItems.length;
              const newGoalMetItems = (goal.progress?.goalMetPurchases || 0) + itemsMeetingGoal;
              const newPercentage = newTotalItems > 0 ? (newGoalMetItems / newTotalItems) * 100 : 0;
              
              return {
                ...goal,
                progress: {
                  ...goal.progress,
                  totalPurchases: newTotalItems,
                  goalMetPurchases: newGoalMetItems,
                  currentPercentage: newPercentage,
                },
                isAchieved: newPercentage >= (goal.goalConfig?.percentage || 100),
              };
            }
            
            return goal;
          } catch (error) {
            console.warn(`Error updating goal ${goal.title}:`, error);
            return goal;
          }
        })
      );

      // Update state with optimistic updates
      setGoals(updatedGoals);

      // Schedule a refresh to get accurate data from the server
      setTimeout(() => {
        refreshGoals();
      }, 2000);

    } catch (error) {
      console.error('Error tracking purchase progress:', error);
    }
  }, [goals, refreshGoals]);

  /**
   * Get active goals only - memoized for performance
   */
  const activeGoals = useMemo(() => goals.filter(goal => goal.isActive), [goals]);

  /**
   * Get achieved goals only - memoized for performance
   */
  const achievedGoals = useMemo(() => goals.filter(goal => goal.isAchieved), [goals]);

  /**
   * Check if any goals are close to achievement (>80% progress) - memoized
   */
  const goalsNearCompletion = useMemo(() => goals.filter(goal => 
    !goal.isAchieved && goal.progress?.currentPercentage >= 80
  ), [goals]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !token) return;

    // Initial load
    fetchGoals(true);

    // Setup interval
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchGoals(true);
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, token, refreshInterval, fetchGoals]);

  // Handle app state changes (refresh when app becomes active)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && token) {
        // App became active, refresh goals
        fetchGoals(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [token, fetchGoals]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Memoized return value for performance optimization
  return useMemo(() => ({
    // Data
    goals,
    activeGoals,
    achievedGoals,
    goalsNearCompletion,
    goalStats,
    
    // State
    loading,
    error,
    lastUpdate,
    
    // Actions
    refreshGoals,
    trackPurchaseProgress,
    
    // Utils
    isUpdating: isUpdatingRef.current,
    
    // Sync integration
    syncStatus: goalSyncService.getSyncStatus(),
    isOnline: goalSyncService.getSyncStatus().isOnline,
    hasOfflineChanges: false, // Will be populated by context
    
    // Performance metrics
    cacheHitRatio: goals.length > 0 ? 1 : 0, // Placeholder for cache metrics
  }), [
    goals,
    activeGoals,
    achievedGoals,
    goalsNearCompletion,
    goalStats,
    loading,
    error,
    lastUpdate,
    refreshGoals,
    trackPurchaseProgress,
  ]);
};

export default useRealtimeGoalUpdates;
