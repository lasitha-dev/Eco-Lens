/**
 * useRealtimeGoalUpdates Hook
 * Provides real-time goal progress updates with caching and optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SustainabilityGoalService from '../api/sustainabilityGoalService';
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
   * Load goals from cache if available and valid
   */
  const loadFromCache = useCallback(async () => {
    if (!enableCaching) return null;

    try {
      const [cachedGoals, cachedStats, lastUpdateStr] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.GOALS),
        AsyncStorage.getItem(CACHE_KEYS.GOALS_STATS),
        AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE),
      ]);

      if (cachedGoals && cachedStats && lastUpdateStr) {
        const lastUpdateTime = parseInt(lastUpdateStr, 10);
        const now = Date.now();
        
        if (now - lastUpdateTime < CACHE_DURATION) {
          console.log('📋 Loading goals from cache');
          return {
            goals: JSON.parse(cachedGoals),
            stats: JSON.parse(cachedStats),
            lastUpdate: lastUpdateTime,
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load goals from cache:', error);
    }
    
    return null;
  }, [enableCaching]);

  /**
   * Save goals to cache
   */
  const saveToCache = useCallback(async (goalsData, statsData) => {
    if (!enableCaching) return;

    try {
      const now = Date.now();
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEYS.GOALS, JSON.stringify(goalsData)),
        AsyncStorage.setItem(CACHE_KEYS.GOALS_STATS, JSON.stringify(statsData)),
        AsyncStorage.setItem(CACHE_KEYS.LAST_UPDATE, now.toString()),
      ]);
      console.log('💾 Goals saved to cache');
    } catch (error) {
      console.warn('Failed to save goals to cache:', error);
    }
  }, [enableCaching]);

  /**
   * Fetch goals from API with optimistic updates
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
          console.log('⚡ Goals loaded from cache, fetching fresh data in background');
        }
      }

      setLoading(!useCache || !goals.length); // Don't show loading if we have cached data

      // Fetch fresh data
      const [freshGoals, freshStats] = await Promise.all([
        SustainabilityGoalService.getUserGoals(token),
        SustainabilityGoalService.getGoalStats(token),
      ]);

      if (!mountedRef.current) return;

      // Check for newly achieved goals
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

      // Check for progress updates
      if (goals.length > 0 && onProgressUpdate) {
        const progressUpdates = freshGoals
          .map(freshGoal => {
            const oldGoal = goals.find(g => g._id === freshGoal._id);
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

      // Save to cache
      await saveToCache(freshGoals, freshStats);

      console.log(`📊 Goals updated: ${freshGoals.length} goals, ${freshStats?.activeGoals || 0} active`);

    } catch (err) {
      console.error('Error fetching goals:', err);
      if (mountedRef.current) {
        setError(err.message);
        setLoading(false);
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
   * Get active goals only
   */
  const activeGoals = goals.filter(goal => goal.isActive);

  /**
   * Get achieved goals only
   */
  const achievedGoals = goals.filter(goal => goal.isAchieved);

  /**
   * Check if any goals are close to achievement (>80% progress)
   */
  const goalsNearCompletion = goals.filter(goal => 
    !goal.isAchieved && 
    goal.progress?.currentPercentage >= 80
  );

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

  return {
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
  };
};

export default useRealtimeGoalUpdates;
