/**
 * RealtimeGoalContext
 * Global context for real-time goal progress updates across the app
 * Enhanced with local storage sync and performance optimizations
 */

import React, { createContext, useContext, useCallback, useState, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import useRealtimeGoalUpdates from '../hooks/useRealtimeGoalUpdates';
import goalSyncService from '../utils/GoalSyncService';
import GoalStorageManager from '../utils/GoalStorageManager';
import { useAuth } from '../hooks/useAuthLogin';

const RealtimeGoalContext = createContext(null);

export const RealtimeGoalProvider = ({ children }) => {
  const { auth: token, user } = useAuth();
  
  // Initialize sync service
  useEffect(() => {
    if (token && user?.id) {
      goalSyncService.init(user.id, token);
    }
  }, [token, user?.id]);

  // Animation state management
  const [achievementAnimation, setAchievementAnimation] = useState({
    visible: false,
    goal: null,
    type: 'goal_achieved',
    customMessage: null,
  });

  const [milestoneNotification, setMilestoneNotification] = useState({
    visible: false,
    milestone: null,
    goal: null,
  });

  // Sync service state
  const [syncStatus, setSyncStatus] = useState(goalSyncService.getSyncStatus());
  const [offlineChanges, setOfflineChanges] = useState([]);

  // Listen to sync service events with memoized callbacks
  useEffect(() => {
    const unsubscribe = goalSyncService.addListener((event, data) => {
      switch (event) {
        case 'syncStart':
          setSyncStatus(goalSyncService.getSyncStatus());
          break;
        case 'syncComplete':
          setSyncStatus(goalSyncService.getSyncStatus());
          // Refresh goals after successful sync
          goalData.refreshGoals();
          break;
        case 'syncError':
          setSyncStatus(goalSyncService.getSyncStatus());
          Alert.alert('Sync Error', data.error);
          break;
        case 'networkChange':
          setSyncStatus(goalSyncService.getSyncStatus());
          break;
        case 'goalCreatedOffline':
        case 'goalUpdatedOffline':
        case 'goalDeletedOffline':
          // Update offline changes list
          GoalStorageManager.getOfflineChanges().then(setOfflineChanges);
          break;
      }
    });

    // Initial offline changes load
    GoalStorageManager.getOfflineChanges().then(setOfflineChanges);

    return unsubscribe;
  }, []);

  // Handle goal achievement notifications with animations
  const handleGoalAchieved = useCallback((goal) => {
    console.log('🎉 Goal achieved!', goal.title);
    
    // Show achievement animation
    setAchievementAnimation({
      visible: true,
      goal,
      type: 'goal_achieved',
      customMessage: null,
    });
  }, []);

  // Handle progress updates with milestone detection - memoized for performance
  const handleProgressUpdate = useCallback((update) => {
    const { goal, oldPercentage, newPercentage } = update;
    const improvement = newPercentage - oldPercentage;
    
    console.log(`📈 Progress update for "${goal.title}": ${oldPercentage.toFixed(1)}% → ${newPercentage.toFixed(1)}% (+${improvement.toFixed(1)}%)`);
    
    // Check for milestone achievements
    const milestones = [25, 50, 75, 90];
    const targetPercentage = goal.goalConfig?.percentage || 100;
    const progressRatio = (newPercentage / targetPercentage) * 100;
    const oldProgressRatio = (oldPercentage / targetPercentage) * 100;

    // Find newly crossed milestones - optimized with early return
    const newMilestones = milestones.filter(milestone => 
      progressRatio >= milestone && oldProgressRatio < milestone
    );

    if (newMilestones.length === 0) return; // Early return if no milestones

    // Show milestone notification for the highest milestone reached
    const highestMilestone = Math.max(...newMilestones);
    
    setMilestoneNotification({
      visible: true,
      milestone: {
        percentage: highestMilestone,
        previousPercentage: oldProgressRatio,
        currentPercentage: progressRatio,
      },
      goal,
    });

    // Check for streak achievements - memoized check
    const currentStreak = goal.progress?.streaks?.current;
    if (currentStreak >= 5 && (currentStreak % 5) === 0) {
      setTimeout(() => {
        setAchievementAnimation({
          visible: true,
          goal,
          type: 'streak',
          customMessage: `Amazing! You're on a ${currentStreak}-purchase sustainability streak!`,
        });
      }, 1500); // Delay to avoid conflict with milestone notification
    }

    // Show progress notification for significant improvements (>= 5%)
    if (improvement >= 5) {
      setTimeout(() => {
        Alert.alert(
          '📈 Progress Update',
          `Great progress on "${goal.title}"! You're now at ${newPercentage.toFixed(1)}% (+${improvement.toFixed(1)}%)`,
          [{ text: 'Nice!', style: 'default' }]
        );
      }, 3000); // Delay to show after milestone notification
    }
  }, []);

  // Initialize the hook with animation callbacks
  const goalData = useRealtimeGoalUpdates({
    enableCaching: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    onGoalAchieved: handleGoalAchieved,
    onProgressUpdate: handleProgressUpdate,
  });

  // Animation control functions - memoized for performance
  const closeAchievementAnimation = useCallback(() => {
    setAchievementAnimation(prev => ({ ...prev, visible: false }));
  }, []);

  const closeMilestoneNotification = useCallback(() => {
    setMilestoneNotification(prev => ({ ...prev, visible: false }));
  }, []);

  const triggerCustomAchievement = useCallback((type, goal, customMessage) => {
    setAchievementAnimation({
      visible: true,
      goal,
      type,
      customMessage,
    });
  }, []);

  // Offline goal management functions
  const createGoalOffline = useCallback(async (goalData) => {
    try {
      const result = await goalSyncService.createGoalOffline(goalData);
      if (result.success) {
        // Refresh local goals
        goalData.refreshGoals();
        // Update offline changes
        const changes = await GoalStorageManager.getOfflineChanges();
        setOfflineChanges(changes);
      }
      return result;
    } catch (error) {
      console.error('Error creating goal offline:', error);
      return { success: false, error: error.message };
    }
  }, [goalData]);

  const updateGoalOffline = useCallback(async (goalId, updateData) => {
    try {
      const result = await goalSyncService.updateGoalOffline(goalId, updateData);
      if (result.success) {
        // Refresh local goals
        goalData.refreshGoals();
        // Update offline changes
        const changes = await GoalStorageManager.getOfflineChanges();
        setOfflineChanges(changes);
      }
      return result;
    } catch (error) {
      console.error('Error updating goal offline:', error);
      return { success: false, error: error.message };
    }
  }, [goalData]);

  const deleteGoalOffline = useCallback(async (goalId) => {
    try {
      const result = await goalSyncService.deleteGoalOffline(goalId);
      if (result.success) {
        // Refresh local goals
        goalData.refreshGoals();
        // Update offline changes
        const changes = await GoalStorageManager.getOfflineChanges();
        setOfflineChanges(changes);
      }
      return result;
    } catch (error) {
      console.error('Error deleting goal offline:', error);
      return { success: false, error: error.message };
    }
  }, [goalData]);

  // Force sync function
  const forceSync = useCallback(async () => {
    try {
      const result = await goalSyncService.forcSync();
      return result;
    } catch (error) {
      console.error('Error forcing sync:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Get sync debug info
  const getSyncDebugInfo = useCallback(async () => {
    try {
      return await goalSyncService.getDebugInfo();
    } catch (error) {
      console.error('Error getting sync debug info:', error);
      return null;
    }
  }, []);

  // Enhanced context value with additional utilities and animation controls - memoized
  const contextValue = useMemo(() => ({
    ...goalData,
    
    // Animation state
    achievementAnimation,
    milestoneNotification,
    
    // Sync state
    syncStatus,
    offlineChanges,
    isOnline: syncStatus.isOnline,
    isSyncing: syncStatus.isSyncing,
    
    // Animation controls
    closeAchievementAnimation,
    closeMilestoneNotification,
    triggerCustomAchievement,
    
    // Offline goal management
    createGoalOffline,
    updateGoalOffline,
    deleteGoalOffline,
    forceSync,
    getSyncDebugInfo,
    
    // Additional computed values
    hasActiveGoals: goalData.activeGoals.length > 0,
    hasAchievedGoals: goalData.achievedGoals.length > 0,
    totalGoalsCount: goalData.goals.length,
    hasOfflineChanges: offlineChanges.length > 0,
    
    // Progress summary - memoized calculation
    overallProgress: goalData.goals.length > 0 
      ? goalData.goals.reduce((sum, goal) => sum + (goal.progress?.currentPercentage || 0), 0) / goalData.goals.length
      : 0,
  }), [
    goalData,
    achievementAnimation,
    milestoneNotification,  
    syncStatus,
    offlineChanges,
    closeAchievementAnimation,
    closeMilestoneNotification,
    triggerCustomAchievement,
    createGoalOffline,
    updateGoalOffline,
    deleteGoalOffline,
    forceSync,
    getSyncDebugInfo,
  ]);

  // Memoized helper functions for better performance
  const memoizedHelpers = useMemo(() => ({
    // Quick access methods
    getGoalById: (goalId) => goalData.goals.find(g => g._id === goalId),
    
    isGoalAchieved: (goalId) => {
      const goal = goalData.goals.find(g => g._id === goalId);
      return goal?.isAchieved || false;
    },
    
    getGoalProgress: (goalId) => {
      const goal = goalData.goals.find(g => g._id === goalId);
      return goal?.progress?.currentPercentage || 0;
    },
    
    // Batch operations
    refreshAllGoals: goalData.refreshGoals,
  }), [goalData]);

  // Cart validation - heavily memoized for performance
  const validateCartAgainstGoals = useCallback((cartItems) => {
    if (!goalData.activeGoals.length || !cartItems.length) {
      return {
        totalItems: cartItems.length,
        itemsMeetingAnyGoal: 0,
        overallCompliance: 0,
        goalValidation: {},
      };
    }
    
    const validation = {};
    let itemsMeetingAnyGoal = 0;
    
    cartItems.forEach(item => {
      const product = item.product || item;
      const goalAlignment = goalData.activeGoals.map(goal => {
        const alignment = goal.checkProductAlignment 
          ? goal.checkProductAlignment(product)
          : false; // Fallback if method not available
        return { goalId: goal._id, meetsGoal: alignment };
      });
      
      const meetsAnyGoal = goalAlignment.some(a => a.meetsGoal);
      const matchingGoals = goalAlignment.filter(a => a.meetsGoal).map(a => a.goalId);
      
      validation[item.id] = {
        meetsAnyGoal,
        matchingGoals,
        goalAlignment,
      };
      
      if (meetsAnyGoal) {
        itemsMeetingAnyGoal++;
      }
    });
    
    return {
      totalItems: cartItems.length,
      itemsMeetingAnyGoal,
      overallCompliance: cartItems.length > 0 ? (itemsMeetingAnyGoal / cartItems.length) * 100 : 0,
      goalValidation: validation,
    };
  }, [goalData.activeGoals]);

  // Final context value with memoized helpers
  const finalContextValue = useMemo(() => ({
    ...contextValue,
    ...memoizedHelpers,
    validateCartAgainstGoals,
  }), [contextValue, memoizedHelpers, validateCartAgainstGoals]);

  return (
    <RealtimeGoalContext.Provider value={finalContextValue}>
      {children}
    </RealtimeGoalContext.Provider>
  );
};

// Custom hook to use the goal context
export const useRealtimeGoals = () => {
  const context = useContext(RealtimeGoalContext);
  
  if (!context) {
    throw new Error('useRealtimeGoals must be used within a RealtimeGoalProvider');
  }
  
  return context;
};

// HOC for components that need goal data - memoized for performance
export const withRealtimeGoals = (Component) => {
  return React.memo(function WrappedComponent(props) {
    const goalData = useRealtimeGoals();
    return <Component {...props} goalData={goalData} />;
  });
};

export default RealtimeGoalContext;
