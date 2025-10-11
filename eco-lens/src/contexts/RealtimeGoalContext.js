/**
 * RealtimeGoalContext
 * Global context for real-time goal progress updates across the app
 */

import React, { createContext, useContext, useCallback } from 'react';
import { Alert } from 'react-native';
import useRealtimeGoalUpdates from '../hooks/useRealtimeGoalUpdates';

const RealtimeGoalContext = createContext(null);

export const RealtimeGoalProvider = ({ children }) => {
  // Handle goal achievement notifications
  const handleGoalAchieved = useCallback((goal) => {
    console.log('🎉 Goal achieved!', goal.title);
    
    // Show achievement notification
    Alert.alert(
      '🏆 Goal Achieved!',
      `Congratulations! You've completed your "${goal.title}" sustainability goal!`,
      [
        {
          text: 'View Progress',
          onPress: () => {
            // You could navigate to the goal progress screen here
            console.log('Navigate to goal progress for:', goal._id);
          },
        },
        {
          text: 'Great!',
          style: 'default',
        },
      ]
    );
  }, []);

  // Handle progress updates
  const handleProgressUpdate = useCallback((update) => {
    const { goal, oldPercentage, newPercentage } = update;
    const improvement = newPercentage - oldPercentage;
    
    console.log(`📈 Progress update for "${goal.title}": ${oldPercentage.toFixed(1)}% → ${newPercentage.toFixed(1)}% (+${improvement.toFixed(1)}%)`);
    
    // Show progress notification for significant improvements
    if (improvement >= 5) {
      Alert.alert(
        '📈 Progress Update',
        `Great progress on "${goal.title}"! You're now at ${newPercentage.toFixed(1)}% (+${improvement.toFixed(1)}%)`,
        [{ text: 'Nice!', style: 'default' }]
      );
    }
  }, []);

  // Initialize the hook with callbacks
  const goalData = useRealtimeGoalUpdates({
    enableCaching: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    onGoalAchieved: handleGoalAchieved,
    onProgressUpdate: handleProgressUpdate,
  });

  // Enhanced context value with additional utilities
  const contextValue = {
    ...goalData,
    
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
