/**
 * RealtimeGoalContext
 * Global context for real-time goal progress updates across the app
 */

import React, { createContext, useContext, useCallback, useState } from 'react';
import { Alert } from 'react-native';
import useRealtimeGoalUpdates from '../hooks/useRealtimeGoalUpdates';

const RealtimeGoalContext = createContext(null);

export const RealtimeGoalProvider = ({ children }) => {
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

  // Handle progress updates with milestone detection
  const handleProgressUpdate = useCallback((update) => {
    const { goal, oldPercentage, newPercentage } = update;
    const improvement = newPercentage - oldPercentage;
    
    console.log(`📈 Progress update for "${goal.title}": ${oldPercentage.toFixed(1)}% → ${newPercentage.toFixed(1)}% (+${improvement.toFixed(1)}%)`);
    
    // Check for milestone achievements
    const milestones = [25, 50, 75, 90];
    const targetPercentage = goal.goalConfig?.percentage || 100;
    const progressRatio = (newPercentage / targetPercentage) * 100;
    const oldProgressRatio = (oldPercentage / targetPercentage) * 100;

    // Find newly crossed milestones
    const newMilestones = milestones.filter(milestone => 
      progressRatio >= milestone && oldProgressRatio < milestone
    );

    // Show milestone notification for the highest milestone reached
    if (newMilestones.length > 0) {
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
    }

    // Check for streak achievements
    if (goal.progress?.streaks?.current >= 5 && (goal.progress?.streaks?.current % 5) === 0) {
      setTimeout(() => {
        setAchievementAnimation({
          visible: true,
          goal,
          type: 'streak',
          customMessage: `Amazing! You're on a ${goal.progress.streaks.current}-purchase sustainability streak!`,
        });
      }, 1500); // Delay to avoid conflict with milestone notification
    }

    // Show progress notification for significant improvements (>= 5%)
    if (improvement >= 5) {
      // Use Alert as fallback for smaller improvements
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

  // Animation control functions
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

  // Enhanced context value with additional utilities and animation controls
  const contextValue = {
    ...goalData,
    
    // Animation state
    achievementAnimation,
    milestoneNotification,
    
    // Animation controls
    closeAchievementAnimation,
    closeMilestoneNotification,
    triggerCustomAchievement,
    
    // Additional computed values
    hasActiveGoals: goalData.activeGoals.length > 0,
    hasAchievedGoals: goalData.achievedGoals.length > 0,
    totalGoalsCount: goalData.goals.length,
    
    // Progress summary
    overallProgress: goalData.goals.length > 0 
      ? goalData.goals.reduce((sum, goal) => sum + (goal.progress?.currentPercentage || 0), 0) / goalData.goals.length
      : 0,
      
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
    
    // Cart integration
    validateCartAgainstGoals: (cartItems) => {
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
    },
  };

  return (
    <RealtimeGoalContext.Provider value={contextValue}>
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

// HOC for components that need goal data
export const withRealtimeGoals = (Component) => {
  return function WrappedComponent(props) {
    const goalData = useRealtimeGoals();
    return <Component {...props} goalData={goalData} />;
  };
};

export default RealtimeGoalContext;
